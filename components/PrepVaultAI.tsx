'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { buttonClasses } from './ui/Button'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type PrepVaultAIProps = {
  isOpen: boolean
  onClose: () => void
}

export default function PrepVaultAI({ isOpen, onClose }: PrepVaultAIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm PrepVault AI, your personal engineering study assistant. How can I help you today?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastRequestTime, setLastRequestTime] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    // Check input length limit
    if (input.length > 500) {
      alert('Message too long. Please limit to 500 characters.')
      return
    }

    // Rate limiting - minimum 2 seconds between requests
    const now = Date.now()
    if (now - lastRequestTime < 2000) {
      alert('Please wait a moment before sending another message.')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setLastRequestTime(now)

    try {
      const response = await fetch('/api/prepvault-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content
        }),
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()

      console.log("AI RESPONSE:", data); // Add debugging log

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'PrepVault AI is temporarily unavailable. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Chat Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 md:inset-6 lg:inset-8 xl:inset-12 glass rounded-xl border border-white/10 z-50 flex flex-col max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-display font-bold">PrepVault AI</h2>
                <p className="text-secondary-text">Your personal engineering study assistant</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`${
                      message.role === 'user'
                        ? 'max-w-xs lg:max-w-md px-4 py-3'
                        : 'max-w-2xl lg:max-w-3xl px-5 py-4 space-y-2'
                    } rounded-lg leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                        : 'glass border border-white/10 text-primary-text'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none
                        prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-semibold
                        prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2
                        prose-h3:text-base prose-h3:mt-3 prose-h3:mb-1
                        prose-p:my-2 prose-p:leading-relaxed
                        prose-ul:my-2 prose-ol:my-2
                        prose-li:my-1 prose-li:leading-relaxed
                        prose-strong:text-cyan-300 prose-strong:font-semibold
                        prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-cyan-300 prose-code:text-sm
                        prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded prose-pre:p-3 prose-pre:overflow-x-auto
                        prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:pl-4 prose-blockquote:italic">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({node, ...props}) => (
                              <table className="w-full border border-gray-700 rounded-lg overflow-hidden text-sm my-4" {...props} />
                            ),
                            thead: ({node, ...props}) => (
                              <thead className="bg-slate-800 text-left" {...props} />
                            ),
                            th: ({node, ...props}) => (
                              <th className="border border-gray-700 px-3 py-2 font-semibold text-cyan-300" {...props} />
                            ),
                            td: ({node, ...props}) => (
                              <td className="border border-gray-700 px-3 py-2" {...props} />
                            )
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-slate-500 dark:text-slate-400' : 'text-secondary-text'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="glass border border-white/10 px-4 py-3 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about engineering studies..."
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
                  maxLength={500}
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || loading}
                  className={buttonClasses({ size: 'md', className: 'px-6 py-3 rounded-lg' })}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-secondary-text mt-2">
                {input.length}/500 characters
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}