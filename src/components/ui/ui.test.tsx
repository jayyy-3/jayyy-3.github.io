import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button';
import Card from './Card';
import PageIntro from './PageIntro';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { buttonClassName, headingClassName } from './styles';

const reducedMotion = vi.hoisted(() => ({ value: false }));
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return { ...actual, useReducedMotion: () => reducedMotion.value };
});

function render(element: ReactElement) {
  return renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);
}

function classOf(html: string, tag: string) {
  const match = html.match(new RegExp(`<${tag}[^>]*class="([^"]*)"`));
  return match?.[1].split(' ') ?? [];
}

describe('Button', () => {
  it.each([
    ['primary', 'urblo-button-inverse'],
    ['inverse', 'urblo-button-signal'],
    ['ghost', 'urblo-button-ghost'],
    ['link', 'urblo-button-link'],
  ] as const)('maps the %s variant to %s', (variant, className) => {
    expect(buttonClassName({ variant }).split(' ')).toContain(className);
  });

  it('defaults to a primary native button with type="button"', () => {
    const html = render(<Button>Send</Button>);
    expect(html).toMatch(/^<button[^>]*type="button"/);
    expect(classOf(html, 'button')).toContain('urblo-button-inverse');
  });

  it('keeps an explicit submit type and disabled state', () => {
    const html = render(
      <Button type="submit" variant="inverse" disabled>
        Submit
      </Button>,
    );
    expect(html).toContain('type="submit"');
    expect(html).toContain('disabled=""');
    expect(classOf(html, 'button')).toContain('urblo-button-signal');
  });

  it('renders a router link for `to` and an anchor for `href`', () => {
    const link = render(
      <Button variant="ghost" to="/capabilities">
        Capabilities
      </Button>,
    );
    expect(link).toMatch(/^<a[^>]*href="\/capabilities"/);
    expect(classOf(link, 'a')).toContain('urblo-button-ghost');

    const anchor = render(
      <Button variant="ghost" surface="dark" href="/file.pdf" download="file.pdf">
        Download
      </Button>,
    );
    expect(anchor).toContain('download="file.pdf"');
    expect(classOf(anchor, 'a')).toEqual(expect.arrayContaining(['urblo-button-ghost', 'urblo-button--on-dark']));
  });

  it('applies the small size to boxed variants only and passes layout classes through', () => {
    expect(buttonClassName({ variant: 'ghost', size: 'sm', className: 'mt-4' }).split(' ')).toEqual(
      expect.arrayContaining(['urblo-button--sm', 'mt-4']),
    );
    expect(buttonClassName({ variant: 'link', size: 'sm' })).not.toContain('urblo-button--sm');
  });
});

describe('SectionHeading', () => {
  it('renders the section level as an h2 in Avenir semibold on the 34/44 steps', () => {
    const html = render(<SectionHeading title="Stone, finish, use." />);
    const classes = classOf(html, 'h2');
    expect(classes).toEqual(expect.arrayContaining(['font-semibold', 'text-title', 'md:text-title-lg', 'text-ink']));
    expect(classes).not.toContain('lg:text-display');
    expect(html).toContain('data-heading-level="section"');
  });

  it('renders the display level light on the 34/44/64 steps, with eyebrow and copy', () => {
    const html = render(
      <SectionHeading level="display" as="h3" eyebrow="Our approach" title="We resolve it." copy="Upstream." surface="dark" />,
    );
    expect(classOf(html, 'h3')).toEqual(
      expect.arrayContaining(['font-light', 'text-title', 'md:text-title-lg', 'lg:text-display', 'text-inverse', 'mt-4']),
    );
    expect(html).toContain('urblo-eyebrow text-inverse-muted');
    expect(html).toMatch(/<p class="mt-6 text-lead text-inverse-body">Upstream\.<\/p>/);
  });

  it('only offers two levels', () => {
    expect(headingClassName('display')).not.toEqual(headingClassName('section'));
  });
});

describe('PageIntro', () => {
  it('follows the Projects pattern: breadcrumb, shared page title and lede', () => {
    const html = render(
      <PageIntro
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Projects' }]}
        title="Projects"
        lede="Proof of stone as civic infrastructure."
      />,
    );
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain('href="/"');
    expect(html).toContain('aria-current="page"');
    expect(classOf(html, 'h1')).toEqual(expect.arrayContaining(['urblo-page-title', 'mt-0']));
    expect(html).toContain('text-lead font-medium');
  });

  it('renders the hero size on dark surfaces with actions', () => {
    const html = render(
      <PageIntro
        surface="dark"
        size="hero"
        eyebrow="May 2026"
        title="Capability Statement"
        actions={<Button variant="inverse">Explore</Button>}
      />,
    );
    expect(classOf(html, 'h1')).toEqual(expect.arrayContaining(['lg:text-hero', 'text-inverse', 'mt-5']));
    expect(html).toContain('urblo-button-signal');
  });
});

describe('Card', () => {
  it('draws a bordered frame without a resting shadow', () => {
    const html = render(<Card>Body</Card>);
    const classes = classOf(html, 'div');
    expect(classes).toEqual(expect.arrayContaining(['border', 'border-line', 'rounded']));
    expect(classes.some((value) => value.startsWith('shadow'))).toBe(false);
  });

  it('renders the borderless Projects card structure with media, meta, title and copy', () => {
    const html = render(
      <Card as="article" variant="borderless" media={<img src="/a.jpg" alt="A" />} meta="Civic landscape" title="West Side Place">
        <p>Summary</p>
      </Card>,
    );
    expect(html).toContain('<article data-card="borderless" class="group border-t pt-5 border-line"');
    expect(html).toContain('aspect-[4/3]');
    expect(html).toContain('Civic landscape');
    expect(classOf(html, 'h3')).toEqual(expect.arrayContaining(['text-title-sm', 'font-semibold']));
  });

  it('uses dark-surface tones', () => {
    const html = render(<Card surface="dark" title="Moon Gate" />);
    expect(html).toContain('border-line-inverse');
    expect(classOf(html, 'h3')).toContain('text-inverse');
  });
});

describe('Reveal', () => {
  it('starts hidden and 24px low', () => {
    reducedMotion.value = false;
    const html = render(
      <Reveal className="max-w-2xl">
        <p>Visible content</p>
      </Reveal>,
    );
    expect(html).toContain('class="max-w-2xl"');
    expect(html).toContain('Visible content');
    expect(html).toMatch(/opacity:0/);
    expect(html).toMatch(/translateY\(24px\)/);
  });

  it('only fades under reduced motion', () => {
    reducedMotion.value = true;
    const html = render(<Reveal>Calm</Reveal>);
    expect(html).toMatch(/opacity:0/);
    expect(html).not.toMatch(/translateY/);
    reducedMotion.value = false;
  });
});
