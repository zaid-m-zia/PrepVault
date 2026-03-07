'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

type MessageLimitPopupProps = {
  recipientUsername: string
  onClose: () => void
}

export default function MessageLimitPopup({
  recipientUsername,
  onClose,
}: MessageLimitPopupProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-xl p-8 border border-white/10 max-w-md w-full shadow-2xl"
      >
        <div className="mb-6">
          <h3 className="text-xl font-display font-semibold mb-2">Message Limit Reached</h3>
          <p className="text-secondary-text text-sm">
            You can only send 2 messages to users you're not following. Follow{' '}
            <span className="font-semibold text-primary-text">@{recipientUsername}</span> to continue
            messaging them.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/profile/${recipientUsername}`}
            className="block w-full px-4 py-3 glass rounded-lg border border-cyan-400/50 bg-gradient-to-r from-cyan-500/30 to-cyan-600/20 hover:from-cyan-500/50 hover:to-cyan-600/30 transition-all text-center font-semibold text-sm"
          >
            View Profile & Follow
          </Link>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full px-4 py-3 glass rounded-lg border border-white/10 hover:border-white/20 transition-all font-semibold text-sm"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
