// PlaylistCard — Present playlist information (YouTube only for now)
// Purpose: Show playlist title, platform badge, coverage note, exam relevance and external link

export default function PlaylistCard({ playlist }: { playlist: { id: string; title: string; platform?: string; coverage?: string; examRelevance: string; url: string } }) {
  return (
    <article className="group rounded-lg p-4 border glass transform-gpu transition-transform duration-150 hover:shadow-lg hover:scale-105 hover:-translate-y-1 z-0 hover:z-10" style={{ borderColor: 'rgba(246,72,153,0.06)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="text-md font-semibold font-display leading-snug transition-colors group-hover:text-primary-text">{playlist.title}</h4>
            <span className="text-xs px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: '#FF0000' }}>{playlist.platform ?? 'YouTube'}</span>
          </div>

          <div className="mt-2 text-sm text-secondary-text">
            <span className="px-2 py-0.5 rounded-md bg-white/3 text-xs">{playlist.examRelevance}</span>
            {playlist.coverage && <span className="ml-3 text-sm text-secondary-text">{playlist.coverage}</span>}
          </div>

          {playlist.coverage && <p className="mt-3 text-sm text-secondary-text">{playlist.coverage}</p>}
        </div>

        <div className="flex-shrink-0 flex items-center">
          <a href={playlist.url} role="button" aria-label={`Open ${playlist.title}`} className="ml-4 inline-flex items-center px-3 py-2 rounded-md bg-gradient-to-r from-[#ff9a9e] to-[#f6f0ff] text-[#0a0e27] font-semibold">Open</a>
        </div>
      </div>
    </article>
  );
}
