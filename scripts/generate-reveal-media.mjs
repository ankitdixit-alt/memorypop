// Offline fixture generation only. Requires ffmpeg with drawtext and flite.
// No network, API keys, uploads or production data. Run from repository root.
import { mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const out = join(process.cwd(), 'scripts/fixtures/reveal-media')
mkdirSync(out, {recursive:true})
function ffmpeg(args) {
  const result = spawnSync('ffmpeg', ['-hide_banner','-loglevel','error','-y', ...args], {stdio:'inherit'})
  if (result.status !== 0) throw new Error('Fixture generation failed. Check your local ffmpeg installation.')
}
for (let i=1; i<=4; i++) copyFileSync('public/images/avatar-' + i + '.png', join(out, 'photo-0' + i + '.png'))
// Six deliberately illustrated images extend the supplied synthetic portraits.
// Mixed aspect ratios test containment without inventing photographic evidence.
const captions = ['The open road','A little celebration','One more chapter','By the water','The places we go','Home, together']
const palettes = [['#e9dec7','#779289','#c97350'],['#f4dfce','#cb9579','#986c4c'],['#eadabf','#8c9680','#526d69'],['#dfe7df','#899f9b','#d2a279'],['#e2d9cf','#979a86','#b7684b'],['#eddfd5','#9b8772','#d9aa78']]
for (let i=5; i<=10; i++) {
  const p=palettes[i-5], w=i%2 ? 1000:720, h=i%2 ? 700:940
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'">'+
    '<rect width="'+w+'" height="'+h+'" fill="'+p[0]+'"/>'+
    '<circle cx="'+(w*.74)+'" cy="'+(h*.23)+'" r="'+(w*.1)+'" fill="'+p[2]+'" opacity=".8"/>'+
    '<path d="M0 '+(h*.65)+' Q'+(w*.22)+' '+(h*.22)+' '+(w*.49)+' '+(h*.60)+' T'+w+' '+(h*.56)+' V'+h+' H0Z" fill="'+p[1]+'"/>'+
    '<path d="M0 '+(h*.77)+' Q'+(w*.5)+' '+(h*.54)+' '+w+' '+(h*.79)+' V'+h+' H0Z" fill="'+p[2]+'" opacity=".7"/>'+
    '<rect x="'+(w*.08)+'" y="'+(h*.78)+'" width="'+(w*.84)+'" height="'+(h*.15)+'" rx="3" fill="#fff8ed" opacity=".95"/>'+
    '<text x="'+(w*.5)+'" y="'+(h*.845)+'" text-anchor="middle" font-family="Georgia,serif" font-size="'+(w*.045)+'" fill="#483b2d">'+captions[i-5]+'</text>'+
    '<text x="'+(w*.5)+'" y="'+(h*.885)+'" text-anchor="middle" font-family="Arial,sans-serif" font-size="'+(w*.014)+'" letter-spacing="3" fill="#7b6853">ILLUSTRATED SYNTHETIC FIXTURE '+i+'</text></svg>'
  writeFileSync(join(out,'photo-'+String(i).padStart(2,'0')+'.svg'),svg)
}
const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
const fontArg = process.platform === 'linux' ? 'fontfile='+font+':' : ''
for (let i=1; i<=3; i++) {
  const text = ['CHEERS','WITH LOVE','HOORAY'][i-1]
  const filter = 'drawtext='+fontArg+"text='"+text+"':fontcolor=0xb44b39:fontsize=34:x=(w-tw)/2:y=(h-th)/2+14*sin(3*t)"
  ffmpeg(['-f','lavfi','-i','color=c=0xf5e8d4:s=480x360:r=12:d=3','-vf',filter, '-loop','0', join(out,'celebrate-'+i+'.gif')])
  ffmpeg(['-i',join(out,'celebrate-'+i+'.gif'),'-frames:v','1',join(out,'celebrate-'+i+'.png')])
}
const speech = 'This is a synthetic Memory Pop playback sample. It tests video controls and sound. You can pause, seek, change speed, or move to the next memory. No real personal recording is used.'
writeFileSync(join(out,'sample-voice.txt'), speech)
ffmpeg(['-f','lavfi','-i','flite=textfile='+join(out,'sample-voice.txt')+':voice=slt','-af','apad','-t','90','-ar','44100',join(out,'sample-voice.wav')])
for (const duration of [8,10,12,15,18,22,90]) {
  const filter = 'drawtext='+fontArg+"text='LOCAL SYNTHETIC VIDEO':fontcolor=0xfff8ef:fontsize=28:x=(w-tw)/2:y=140,"+
    'drawtext='+fontArg+"text='Playback sample - "+duration+" seconds':fontcolor=0xe4b79b:fontsize=19:x=(w-tw)/2:y=194,"+
    'drawtext='+fontArg+"text='%{pts\\:hms}':fontcolor=0xfff8ef:fontsize=22:x=(w-tw)/2:y=240,"+
    'drawtext='+fontArg+"text='o':fontcolor=0xdc9677:fontsize=36:x=30+650*t/"+duration+":y=310"
  ffmpeg(['-f','lavfi','-i','color=c=0x39473f:s=720x406:r=12','-i',join(out,'sample-voice.wav'),
    '-vf',filter,'-t',String(duration),'-c:v','libx264','-preset','ultrafast','-crf','27','-pix_fmt','yuv420p',
    '-c:a','aac','-b:a','64k','-movflags','+faststart',join(out,'sample-'+duration+'.mp4')])
}
ffmpeg(['-f','lavfi','-i','sine=frequency=220:duration=12','-f','lavfi','-i','sine=frequency=330:duration=12',
  '-filter_complex','[0:a][1:a]amix=inputs=2,volume=0.3,afade=t=in:d=1,afade=t=out:st=11:d=1','-ar','22050',join(out,'ambient.wav')])
rmSync(join(out,'sample-voice.wav'))
rmSync(join(out,'sample-voice.txt'))
console.log('Generated local reveal media in ' + out)
