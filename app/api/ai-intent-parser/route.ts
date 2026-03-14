import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type Intent = 'roadmap' | 'module' | 'search'

function normalizeIntent(value: unknown): Intent {
  if (value === 'roadmap' || value === 'module' || value === 'search') return value
  return 'search'
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null

    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const query = String(body?.query ?? '').trim()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are an AI that extracts study topics from search queries.

Return JSON only.

Detect:
intent: roadmap | module | search
topic: main learning topic

Examples:

Query: I want to learn DSA for placements
Output:
{"intent":"roadmap","topic":"data structures and algorithms"}

Query: recursion notes
Output:
{"intent":"search","topic":"recursion"}

Query: teach me recursion
Output:
{"intent":"roadmap","topic":"recursion"}`,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.1,
        max_tokens: 120,
      }),
    })

    const data = await groqResponse.json()

    if (!groqResponse.ok) {
      console.error('Groq intent parser error:', data)
      return NextResponse.json({ error: 'Intent parsing unavailable' }, { status: 500 })
    }

    const content = String(data?.choices?.[0]?.message?.content ?? '').trim()
    const parsed = extractJsonObject(content)

    if (!parsed) {
      return NextResponse.json({ intent: 'search', topic: query })
    }

    const intent = normalizeIntent(parsed.intent)
    const topic = String(parsed.topic ?? '').trim() || query

    return NextResponse.json({ intent, topic })
  } catch (error) {
    console.error('Intent parser route error:', error)
    return NextResponse.json({ error: 'Intent parsing unavailable' }, { status: 500 })
  }
}
