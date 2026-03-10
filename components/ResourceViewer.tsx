'use client'

import { useEffect, useMemo } from 'react'
import { Download, ExternalLink, X } from 'lucide-react'

interface ViewerResource {
  id: string
  title: string
  resource_type: string
  file_url: string | null
  youtube_link: string | null
}

interface ResourceViewerProps {
  open: boolean
  onClose: () => void
  resource: ViewerResource | null
}

function toYouTubeEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace('www.', '')

    if (host === 'youtu.be') {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0]
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const listId = parsed.searchParams.get('list')
      const videoId = parsed.searchParams.get('v')

      if (parsed.pathname === '/playlist' && listId) {
        return `https://www.youtube.com/embed/videoseries?list=${listId}`
      }

      if (videoId) {
        if (listId) {
          return `https://www.youtube.com/embed/${videoId}?list=${listId}`
        }
        return `https://www.youtube.com/embed/${videoId}`
      }

      if (parsed.pathname.startsWith('/embed/')) {
        return url
      }
    }
  } catch {
    return url
  }

  return url
}

export default function ResourceViewer({ open, onClose, resource }: ResourceViewerProps) {
  const isPlaylist = resource?.resource_type === 'Playlist'

  const embedUrl = useMemo(() => {
    if (!resource?.youtube_link) return ''
    return toYouTubeEmbedUrl(resource.youtube_link)
  }, [resource?.youtube_link])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open || !resource) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6">
      <div className="w-full max-w-[1000px] glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold truncate">{resource.title}</h3>
            <span className="mt-1 inline-flex text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">
              {resource.resource_type}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 hover:border-cyan-400/50 transition-colors"
            aria-label="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {!isPlaylist && resource.file_url && (
              <a
                href={resource.file_url}
                download
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}

            {!isPlaylist && (
              <button
                type="button"
                disabled
                title="Disabled to keep viewing inside the app"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg glass border border-white/10 text-sm font-medium opacity-50 cursor-not-allowed"
              >
                <ExternalLink className="w-4 h-4" />
                Open in new tab
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg glass border border-white/10 hover:border-cyan-400/50 text-sm font-medium"
            >
              Close
            </button>
          </div>

          {isPlaylist ? (
            resource.youtube_link ? (
              <iframe
                src={embedUrl}
                className="w-full h-[70vh] sm:h-[80vh] rounded-lg bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={resource.title}
              />
            ) : (
              <div className="w-full h-[70vh] sm:h-[80vh] rounded-lg border border-white/10 flex items-center justify-center text-secondary-text">
                Playlist link not available.
              </div>
            )
          ) : resource.file_url ? (
            <iframe
              src={resource.file_url}
              className="w-full h-[70vh] sm:h-[80vh] rounded-lg bg-white"
              title={resource.title}
            />
          ) : (
            <div className="w-full h-[70vh] sm:h-[80vh] rounded-lg border border-white/10 flex items-center justify-center text-secondary-text">
              File not available.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
