'use client'

import Link from 'next/link'
import {
  BookOpen,
  CalendarDays,
  Flag,
  FileText,
  Github,
  Linkedin,
  Mail,
  MessageSquare,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Twitter,
  Users,
  Workflow,
} from 'lucide-react'

const productLinks = [
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/hackhub', label: 'HackHub', icon: Users },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/resources#study-paths', label: 'Study Paths', icon: Workflow },
]

const communityLinks = [
  { href: 'https://github.com', label: 'GitHub', icon: Github },
  { href: 'https://discord.com', label: 'Discord', icon: MessageCircle },
  { href: 'https://www.linkedin.com', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://twitter.com', label: 'Twitter', icon: Twitter },
]

const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy', icon: ShieldCheck },
  { href: '/terms', label: 'Terms of Service', icon: FileText },
  { href: 'mailto:hello@prepvault.app', label: 'Contact', icon: Mail },
  { href: 'mailto:hello@prepvault.app?subject=PrepVault%20Issue%20Report', label: 'Report Issue', icon: Flag },
]

function FooterLink({
  href,
  label,
  icon: Icon,
  external = false,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  external?: boolean
}) {
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </>
  )

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-indigo-500 dark:text-slate-400"
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-indigo-500 dark:text-slate-400"
    >
      {content}
    </Link>
  )
}

export default function Footer({ onOpenAI }: { onOpenAI: () => void }) {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3 text-slate-900 dark:text-white">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-200 bg-white text-indigo-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-400">
                <BookOpen className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display text-lg font-semibold">PrepVault</span>
                <span className="block text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-500">Engineering Success Platform</span>
              </span>
            </Link>

            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
              The engineering success platform helping students discover resources, internships, hackathons and collaborators.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Product</h3>
            <div className="mt-4 flex flex-col gap-3">
              {productLinks.map((link) => (
                <FooterLink key={link.label} href={link.href} label={link.label} icon={link.icon} />
              ))}
              <button
                type="button"
                onClick={onOpenAI}
                className="inline-flex items-center gap-2 text-left text-sm text-slate-600 transition-colors hover:text-indigo-500 dark:text-slate-400"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>AI Assistant</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Community</h3>
            <div className="mt-4 flex flex-col gap-3">
              {communityLinks.map((link) => (
                <FooterLink key={link.label} href={link.href} label={link.label} icon={link.icon} external />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Legal</h3>
            <div className="mt-4 flex flex-col gap-3">
              {legalLinks.map((link) => (
                <FooterLink key={link.label} href={link.href} label={link.label} icon={link.icon} external={link.href.startsWith('http') || link.href.startsWith('mailto:')} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-gray-200 pt-5 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 PrepVault - Built for Engineers by an Engineer</p>
          <p>Version 1.0</p>
        </div>
      </div>
    </footer>
  )
}