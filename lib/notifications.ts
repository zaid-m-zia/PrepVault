import supabase from './supabaseClient'

type NotificationPayload = {
  user_id: string
  type: string
  content: string
  related_id?: string
  is_read?: boolean
}

export async function createNotification(payload: NotificationPayload) {
  const basePayload = {
    user_id: payload.user_id,
    type: payload.type,
    content: payload.content,
    related_id: payload.related_id,
    is_read: payload.is_read ?? false,
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
    type: 'message',
    content: `[${payload.type}] ${payload.content}`,
    related_id: payload.related_id,
    is_read: payload.is_read ?? false,
  }

  const { error: fallbackError } = await supabase.from('notifications').insert(fallbackPayload)
  return { error: fallbackError }
}
