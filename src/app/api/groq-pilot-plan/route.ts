/**
 * API route to serve saved Groq pilot plans
 * Development only - no API calls, just file reads
 */

import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function GET(request: NextRequest) {
  // Development only
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const searchParams = request.nextUrl.searchParams
  const file = searchParams.get('file')

  if (!file) {
    return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 })
  }

  // Security: only allow specific pilot result files
  if (!file.match(/^(anniversary|sympathy)-test-[ab]-attempt\d+-retry\d+-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.json$/)) {
    return NextResponse.json({ error: 'Invalid file name' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), '.experiments', 'groq', 'run-pilot', file)

  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const result = JSON.parse(content)

    // Return only the plan, not full result metadata
    if (result.success && result.plan) {
      return NextResponse.json({
        plan: result.plan,
        configVersion: result.configVersion,
        timestamp: result.timestamp
      })
    } else {
      return NextResponse.json({ error: 'No plan in result' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error loading pilot plan:', error)
    return NextResponse.json({ error: 'Failed to load plan' }, { status: 500 })
  }
}
