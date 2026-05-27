import { Link } from 'react-router-dom';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';
import { getAdminModule, type AdminModuleKey } from './adminContent';

export default function AdminModulePage({ moduleKey }: { moduleKey: AdminModuleKey }) {
    const module = getAdminModule(moduleKey);

    return (
        <RequireAdmin>
            <AdminShell title={module.label} eyebrow="Module scaffold">
                <section className="max-w-[920px] border border-black/10 bg-white p-5 md:p-8">
                    <div className="flex h-11 w-11 items-center justify-center rounded bg-black text-[var(--urblo-lime)]">
                        <LockKeyhole className="h-5 w-5" />
                    </div>
                    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                        Protected route ready
                    </p>
                    <h2 className="mt-3 text-[32px] font-light leading-tight text-black md:text-[48px]">
                        {module.label} CRUD comes after the auth gate
                    </h2>
                    <p className="mt-5 max-w-[48rem] text-lg font-medium leading-8 text-[#33363f]">
                        {module.summary} This screen is intentionally scaffolded behind real Supabase Auth
                        while the launch sequence finishes the required dependencies.
                    </p>

                    <div className="mt-7 grid gap-3 md:grid-cols-2">
                        <div className="border border-black/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                Dependency
                            </p>
                            <p className="mt-2 text-base font-semibold text-black">{module.dependency}</p>
                        </div>
                        <div className="border border-black/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                Current state
                            </p>
                            <p className="mt-2 text-base font-semibold text-black">
                                Route protected; editing UI pending next checkpoint.
                            </p>
                        </div>
                    </div>

                    <Link to="/admin" className="urblo-button-inverse mt-8">
                        <ArrowLeft className="h-4 w-4" />
                        Dashboard
                    </Link>
                </section>
            </AdminShell>
        </RequireAdmin>
    );
}
