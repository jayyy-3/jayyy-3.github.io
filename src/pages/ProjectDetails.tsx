import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectPageView from '../components/projects/ProjectPageView';
import RouteState from '../components/RouteState';
import PublicContentSeo from '../components/PublicContentSeo';
import { type ProjectData } from '../data/projectData';
import ProjectService from '../service/ProjectService';

export default function ProjectDetails() {
  const { slug = '' } = useParams();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const project = projects.find((item) => item.slug === slug);

  useEffect(() => {
    let isCurrent = true;
    setStatus('loading');

    ProjectService.getAll()
      .then((result) => {
        if (!isCurrent) return;
        setProjects(result);
        setStatus('ready');
      })
      .catch(() => {
        if (isCurrent) setStatus('error');
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  if (status === 'loading') {
    return (
      <RouteState
        eyebrow="Loading"
        title="Preparing project"
        copy="The project record is loading. This should only take a moment."
        headerOffset
      />
    );
  }

  if (status === 'error') {
    return (
      <RouteState
        eyebrow="Project Error"
        title="Project could not load"
        copy="The project record could not be loaded right now. Return to projects or contact Urblo if this keeps happening."
        headerOffset
        actions={[
          { label: 'Projects', to: '/projects' },
          { label: 'Contact Us', to: '/contact', variant: 'secondary' },
        ]}
      />
    );
  }

  if (!project) {
    return (
      <RouteState
        eyebrow="Project Not Found"
        title="Project not found"
        copy="This project link does not match a published Urblo project. Browse current project records or contact Urblo for help."
        headerOffset
        actions={[
          { label: 'Projects', to: '/projects' },
          { label: 'Contact Us', to: '/contact', variant: 'secondary' },
        ]}
      />
    );
  }

  return (
    <>
      {project.contentSource === 'cms' ? (
        <PublicContentSeo
          canonicalPath={`/projects/${project.slug}`}
          fallbackTitle={`${project.name} Stone Streetscape Project | Urblo`}
          fallbackDescription={
            project.listing.summary ||
            project.lead ||
            `Review ${project.name}, an Urblo public realm stone project with project facts, material notes, and delivery proof.`
          }
          image={project.hero?.image || project.listing.cover}
          seo={project.seo}
        />
      ) : null}
      <ProjectPageView project={project} allProjects={projects} />
    </>
  );
}
