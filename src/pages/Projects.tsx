import ProjectCard, { type ProjectMeta } from '../components/ProjectCard';
import { projectListingMeta } from '../data/projectData';

const projects: ProjectMeta[] = projectListingMeta;

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
