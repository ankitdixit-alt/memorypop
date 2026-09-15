import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { getStory, buildBeats, readingMs, estimateSeconds, groupPhotos, type Occasion, type Asset } from '../src/app/ai-director-reveal/prototype'
import { isLocalPreview } from '../src/app/ai-director-reveal/previewGuard'

const occasions: Occasion[] = ['birthday','retirement','anniversary','sympathy']
for (const occasion of occasions) for (const preset of ['same','tier'] as const) for (const mode of ['standard','director'] as const) {
  test(occasion + ' / ' + preset + ' / ' + mode + ': no lost, duplicated, or misattributed contributions/assets', () => {
    const story = getStory(occasion,preset,mode), beats = buildBeats(story,mode)
    assert.equal(new Set(beats.map(b=>b.id)).size, beats.length)
    assert.equal(beats.filter(b=>b.introducesMessage).length,story.memories.length)
    for (const memory of story.memories) {
      const own = beats.filter(b=>b.memory?.id === memory.id)
      assert.equal(own.filter(b=>b.introducesMessage).length,1)
      assert.deepEqual(own.flatMap(b=>b.assets.map(a=>a.id)),memory.assets.map(a=>a.id))
      assert.ok(own.every(b=>b.memory?.message === memory.message && b.memory.name === memory.name))
      const positions = beats.map((b,i)=>b.memory?.id===memory.id?i:-1).filter(i=>i>=0)
      assert.equal(positions.at(-1)! - positions[0]+1, positions.length, 'Contribution must be contiguous')
    }
    const order=beats.filter(b=>b.introducesMessage)
    assert.deepEqual(order.map(b=>b.ordinal), Array.from({length:story.memories.length},(_,i)=>i+1))
    if (mode==='director') assert.equal(order.at(-1)?.memory?.id,story.finale)
    else assert.deepEqual(order.map(b=>b.memory?.id),[...story.memories].sort((a,b)=>b.createdAt-a.createdAt).map(m=>m.id))
    assert.equal(beats.at(-1)?.kind,'closing')
  })
}
for (const occasion of occasions) test(occasion + ': same-content equality and repeatability', () => {
  const a=getStory(occasion,'same','director'), b=getStory(occasion,'same','standard')
  assert.deepEqual(a.memories,b.memories)
  assert.deepEqual(a,getStory(occasion,'same','director'))
  assert.deepEqual(buildBeats(a,'director'),buildBeats(a,'director'))
})
test('Birthday demonstrates the configured 10/3/90 vs 3/1/15 allowances', () => {
  for (const [mode,photos,gifs,seconds] of [['director',10,3,90],['standard',3,1,15]] as const) {
    const story=getStory('birthday','tier',mode), hero=story.memories[0]
    assert.equal(hero.assets.filter(a=>a.kind==='photo').length,photos)
    assert.equal(hero.assets.filter(a=>a.kind==='gif').length,gifs)
    assert.equal(hero.assets.find(a=>a.kind==='video')?.seconds,seconds)
    for (const m of story.memories) {
      assert.ok(m.assets.filter(a=>a.kind==='photo').length<=photos)
      assert.ok(m.assets.filter(a=>a.kind==='gif').length<=gifs)
      assert.ok((m.assets.find(a=>a.kind==='video')?.seconds||0)<=seconds)
    }
  }
})
test('One, three and ten photos produce complete, bounded collections', () => {
  const photos=getStory('birthday','tier','director').memories[0].assets.filter(a=>a.kind==='photo')
  assert.deepEqual(groupPhotos(photos.slice(0,1)).map(g=>g.length),[1])
  assert.deepEqual(groupPhotos(photos.slice(0,3)).map(g=>g.length),[3])
  assert.deepEqual(groupPhotos(photos).map(g=>g.length),[1,3,3,3])
  assert.deepEqual(groupPhotos(photos).flat(),photos)
})
test('Long prose keeps reading time; full video is included in the estimate', () => {
  assert.equal(readingMs('word '.repeat(100)),30700)
  const beats=buildBeats(getStory('birthday','tier','director'),'director')
  const videoMs=beats.filter(b=>b.presentation==='video').reduce((s,b)=>s+b.assets[0].seconds!*1000,0)
  assert.ok(videoMs>=90000)
  assert.equal(estimateSeconds(beats,1),Math.ceil((videoMs+beats.reduce((s,b)=>s+b.durationMs,0))/1000))
  assert.ok(Math.abs(estimateSeconds(beats,1)/2-estimateSeconds(beats,2))<=1)
  assert.ok(beats.filter(b=>b.presentation==='video').every(b=>b.durationMs===0))
})
test('Overlapping/unassigned plan entries normalize without deleting equal-text contributions', () => {
  const story=getStory('birthday','same','director')
  story.chapters[0].ids.push(story.finale,story.memories[0].id,'unknown')
  story.chapters[1].ids=[]
  story.memories[1].message=story.memories[0].message
  const beats=buildBeats(story,'director')
  assert.equal(beats.filter(b=>b.introducesMessage).length,story.memories.length)
  assert.equal(beats.filter(b=>b.introducesMessage && b.memory?.message===story.memories[0].message).length,2)
  assert.equal(beats.filter(b=>b.introducesMessage).at(-1)?.memory?.id,story.finale)
})
test('Empty, text-only and video-only stories are safe; message precedes speech', () => {
  const story=getStory('birthday','same','director')
  assert.equal(buildBeats({...story,memories:[]},'director')[0].kind,'closing')
  const memory={...story.memories[0], assets:[] as Asset[]}
  let beats=buildBeats({...story,memories:[memory]},'director')
  assert.equal(beats.filter(b=>b.kind==='memory').length,1)
  memory.assets=story.memories[0].assets.filter(a=>a.kind==='video')
  beats=buildBeats({...story,memories:[memory]},'director')
  const own=beats.filter(b=>b.kind==='memory')
  assert.equal(own[0].presentation,'letter')
  assert.equal(own[0].introducesMessage,true)
  assert.equal(own[1].presentation,'video')
  assert.equal(own[1].introducesMessage,false)
})
test('Production, test and non-loopback hosts are rejected', () => {
  for (const host of ['localhost:3000','127.0.0.1:3100','[::1]:3000']) assert.equal(isLocalPreview('development',host),true)
  for (const host of [null,'example.com','localhost.evil:3000','192.168.1.2:3000']) assert.equal(isLocalPreview('development',host),false)
  for (const env of ['production','test',undefined]) assert.equal(isLocalPreview(env,'localhost:3000'),false)
})
test('Every referenced media file is local and exists', () => {
  for (const occasion of occasions) for (const mode of ['standard','director'] as const) {
    const story=getStory(occasion,'tier',mode)
    for (const a of story.memories.flatMap(m=>m.assets)) for (const url of [a.url,a.poster].filter(Boolean) as string[]) {
      assert.ok(url.startsWith('/ai-director-reveal/media/'))
      assert.ok(existsSync(join(process.cwd(),'scripts/fixtures/reveal-media',url.split('/').at(-1)!)),url)
    }
  }
})
test('GIFs have multiple frames, and 90-second H264/AAC sample is actually playable media', () => {
  const probe=(name:string,args:string[]) => {
    const result=spawnSync('ffprobe',['-v','error',...args,'-of','json','scripts/fixtures/reveal-media/'+name],{encoding:'utf8'})
    assert.equal(result.status,0,result.stderr)
    return JSON.parse(result.stdout)
  }
  for (let i=1;i<=3;i++) {
    const info=probe('celebrate-'+i+'.gif',['-count_frames','-show_streams'])
    assert.ok(Number(info.streams[0].nb_read_frames)>1)
  }
  for (const duration of [8,10,12,15,18,22,90]) {
    const info=probe('sample-'+duration+'.mp4',['-show_streams','-show_format'])
    assert.ok(Math.abs(Number(info.format.duration)-duration)<0.15)
    assert.ok(info.streams.some((s:{codec_name:string})=>s.codec_name==='h264'))
    assert.ok(info.streams.some((s:{codec_name:string})=>s.codec_name==='aac'))
  }
})
test('Active preview has no provider, database, analytics or remote media imports', () => {
  const paths=['page.tsx','RevealPreview.tsx','PreviewMedia.tsx','prototype.ts','usePlayback.ts','previewGuard.ts','media/[asset]/route.ts']
  for (const name of paths) {
    const content=readFileSync('src/app/ai-director-reveal/'+name,'utf8')
    const imports=content.match(/(?:import|from)\s+['"][^'"]+['"]/g)||[]
    assert.ok(imports.every(i=>!/@supabase|providers|sentry|mixpanel|gemini/i.test(i)),name)
    assert.ok(!/https?:\/\//.test(content),name)
    assert.ok(!/GEMINI_API_KEY|VIDEO_VALIDATION_SECRET|NEXT_PUBLIC_/.test(content),name)
  }
})

