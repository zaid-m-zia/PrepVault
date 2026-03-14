import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

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

    const systemPrompt = `Extract the main study topic from this query.

Return JSON only in this format:
{"topic":"..."}

  If the query is ambiguous, return the most likely concise study topic.`

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
            content: systemPrompt,
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
      return NextResponse.json({ topic: query })
    }

    const topic = String(parsed.topic ?? '').trim() || query

    return NextResponse.json({ topic })
  } catch (error) {
    console.error('Intent parser route error:', error)
    return NextResponse.json({ error: 'Topic extraction unavailable' }, { status: 500 })
  }
}
