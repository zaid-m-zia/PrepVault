'use client'

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Menu, X, Bell } from 'lucide-react';
import supabase from '../../lib/supabaseClient';
import SearchBar from '../search/SearchBar';
import ThemeToggle from '../ui/ThemeToggle';

// Header component (client-side for interactivity)
// Purpose: Reusable, responsive header aligned with PrepVault design system

export default function Header(): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [user, setUser] = useState<any | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (!user?.id) {
      setUnreadNotifications(0);
      return;
    }

    let mounted = true;

    async function fetchUnreadCount() {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Failed to fetch unread notifications count:', error);
        return;
      }

      if (mounted) setUnreadNotifications(count || 0);
    }

    fetchUnreadCount();

    const channel = supabase
      .channel(`header-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          await fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload: any) => {
          const actorId = payload.new?.actor_id;
          let senderName = 'Someone';

          if (actorId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, username')
              .eq('id', actorId)
              .single();
            senderName = profile?.full_name || profile?.username || 'Someone';
          }

          const type = payload.new?.type;
          let message = `New notification from ${senderName}`;
          if (type === 'message') {
            message = `New message from ${senderName}`;
          } else if (type === 'follow_request') {
            message = `${senderName} sent you a follow request`;
          } else if (type === 'follow_accepted') {
            message = `${senderName} accepted your follow request`;
          }

          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          setToast(message);
          toastTimerRef.current = setTimeout(() => setToast(null), 4000);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [user?.id]);

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

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/resources', label: 'Resources' },
    { href: '/events', label: 'Events' },
    { href: '/hackhub', label: 'HackHub' },
    { href: '/chat', label: 'Chat' },
    { href: '/notifications', label: 'Notifications' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white text-gray-800 dark:bg-gray-900 dark:text-white dark:border-gray-700">
            {toast && (
              <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-xl border border-indigo-400/30 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-sm text-sm text-white max-w-sm animate-fade-in">
                <Bell className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                <span>{toast}</span>
                <button onClick={() => setToast(null)} className="ml-auto text-slate-400 hover:text-white transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
      <div className="max-w-[88rem] mx-auto pl-6 pr-3 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <LayoutDashboard className="h-4 w-4" />
            </span>
            <span>PrepVault</span>
          </Link>
        </div>

        <div className="flex-1 hidden lg:flex justify-center px-2 lg:px-3">
          <div className="w-full max-w-3xl">
            <SearchBar />
          </div>
        </div>

        <nav aria-label="Main navigation" className="flex items-center gap-3 lg:ml-2">
          <ul className="hidden md:flex items-center gap-1 text-sm">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/' && pathname?.startsWith(`${item.href}/`));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      active
                        ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-500/10'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {item.href === '/notifications' ? (
                        <span className="relative">
                          <Bell className="h-4 w-4" />
                          {unreadNotifications > 0 && (
                            <span className="absolute -top-2 -right-2.5 inline-flex min-w-[1.1rem] h-[1.1rem] px-1 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                              {unreadNotifications > 99 ? '99+' : unreadNotifications}
                            </span>
                          )}
                        </span>
                      ) : null}
                      <span>{item.label}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <ThemeToggle />

          {user ? (
            <button onClick={signOut} className="hidden md:inline-flex px-3 py-2 rounded-lg border border-border text-sm text-secondary-text hover:text-primary-text hover:border-indigo-500 transition-colors">
              Logout
            </button>
          ) : (
            <Link href="/login" className="hidden md:inline-flex px-3 py-2 rounded-lg border border-border text-sm text-secondary-text hover:text-primary-text hover:border-indigo-500 transition-colors">
              Login
            </Link>
          )}

          <div className="md:hidden relative">
            <button
              ref={buttonRef}
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-secondary-text"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <div
              aria-hidden={!open}
              onClick={() => setOpen(false)}
              className={`${open ? 'pointer-events-auto opacity-40' : 'pointer-events-none opacity-0'} fixed inset-0 bg-black z-40 backdrop-transition`}
            />

            <div
              id="mobile-menu"
              ref={menuRef}
              role="menu"
              className={`${open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'} menu-transition transform origin-top-right absolute right-0 mt-2 w-56 glass rounded-lg p-4 z-50`}
            >
              <ul className="flex flex-col gap-2 text-sm">
                {navItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/' && pathname?.startsWith(`${item.href}/`));

                  return (
                    <li key={item.href}>
                      <Link
                        role="menuitem"
                        tabIndex={open ? 0 : -1}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={`block px-3 py-2 rounded-lg transition-colors ${
                          active
                            ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-500/10'
                            : 'text-gray-700 dark:text-gray-300 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          {item.href === '/notifications' ? (
                            <span className="relative">
                              <Bell className="h-4 w-4" />
                              {unreadNotifications > 0 && (
                                <span className="absolute -top-2 -right-2.5 inline-flex min-w-[1.1rem] h-[1.1rem] px-1 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                                </span>
                              )}
                            </span>
                          ) : null}
                          <span>{item.label}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}

                <li className="pt-2 border-t border-border/60">
                  {user ? (
                    <button
                      onClick={() => {
                        signOut();
                        setOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border text-left text-secondary-text hover:text-primary-text"
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      role="menuitem"
                      tabIndex={open ? 0 : -1}
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 rounded-lg border border-border text-secondary-text hover:text-primary-text"
                    >
                      Login
                    </Link>
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
