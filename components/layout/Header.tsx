'use client'

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

// Header component (client-side for interactivity)
// Purpose: Reusable, responsive header aligned with PrepVault design system

export default function Header(): JSX.Element {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      // focus first link when menu opens (query first anchor dynamically)
      setTimeout(() => menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus(), 0);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <header className="py-4 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg glass flex items-center justify-center">
              {/* Placeholder mark */}
              <span className="font-display font-bold text-lg">PV</span>
            </div>
            <div className="font-display text-xl font-bold">PrepVault</div>
          </div>
        </div>

        <nav aria-label="Main navigation">
          <ul className="hidden md:flex items-center gap-6 text-sm text-secondary-text">
            <li>
              <Link href="/" className="hover:text-primary-text">Home</Link>
            </li>
            <li>
              <Link href="/resources" className="hover:text-primary-text">Resources</Link>
            </li>
            <li>
              <Link href="/events" className="hover:text-primary-text">Events</Link>
            </li>
            <li>
              <Link href="/hackmate" className="hover:text-primary-text">Hackmate</Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-primary-text">Profile</Link>
            </li>
          </ul>

          {/* Mobile menu */}
          <div className="md:hidden relative">
            <button
              ref={buttonRef}
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
              className="p-2 rounded-md glass border"
              style={{ borderColor: 'rgba(139, 92, 246, 0.06)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-secondary-text" />
              </svg>
            </button>

            { /* Backdrop */ }
            <div
              aria-hidden={!open}
              onClick={() => setOpen(false)}
              className={`${open ? 'pointer-events-auto opacity-40' : 'pointer-events-none opacity-0'} fixed inset-0 bg-black z-40 backdrop-transition`}
            />

            <div
              id="mobile-menu"
              ref={menuRef}
              role="menu"
              className={`${open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'} menu-transition transform origin-top-right absolute right-0 mt-2 w-56 glass rounded-lg p-4 shadow-glow z-50`}
            >
              <ul className="flex flex-col gap-3 text-sm">
                <li>
                  <Link role="menuitem" tabIndex={open ? 0 : -1} href="/" className="block px-2 py-2 rounded-md hover:bg-white/5">Home</Link>
                </li>
                <li>
                  <Link role="menuitem" tabIndex={open ? 0 : -1} href="/resources" className="block px-2 py-2 rounded-md hover:bg-white/5">Resources</Link>
                </li>
                <li>
                  <Link role="menuitem" tabIndex={open ? 0 : -1} href="/events" className="block px-2 py-2 rounded-md hover:bg-white/5">Events</Link>
                </li>
                <li>
                  <Link role="menuitem" tabIndex={open ? 0 : -1} href="/hackmate" className="block px-2 py-2 rounded-md hover:bg-white/5">Hackmate</Link>
                </li>
                <li>
                  <Link role="menuitem" tabIndex={open ? 0 : -1} href="/profile" className="block px-2 py-2 rounded-md hover:bg-white/5">Profile</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
