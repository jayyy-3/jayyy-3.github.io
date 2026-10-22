import { describe, expect, test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { ContentBlockView, ImageBlockView } from '../../features/blocks/view';
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

describe('body image presentation (2026-10-22)', () => {
  const photo = (id: string, width: number, height: number, extra: Partial<ImageBlockView> = {}): ImageBlockView => ({
    id, type: 'image', src: `/media/${id}.jpg`, alt: `Alt ${id}`, width, height, presentation: 'photo', ...extra,
  });
  const figures = (html: string) => [...html.matchAll(/<figure[^>]*>/g)].map((match) => match[0]);

  test('landscape images run full width at their natural ratio, never cropped, with size attributes', () => {
    const html = render(<BlockList blocks={[photo('wide', 1600, 900, { label: 'Context', caption: 'The entry.' })]} />);
    expect(figures(html)[0]).toContain('data-image-layout="landscape"');
    expect(figures(html)[0]).toContain('class="w-full"');
    expect(html).toContain('width="1600"');
    expect(html).toContain('height="900"');
    expect(html).toContain('class="block h-auto w-full"');
    expect(html).not.toMatch(/aspect-\[16\/9\]|object-cover/);
    expect(html).toContain('<figcaption class="mt-4 grid max-w-3xl gap-1"><p class="text-meta font-semibold uppercase tracking-caps text-muted">Context</p><p class="text-small text-body">The entry.</p></figcaption>');
  });

  test('a single portrait sits in a centred two-thirds measure, capped at 80svh', () => {
    const html = render(<BlockList blocks={[photo('tall', 1000, 1500)]} />);
    expect(figures(html)[0]).toContain('data-image-layout="upright"');
    expect(figures(html)[0]).toContain('class="mx-auto w-full md:w-2/3"');
    expect(figures(html)[0]).toContain('--image-ratio:0.6667');
    expect(html).toContain('mx-auto w-[min(100%,calc(80svh*var(--image-ratio)))]');
    expect(html).not.toContain('data-image-pair');
  });

  test('two consecutive square/portrait photos render as one equal-height pair, each with its own caption', () => {
    const html = render(<BlockList blocks={[photo('left', 1000, 1500, { caption: 'Left caption' }), photo('right', 1000, 1000, { caption: 'Right caption' })]} />);
    expect(html.match(/data-image-pair=""/g)?.length).toBe(1);
    expect(html).toContain('--pair-ratio:1.6667');
    expect(html).toContain('md:flex');
    const pairFigures = figures(html);
    expect(pairFigures).toHaveLength(2);
    for (const figure of pairFigures) {
      expect(figure).toContain('data-image-layout="pair"');
      expect(figure).toContain('md:[flex:var(--image-ratio)_1_0%]');
    }
    expect(html.indexOf('Left caption')).toBeLessThan(html.indexOf('Right caption'));
    expect(html.match(/<figcaption/g)?.length).toBe(2);
  });

  test('drawings get a light hairline-framed surface and are not paired', () => {
    const html = render(<BlockList blocks={[photo('plan', 1000, 1400, { presentation: 'drawing' }), photo('tall', 1000, 1500)]} />);
    expect(html).not.toContain('data-image-pair');
    expect(figures(html)[0]).toContain('data-image-presentation="drawing"');
    expect(html.match(/border border-line bg-surface p-4 md:p-8/g)?.length).toBe(1);
  });

  test('images without a recorded size start full width (older media)', () => {
    const html = render(<BlockList blocks={[{ id: 'old', type: 'image', src: '/media/old.jpg', alt: 'Old' }]} />);
    expect(figures(html)[0]).toContain('data-image-layout="landscape"');
    expect(html).not.toMatch(/width="\d+"/);
  });

  test('step images follow the same landscape/portrait rules', () => {
    const html = render(<BlockList blocks={[{
      id: 'st', type: 'steps', items: [
        { title: 'Drawing', body: 'Set out.', image: { src: '/media/p.jpg', alt: 'Portrait step', width: 1000, height: 1500 } },
        { title: 'Install', body: 'Lay.', image: { src: '/media/l.jpg', alt: 'Landscape step', width: 1500, height: 1000 } },
      ],
    }]} />);
    expect(html).toContain('data-image-layout="upright"');
    expect(html).toContain('data-image-layout="landscape"');
    expect(html).not.toMatch(/aspect-\[16\/9\]|object-cover/);
  });
});
