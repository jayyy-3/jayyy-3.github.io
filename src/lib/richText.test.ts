import { describe, expect, test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import RichText from '../components/blocks/RichText';
import { parseRichInline, parseRichText } from './richText';

describe('restricted Markdown', () => {
  test('recognises paragraphs, bold, links and lists only', () => {
    expect(parseRichText('First line\ncontinues.\n\nSecond **bold** paragraph.\n- one\n- **two**')).toEqual([
      { kind: 'paragraph', children: [{ kind: 'text', text: 'First line continues.' }] },
      {
        kind: 'paragraph',
        children: [
          { kind: 'text', text: 'Second ' },
          { kind: 'strong', children: [{ kind: 'text', text: 'bold' }] },
          { kind: 'text', text: ' paragraph.' },
        ],
      },
      {
        kind: 'list',
        items: [[{ kind: 'text', text: 'one' }], [{ kind: 'strong', children: [{ kind: 'text', text: 'two' }] }]],
      },
    ]);
  });

  test('links keep safe internal and external destinations only', () => {
    expect(parseRichInline('See [samples](/contact?intent=sample-request) or [Urblo](https://urblo.com.au).')).toEqual([
      { kind: 'text', text: 'See ' },
      { kind: 'link', href: '/contact?intent=sample-request', external: false, children: [{ kind: 'text', text: 'samples' }] },
      { kind: 'text', text: ' or ' },
      { kind: 'link', href: 'https://urblo.com.au/', external: true, children: [{ kind: 'text', text: 'Urblo' }] },
      { kind: 'text', text: '.' },
    ]);
    for (const unsafe of ['javascript:void0', '//evil.example', 'data:text/html,x', '/%5cevil']) {
      expect(parseRichInline(`[click](${unsafe})`)).toEqual([{ kind: 'text', text: 'click' }]);
    }
  });

  test('unclosed syntax stays literal and headings or HTML are not interpreted', () => {
    expect(parseRichInline('**open and [label](')).toEqual([{ kind: 'text', text: '**open and [label](' }]);
    expect(parseRichText('# Not a heading')).toEqual([{ kind: 'paragraph', children: [{ kind: 'text', text: '# Not a heading' }] }]);
  });

  test('rendering escapes HTML and adds rel="noopener" to external links', () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null,
        createElement(RichText, { source: '<script>alert(1)</script> <b>x</b>\n\n[Out](https://example.com) [In](/projects)' })),
    );
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('href="https://example.com/" rel="noopener"');
    expect(html).toContain('href="/projects"');
  });
});
