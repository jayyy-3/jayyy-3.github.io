import { describe, expect, test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CONTENT_BLOCK_TYPES, createDefaultBlockContent, type ContentBlock } from '../../../features/blocks/schema';
import { addComparisonColumn, removeComparisonColumn } from '../../../features/blocks/edit';
import AddBlockPanel from './AddBlockPanel';
import BlockForm from './BlockForm';
import { BlockFormContext, type BlockFormHost } from './blockFormContext';

const host: BlockFormHost = {
  disabled: false,
  renderImageField: (request) => <div data-image-field={request.instanceKey}>{request.label}</div>,
  stones: [{ id: 4, label: 'Angola Black', status: 'published' }, { id: 5, label: 'Old Stone', status: 'archived' }],
  finishes: [{ key: 'polished', label: 'Polished' }],
};

function render(element: React.ReactElement, value = host) {
  return renderToStaticMarkup(<BlockFormContext.Provider value={value}>{element}</BlockFormContext.Provider>);
}

const expectedLabels: Record<string, string[]> = {
  heading: ['Small label', 'Heading', 'Introduction'],
  text: ['Text', 'Leave an empty line between paragraphs'],
  quote: ['Quote', 'Name', 'Role'],
  callout: ['Callout title', 'Callout text', 'Edge colour', 'Green edge'],
  stats: ['Number 1', 'Figure', 'Unit', 'What it measures', 'Add number', '1 of up to 4', 'Note under the numbers'],
  steps: ['Introduction', 'Step 1', 'Step title', 'Step text', 'Step image (optional)', 'Add step'],
  spec_table: ['Table title', 'Row 1', 'Label', 'Value', 'Add row'],
  comparison_table: ['Columns', 'Column 1', 'Column 2', 'Add column', 'Row label', 'Add row'],
  stone_cards: ['Title above the cards', 'Stone 1', 'Choose a stone', 'Angola Black (Live)', 'Finish shown', 'Polished', 'Where it is used'],
  image: ['Image', 'Image description', 'Small label', 'Caption'],
  gallery: ['Gallery image 1', 'Gallery image 2', 'Image description', 'Add gallery image', '2 of up to 12'],
  hotspot_image: ['Title above the image', 'Caption'],
  video: ['Video title', 'YouTube link', 'Caption'],
  cta: ['Prompt', 'Supporting text', 'Button text', 'Button link', 'Second button text (optional)', 'Second button link (optional)'],
};

describe('block editor forms', () => {
  test('every block type has a form with visible labels', () => {
    for (const type of CONTENT_BLOCK_TYPES) {
      const block = { key: `block:new:${type}`, id: null, type, sortOrder: 0, content: createDefaultBlockContent(type) } as ContentBlock;
      const html = render(<BlockForm block={block} instanceKey={`media-${block.key}`} onChange={() => {}} />);
      for (const label of expectedLabels[type]) expect(html, `${type}: ${label}`).toContain(label);
    }
  });

  test('hidden stones are not offered unless already chosen', () => {
    const base = { key: 'b', id: null, type: 'stone_cards', sortOrder: 0 } as const;
    expect(render(<BlockForm block={{ ...base, content: createDefaultBlockContent('stone_cards') }} instanceKey="k" onChange={() => {}} />)).not.toContain('Old Stone');
    expect(render(<BlockForm block={{ ...base, content: { title: '', items: [{ stoneGroupId: 5 }] } }} instanceKey="k" onChange={() => {}} />)).toContain('Old Stone (Hidden)');
  });

  test('image fields get stable per-item instance keys', () => {
    const block = { key: 'block:1', id: 1, type: 'gallery', sortOrder: 0, content: createDefaultBlockContent('gallery') } as ContentBlock;
    const html = render(<BlockForm block={block} instanceKey="media-block:1" onChange={() => {}} />);
    expect(html).toContain('data-image-field="media-block:1-gallery-0"');
    expect(html).toContain('data-image-field="media-block:1-gallery-1"');
  });

  test('locked editors disable every control', () => {
    const block = { key: 'b', id: null, type: 'heading', sortOrder: 0, content: createDefaultBlockContent('heading') } as ContentBlock;
    const html = render(<BlockForm block={block} instanceKey="k" onChange={() => {}} />, { ...host, disabled: true });
    expect(html.match(/<input[^>]*disabled/g)?.length).toBe(2);
  });

  test('the Add block panel lists the 14 types in three groups and explains unavailable ones', () => {
    const html = render(<AddBlockPanel heading="Add a block" unavailable={{ video: 'This project already has its one video.' }} onAdd={() => {}} onClose={() => {}} />);
    for (const group of ['Narrative', 'Evidence', 'Media and action']) expect(html).toContain(group);
    expect(html.match(/<li>/g)?.length).toBe(14);
    expect(html).toContain('This project already has its one video.');
    expect(html.match(/<button[^>]*disabled=""/g)?.length).toBe(1);
  });

  test('comparison columns keep every row aligned within two to four columns', () => {
    const start = { title: '', columns: ['A', 'B'], rows: [{ label: 'x', cells: ['1', '2'] }, { label: 'y', cells: ['3'] }] };
    const added = addComparisonColumn(start);
    expect(added.columns).toEqual(['A', 'B', '']);
    expect(added.rows.map((row) => row.cells)).toEqual([['1', '2', ''], ['3', '', '']]);
    expect(removeComparisonColumn(added, 0).rows.map((row) => row.cells)).toEqual([['2', ''], ['', '']]);
    expect(removeComparisonColumn(start, 0)).toBe(start);
    const four = addComparisonColumn(addComparisonColumn(start));
    expect(addComparisonColumn(four)).toBe(four);
  });
});
