import RouteState from '../components/RouteState';

export default function NotFoundPage() {
  return (
    <RouteState
      eyebrow="Not Found"
      title="Page not found"
      copy="The page may have moved, or the link may be outdated. Use the main pathways below to continue through the Urblo site."
      actions={[
        { label: 'Projects', to: '/projects' },
        { label: 'Stone Library', to: '/stone-library', variant: 'secondary' },
        { label: 'Contact Us', to: '/contact', variant: 'secondary' },
      ]}
    />
  );
}
