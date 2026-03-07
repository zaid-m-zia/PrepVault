'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

type MessageButtonProps = {
  profileId: string
  username: string
}

export default function MessageButton({ profileId, username }: MessageButtonProps) {
  const router = useRouter()

  function handleMessage() {
    router.push(`/chat?user=${profileId}`)
  }

  return (
    <motion.button
      onClick={handleMessage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-6 py-2 rounded-md glass border border-white/10 text-secondary-text hover:border-white/20 transition-all"
    >
      Message
    </motion.button>
  )
}