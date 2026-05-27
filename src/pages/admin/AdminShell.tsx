import { Link, NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import { adminModules } from './adminContent';

interface AdminShellProps {
    title: string;
    eyebrow?: string;
    actions?: ReactNode;
    children: ReactNode;
}

export default function AdminShell({ title, eyebrow = 'Urblo Admin', actions, children }: AdminShellProps) {
    const { profile, signOut, refresh, status } = useAdminAuth();

    return (
        <main className="min-h-screen bg-[#f5f6f2] text-[var(--urblo-text)]">
            <div className="grid min-h-screen lg:grid-cols-[264px_1fr]">
                <aside className="border-b border-black/10 bg-black text-white lg:border-b-0 lg:border-r">
                    <div className="flex min-h-full flex-col">
                        <div className="border-b border-white/15 px-5 py-5">
                            <Link to="/admin" className="block text-[22px] font-semibold tracking-[-0.01em]">
                                Urblo
                            </Link>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                                Admin CMS
                            </p>
                        </div>

                        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:overflow-visible">
                            {adminModules.map(({ key, label, path, Icon, state }) => (
                                <NavLink
                                    key={key}
                                    to={path}
                                    end={path === '/admin'}
                                    className={({ isActive }) =>
                                        [
                                            'flex shrink-0 items-center gap-3 rounded px-3 py-2.5 text-sm font-semibold transition',
                                            isActive
                                                ? 'bg-white text-black'
                                                : 'text-white/72 hover:bg-white/10 hover:text-white',
                                        ].join(' ')
                                    }
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{label}</span>
                                    {state !== 'active' ? (
                                        <span className="ml-auto hidden rounded border border-white/15 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/45 lg:inline-flex">
                                            Next
                                        </span>
                                    ) : null}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="hidden border-t border-white/15 p-4 lg:block">
                            <p className="text-xs uppercase tracking-[0.16em] text-white/45">Signed in</p>
                            <p className="mt-2 truncate text-sm font-semibold">
                                {profile?.display_name || profile?.email || 'Admin session'}
                            </p>
                            <p className="mt-1 text-xs capitalize text-white/55">{profile?.role ?? status}</p>
                        </div>
                    </div>
                </aside>

                <section className="min-w-0">
                    <header className="border-b border-black/10 bg-white px-5 py-5 md:px-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                                    {eyebrow}
                                </p>
                                <h1 className="mt-2 text-[32px] font-light leading-tight text-black md:text-[44px]">
                                    {title}
                                </h1>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {actions}
                                <button
                                    type="button"
                                    onClick={() => void refresh()}
                                    className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void signOut()}
                                    className="inline-flex min-h-10 items-center gap-2 rounded bg-black px-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#33363f]"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="px-5 py-6 md:px-8 md:py-8">{children}</div>
                </section>
            </div>
        </main>
    );
}
