/**
 * Check Groq API Quota and Test Connectivity
 * Verifies we can make requests within free tier limits
 */

async function checkGroqQuota() {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    console.error('❌ GROQ_API_KEY not found in environment')
    process.exit(1)
  }

  console.log('🔍 Checking Groq API connectivity and quota...\n')

  try {
    // Make a minimal test request to check quota
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'user', content: 'Say "ok"' }
        ],
        max_tokens: 5
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Groq API Error:', response.status)
      console.error('Response:', errorText.substring(0, 500))

      if (response.status === 429) {
        console.error('\n⚠️  Rate limit exceeded - free tier quota exhausted')
        console.error('Wait for quota reset or use mock mode for testing')
      } else if (response.status === 401) {
        console.error('\n⚠️  Authentication failed - check GROQ_API_KEY')
      }

      process.exit(1)
    }

    const data = await response.json()

    console.log('✅ Groq API connected successfully')
    console.log(`   Model: ${data.model || 'openai/gpt-oss-120b'}`)
    console.log(`   Response: "${data.choices[0]?.message?.content || 'N/A'}"`)

    if (data.usage) {
      console.log(`   Tokens used: ${data.usage.total_tokens || 0}`)
    }

    console.log('\n✅ Ready for live Groq testing within free tier\n')

  } catch (error) {
    console.error('❌ Failed to connect to Groq:', error)
    process.exit(1)
  }
}

checkGroqQuota()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err)
    process.exit(1)
  })
