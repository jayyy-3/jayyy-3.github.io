import { Link, useParams } from 'react-router-dom';
import { projects } from '../data/projectData';

export default function ProjectDetails() {
  const { slug = '' } = useParams();
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return <div className="py-40 text-center text-xl">Project not found.</div>;
  }

  const { name, images, details } = project;

  return (
    <div className="bg-white">
      <nav className="border-b border-black/10 bg-white/92 py-4">
        <div className="urblo-page-container flex flex-wrap items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-black/55">
          <Link to="/" className="hover:text-[var(--urblo-lime)]">
            Home
          </Link>
          <span>/</span>
          <Link to="/projects" className="hover:text-[var(--urblo-lime)]">
            Projects
          </Link>
          <span>/</span>
          <span className="text-black">{name}</span>
        </div>
      </nav>

      <section className="urblo-section-tight border-b border-black/10">
        <div className="urblo-page-container">
          <p className="urblo-eyebrow">Project Details</p>
          <h1 className="urblo-page-title">{name}</h1>
        </div>
      </section>

      <section className="urblo-section bg-[rgba(239,239,239,0.22)]">
        <div className="urblo-page-container grid gap-6 md:grid-cols-3">
          <div className="urblo-card overflow-hidden md:col-span-1">
            <img src={images[0]} alt={name} loading="lazy" className="h-full min-h-[320px] w-full object-cover" />
          </div>
          <div className="urblo-card overflow-hidden md:col-span-1">
            <img src={images[1]} alt={name} loading="lazy" className="h-full min-h-[320px] w-full object-cover" />
          </div>
          <div className="urblo-card p-6 md:p-8">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              {Object.entries(details).map(([label, value]) => (
                <div key={label}>
                  <p className="urblo-meta mb-2 text-black/55">{label}</p>
                  {Array.isArray(value)
                    ? value.map((entry, index) => (
                        <p key={label + '-' + index} className="text-[15px] leading-7 text-[var(--urblo-text)]">
                          {entry}
                        </p>
                      ))
                    : <p className="text-[15px] leading-7 text-[var(--urblo-text)]">{value}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
