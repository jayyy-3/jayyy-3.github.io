import { Link } from 'react-router-dom';

export interface ProjectMeta {
  slug: string;
  title: string;
  location: string;
  date: string;
  cover: string;
}

export default function ProjectCard({ slug, title, location, date, cover }: ProjectMeta) {
  return (
    <Link
      to={`/projects/${slug}`}
      className="group relative block overflow-hidden rounded-[4px] bg-black text-white"
      style={{ aspectRatio: '379 / 600' }}
    >
      <img
        src={cover}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-[28px] font-semibold uppercase leading-[1.05] text-white">
            {title}
          </h3>
          <span className="mt-1 text-[18px] text-[var(--urblo-lime)]">-&gt;</span>
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/72">
          {location} · {date}
        </p>
      </div>
    </Link>
  );
}
