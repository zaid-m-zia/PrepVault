export async function extractSearchTopic(query: string): Promise<{ topic: string; ok: boolean }> {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return { topic: query, ok: false }
  }

  try {
    const response = await fetch('/api/ai-intent-parser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: trimmedQuery }),
    })

    if (!response.ok) {
      return { topic: query, ok: false }
    }

    const data = await response.json()
    const topic = String(data?.topic ?? '').trim()
    if (!topic) {
      return { topic: query, ok: false }
    }

    return { topic, ok: true }
  } catch (error) {
    console.error('extractSearchTopic error:', error)
    return { topic: query, ok: false }
  }
}
