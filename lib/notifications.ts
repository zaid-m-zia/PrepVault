import supabase from './supabaseClient'

type NotificationPayload = {
  user_id: string
  actor_id?: string
  type: string
  content: string
  entity_id?: string
  read?: boolean
  related_id?: string
  is_read?: boolean
  dedupe?: boolean
}

export async function createNotification(payload: NotificationPayload) {
  const entityId = payload.entity_id ?? payload.related_id
  const read = payload.read ?? payload.is_read ?? false

  if (payload.dedupe !== false && entityId) {
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', payload.user_id)
      .eq('type', payload.type)
      .eq('entity_id', entityId)
      .maybeSingle()

    if (existing?.id) {
      return { error: null }
    }
  }

  const basePayload = {
    user_id: payload.user_id,
    actor_id: payload.actor_id ?? null,
    type: payload.type,
    entity_id: entityId,
    content: payload.content,
    read,
  }

  const { error } = await supabase.from('notifications').insert(basePayload)

  if (!error) return { error: null }

  const message = error.message?.toLowerCase?.() || ''
  const typeConstraintError =
    message.includes('check constraint') ||
    message.includes('violates') ||
    message.includes('invalid input value for enum')

  if (!typeConstraintError) {
    return { error }
  }

  const fallbackPayload = {
    user_id: payload.user_id,
    actor_id: payload.actor_id ?? null,
    type: 'message',
    entity_id: entityId,
    content: `[${payload.type}] ${payload.content}`,
    read,
  }

  const { error: fallbackError } = await supabase.from('notifications').insert(fallbackPayload)
  return { error: fallbackError }
}
