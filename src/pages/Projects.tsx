import ProjectCard, { type ProjectMeta } from '../components/ProjectCard';

const projects: ProjectMeta[] = [
  {
    slug: 'australian-catholic-university',
    title: 'Australian Catholic University',
    location: 'Victoria',
    date: 'December 18, 2024',
    cover: 'https://urblo.com.au/wp-content/uploads/2024/12/IMGP0028-scaled-1.jpg',
  },
  {
    slug: 'moon-gate-woolley-street',
    title: 'Moon Gate | Woolley Street',
    location: 'ACT',
    date: 'December 17, 2024',
    cover: 'https://urblo.com.au/wp-content/uploads/2024/12/Moon-Garden-4-Web-Sized-Matthew-Sherren-Photography-1-1.jpg',
  },
  {
    slug: 'west-side-place',
    title: 'West Side Place',
    location: 'Victoria',
    date: 'December 16, 2024',
    cover: 'https://urblo.com.au/wp-content/uploads/2024/12/P1090007-1-scaled-2.jpg',
  },
  {
    slug: 'xavier-college',
    title: 'Xavier College',
    location: 'Victoria',
    date: 'December 15, 2024',
    cover: 'https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-14.55.37-1.jpeg',
  },
  {
    slug: 'artisan-park-yarrabend',
    title: 'Artisan Park | YarraBend',
    location: 'Victoria',
    date: 'December 14, 2024',
    cover: 'https://urblo.com.au/wp-content/uploads/2025/01/WhatsApp-Image-2024-12-18-at-13.19.23-scaled-1.png',
  },
];

export default function Projects() {
  return (
    <div className="bg-white">
      <section className="urblo-section-tight border-b border-black/10">
        <div className="urblo-page-container">
          <p className="urblo-eyebrow">Portfolio</p>
          <h1 className="urblo-page-title">Projects</h1>
          <p className="urblo-page-copy">
            Browse recent streetscape and civil landscape outcomes that show how Urblo integrates
            natural stone into durable public environments.
          </p>
        </div>
      </section>

      <section className="urblo-section bg-[rgba(239,239,239,0.28)]">
        <div className="urblo-page-container grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))}
        </div>
      </section>
    </div>
  );
}
