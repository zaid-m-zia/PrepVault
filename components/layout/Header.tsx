'use client'

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import supabase from '../../lib/supabaseClient';

// Header component (client-side for interactivity)
// Purpose: Reusable, responsive header aligned with PrepVault design system

export default function Header(): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }: any) => {
      if (!mounted) return;
      setUser(data?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    const subscription = data?.subscription;

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

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

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  }

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
              <Link
                href="/"
                aria-current={pathname === '/' ? 'page' : undefined}
                className={`transition-colors duration-200 relative inline-block ${pathname === '/' ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}
              >
                <span className="relative z-10">Home</span>
                <span aria-hidden className={`absolute left-0 -bottom-0.5 h-[2px] bg-primary-600 origin-left transform transition-transform duration-200 ${pathname === '/' ? 'scale-x-100' : 'scale-x-0'}`} />
              </Link>
            </li>
            <li>
              <Link
                href="/resources"
                aria-current={pathname === '/resources' || pathname?.startsWith('/resources/') ? 'page' : undefined}
                className={`transition-colors duration-200 relative inline-block ${pathname === '/resources' || pathname?.startsWith('/resources/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}
              >
                <span className="relative z-10">Resources</span>
                <span aria-hidden className={`absolute left-0 -bottom-0.5 h-[2px] bg-primary-600 origin-left transform transition-transform duration-200 ${pathname === '/resources' || pathname?.startsWith('/resources/') ? 'scale-x-100' : 'scale-x-0'}`} />
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                aria-current={pathname === '/events' || pathname?.startsWith('/events/') ? 'page' : undefined}
                className={`transition-colors duration-200 relative inline-block ${pathname === '/events' || pathname?.startsWith('/events/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}
              >
                <span className="relative z-10">Events</span>
                <span aria-hidden className={`absolute left-0 -bottom-0.5 h-[2px] bg-primary-600 origin-left transform transition-transform duration-200 ${pathname === '/events' || pathname?.startsWith('/events/') ? 'scale-x-100' : 'scale-x-0'}`} />
              </Link>
            </li>
            <li>
              <Link
                href="/hackhub"
                aria-current={pathname === '/hackhub' || pathname?.startsWith('/hackhub/') ? 'page' : undefined}
                className={`transition-colors duration-200 relative inline-block ${pathname === '/hackhub' || pathname?.startsWith('/hackhub/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}
              >
                <span className="relative z-10">HackHub</span>
                <span aria-hidden className={`absolute left-0 -bottom-0.5 h-[2px] bg-primary-600 origin-left transform transition-transform duration-200 ${pathname === '/hackhub' || pathname?.startsWith('/hackhub/') ? 'scale-x-100' : 'scale-x-0'}`} />
              </Link>
            </li>
            <li>
              <Link
                href="/profile"
                aria-current={pathname === '/profile' || pathname?.startsWith('/profile/') ? 'page' : undefined}
                className={`transition-colors duration-200 relative inline-block ${pathname === '/profile' || pathname?.startsWith('/profile/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}
              >
                <span className="relative z-10">Profile</span>
                <span aria-hidden className={`absolute left-0 -bottom-0.5 h-[2px] bg-primary-600 origin-left transform transition-transform duration-200 ${pathname === '/profile' || pathname?.startsWith('/profile/') ? 'scale-x-100' : 'scale-x-0'}`} />
              </Link>
            </li>

            <li>
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm">{user.email ?? user.id}</span>
                  <button onClick={signOut} className="px-3 py-1 rounded-md glass border">Logout</button>
                </div>
              ) : (
                <Link href="/login" className="hover:text-primary-text">Login</Link>
              )}
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
                  <Link
                    role="menuitem"
                    tabIndex={open ? 0 : -1}
                    href="/"
                    aria-current={pathname === '/' ? 'page' : undefined}
                    className={`block px-2 py-2 rounded-md transition-colors duration-150 ${pathname === '/' ? 'text-primary-600' : 'text-gray-200 hover:text-white'} relative`}
                  >
                    <span className="relative z-10">Home</span>
                    <span aria-hidden className={`absolute left-2 -bottom-0.5 h-[2px] bg-primary-600 origin-left transform transition-transform duration-200 ${pathname === '/' ? 'scale-x-100' : 'scale-x-0'}`} />
                  </Link>
                </li>
                <li>
                  <Link
                    role="menuitem"
                    tabIndex={open ? 0 : -1}
                    href="/resources"
                    aria-current={pathname === '/resources' || pathname?.startsWith('/resources/') ? 'page' : undefined}
                    className={`block px-2 py-2 rounded-md transition-colors duration-150 ${pathname === '/resources' || pathname?.startsWith('/resources/') ? 'text-primary-600' : 'text-gray-200 hover:text-white'} relative`}
                  >
                    <span className="relative z-10">Resources</span>
                    <span aria-hidden className={`absolute left-2 -bottom-0.5 h-[2px] bg-primary-600 origin-left transform transition-transform duration-200 ${pathname === '/resources' || pathname?.startsWith('/resources/') ? 'scale-x-100' : 'scale-x-0'}`} />
                  </Link>
                </li>
                <li>
                  <Link
                    role="menuitem"
                    tabIndex={open ? 0 : -1}
                    href="/events"
                    aria-current={pathname === '/events' || pathname?.startsWith('/events/') ? 'page' : undefined}
                    className={`block px-2 py-2 rounded-md transition-colors duration-150 ${pathname === '/events' || pathname?.startsWith('/events/') ? 'text-primary-600' : 'text-gray-200 hover:text-white'} relative`}
                  >
                    <span className="relative z-10">Events</span>
                    <span aria-hidden className={`absolute left-2 -bottom-0.5 h-[2px] bg-primary-600 origin-left transform transition-transform duration-200 ${pathname === '/events' || pathname?.startsWith('/events/') ? 'scale-x-100' : 'scale-x-0'}`} />
                  </Link>
                </li>
                <li>
                  <Link
                    role="menuitem"
                    tabIndex={open ? 0 : -1}
                    href="/hackhub"
                    aria-current={pathname === '/hackhub' || pathname?.startsWith('/hackhub/') ? 'page' : undefined}
                    className={`block px-2 py-2 rounded-md transition-colors duration-150 ${pathname === '/hackhub' || pathname?.startsWith('/hackhub/') ? 'text-primary-600' : 'text-gray-200 hover:text-white'} relative`}
                  >
                    <span className="relative z-10">HackHub</span>
                    <span aria-hidden className={`absolute left-2 -bottom-0.5 h-[2px] bg-primary-600 origin-left transform transition-transform duration-200 ${pathname === '/hackhub' || pathname?.startsWith('/hackhub/') ? 'scale-x-100' : 'scale-x-0'}`} />
                  </Link>
                </li>
                <li>
                  <Link
                    role="menuitem"
                    tabIndex={open ? 0 : -1}
                    href="/profile"
                    aria-current={pathname === '/profile' || pathname?.startsWith('/profile/') ? 'page' : undefined}
                    className={`block px-2 py-2 rounded-md transition-colors duration-150 ${pathname === '/profile' || pathname?.startsWith('/profile/') ? 'text-primary-600' : 'text-gray-200 hover:text-white'} relative`}
                  >
                    <span className="relative z-10">Profile</span>
                    <span aria-hidden className={`absolute left-2 -bottom-0.5 h-[2px] bg-primary-600 origin-left transform transition-transform duration-200 ${pathname === '/profile' || pathname?.startsWith('/profile/') ? 'scale-x-100' : 'scale-x-0'}`} />
                  </Link>
                </li>

                <li>
                  {user ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{user.email ?? user.id}</span>
                      <button onClick={() => { signOut(); setOpen(false); }} className="px-3 py-1 rounded-md glass border">Logout</button>
                    </div>
                  ) : (
                    <Link role="menuitem" tabIndex={open ? 0 : -1} href="/login" className="block px-2 py-2 rounded-md hover:bg-white/5">Login</Link>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
