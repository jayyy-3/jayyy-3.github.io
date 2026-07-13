import { Link, NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Eye, LogOut, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import { adminModules } from './adminContent';

const navGroups = [
    { key: 'work', label: 'Work queue' },
    { key: 'content', label: 'Content library' },
    { key: 'operations', label: 'Operations' },
] as const;

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

                        <div className="border-b border-white/10 px-4 py-4 lg:border-b">
                            <div className="flex items-start gap-3 rounded border border-white/12 bg-white/[0.06] p-3">
                                <Eye className="mt-0.5 h-4 w-4 shrink-0 text-[var(--urblo-lime)]" />
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
                                        Public website
                                    </p>
                                    <p className="mt-1 text-sm leading-5 text-white/72">
                                        Published CMS content can appear publicly. A matching legacy page may remain
                                        during migration even when its CMS version is Draft or Archived.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:gap-4 lg:overflow-visible">
                            {navGroups.map((group) => {
                                const modules = adminModules.filter((module) => module.group === group.key);
                                return (
                                    <div key={group.key} className="flex shrink-0 gap-1 lg:flex-col">
                                        <p className="hidden px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/35 lg:block">
                                            {group.label}
                                        </p>
                                        {modules.map(({ key, label, path, Icon }) => (
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
                                            </NavLink>
                                        ))}
                                    </div>
                                );
                            })}
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
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                                    {eyebrow}
                                </p>
                                <h1 className="mt-2 text-[32px] font-light leading-tight text-black md:text-[44px]">
                                    {title}
                                </h1>
                            </div>

                            <div className="flex min-w-0 flex-wrap items-center gap-2 xl:shrink-0 xl:justify-end">
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
