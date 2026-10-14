import { describe, expect, test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { ContentBlockView } from '../../features/blocks/view';
import { projects } from '../../data/projectData';
import ProjectPageView from '../projects/ProjectPageView';
import BlockList from './BlockList';

const everyBlock: ContentBlockView[] = [
  { id: 'h', type: 'heading', eyebrow: 'Background', title: 'From design intent to fabrication reality', intro: 'How the stone was chosen.' },
  { id: 't', type: 'text', body: 'Paragraph with **bold**.\n\n- First\n- Second' },
  { id: 'q', type: 'quote', quote: 'The stone made it buildable.', attribution: 'A. Designer', role: 'Landscape architect' },
  { id: 'c', type: 'callout', title: 'Lead time', body: 'Order blocks twelve weeks ahead.', tone: 'lime' },
  { id: 's', type: 'stats', items: [{ value: '1,200', unit: 'm²', label: 'Paving' }, { value: '14', label: 'Weeks' }], caption: 'Approximate.' },
  { id: 'st', type: 'steps', intro: 'Five steps.', items: [{ title: 'Survey', body: 'Measure.', image: { src: '/media/a.jpg', alt: 'Survey crew' } }, { title: 'Cut', body: 'Cut blocks.' }] },
  { id: 'sp', type: 'spec_table', title: 'Specification', rows: [{ label: 'Finish', value: 'Flamed' }] },
  { id: 'cmp', type: 'comparison_table', title: 'Options', columns: ['Granite', 'Bluestone'], rows: [{ label: 'Slip', cells: ['P5', ''] }] },
  { id: 'sc', type: 'stone_cards', title: 'Stones used', items: [{ stoneGroupId: null, note: 'Awaiting confirmation' }] },
  { id: 'i', type: 'image', src: '/media/b.jpg', alt: 'Entry paving', label: 'Context', caption: 'The entry.' },
  { id: 'g', type: 'gallery', items: [{ src: '/media/c.jpg', alt: 'One' }, { src: '/media/d.jpg', alt: 'Two', caption: 'Second' }] },
  { id: 'hs', type: 'hotspot_image', image: '/media/e.jpg', imageAlt: 'Placement', title: 'Stone and finish placement', hotspots: [] },
  { id: 'v', type: 'video', youtubeId: 'abcdefghijk', title: 'Installation' },
  { id: 'cta', type: 'cta', title: 'Planning a similar project?', body: 'Talk to us early.', primary: { label: 'Discuss a project', href: '/contact' }, secondary: { label: 'Urblo', href: 'https://urblo.com.au/' } },
];

function render(element: React.ReactElement) {
  return renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);
}

describe('shared block renderers', () => {
  const html = render(<BlockList blocks={everyBlock} />);

  test('every block type renders its visible content', () => {
    for (const text of [
      'From design intent to fabrication reality', 'Background', '<strong class="font-semibold text-ink">', '<li>',
      'The stone made it buildable.', 'A. Designer · Landscape architect', 'Order blocks twelve weeks ahead.',
      '1,200', 'm²', 'Paving', '01', '02', 'Survey crew', 'Specification', 'Flamed', 'Granite', 'Bluestone',
      'Stone to be confirmed', 'Awaiting confirmation', 'Entry paving', 'The entry.', 'Open image 2 of 2: Two',
      'project-media-hs', 'youtube-nocookie.com/embed/abcdefghijk', 'Planning a similar project?',
    ]) {
      expect(html).toContain(text);
    }
  });

  test('tables use row headers, and only the comparison table scrolls inside its own region', () => {
    expect(html).toContain('<th scope="row"');
    expect(html.match(/overflow-x-auto/g)?.length).toBe(1);
    expect(html).toMatch(/role="region"[^>]*tabindex="0"|tabindex="0"[^>]*role="region"/i);
    expect(html).toContain('aria-label="No entry"');
  });

  test('lime is an edge on the callout, never a fill', () => {
    expect(html).toContain('border-l-lime');
    expect(html).not.toMatch(/bg-lime/);
  });

  test('CTA links: internal through the router, external with rel="noopener"', () => {
    expect(html).toContain('href="/contact"');
    expect(html).toContain('href="https://urblo.com.au/" rel="noopener"');
  });
});

describe('Project body section', () => {
  const project = projects.find((entry) => entry.slug === 'moon-gate-woolley-street');
  if (!project) throw new Error('Moon Gate fixture missing');

  test('keeps the generic section heading for media-only bodies', () => {
    const html = render(<ProjectPageView project={project} allProjects={projects} />);
    expect(html).toContain('Built evidence, ordered.');
  });

  test('an opening Heading block replaces the generic section heading', () => {
    const html = render(
      <ProjectPageView
        project={{ ...project, blocks: [everyBlock[0], ...(project.blocks ?? [])] }}
        allProjects={projects}
      />,
    );
    expect(html).not.toContain('Built evidence, ordered.');
    expect(html).toContain('From design intent to fabrication reality');
  });
});
