export type LearningIntent = 'roadmap' | 'module' | 'search'

export type LearningIntentResult = {
  intent: LearningIntent
  topic: string
}

function normalizeIntent(intent: unknown): LearningIntent {
  if (intent === 'roadmap' || intent === 'module' || intent === 'search') return intent
  return 'search'
}

export async function parseLearningIntent(query: string): Promise<LearningIntentResult> {
  const fallback: LearningIntentResult = { intent: 'search', topic: query }

  try {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return fallback

    const response = await fetch('/api/ai-intent-parser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: trimmedQuery }),
    })

    if (!response.ok) return fallback

    const data = await response.json()
    const intent = normalizeIntent(data?.intent)
    const topic = String(data?.topic ?? '').trim() || trimmedQuery

    return { intent, topic }
  } catch (error) {
    console.error('parseLearningIntent error:', error)
    return fallback
  }
}
