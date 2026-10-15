import { describe, expect, test } from 'vitest';
import {
  CONTENT_BLOCK_DEFINITIONS,
  CONTENT_BLOCK_TYPES,
  blockMediaAssetIds,
  blockStoneGroupIds,
  createDefaultBlockContent,
  isSafeBlockHref,
  normalizeYouTubeId,
  summarizeContentBlock,
} from './schema';
import { isLegacyProjectDraft, upgradeLegacyMediaBlock, upgradeLegacyProjectDraft } from './upgrade';

describe('content-block contract', () => {
  test('exactly the 14 approved types, each with one editor definition in three groups', () => {
    expect(CONTENT_BLOCK_TYPES).toEqual([
      'heading', 'text', 'quote', 'callout', 'stats', 'steps', 'spec_table',
      'comparison_table', 'stone_cards', 'image', 'gallery', 'hotspot_image', 'video', 'cta',
    ]);
    expect(CONTENT_BLOCK_DEFINITIONS.map((definition) => definition.type)).toEqual([...CONTENT_BLOCK_TYPES]);
    expect(new Set(CONTENT_BLOCK_DEFINITIONS.map((definition) => definition.group))).toEqual(
      new Set(['narrative', 'evidence', 'media_action']),
    );
    for (const definition of CONTENT_BLOCK_DEFINITIONS) {
      expect(definition.label.trim()).not.toBe('');
      expect(definition.description.trim()).not.toBe('');
    }
  });

  test('defaults are fresh copies', () => {
    const first = createDefaultBlockContent('stats');
    first.items[0].value = '12';
    expect(createDefaultBlockContent('stats').items[0].value).toBe('');
  });

  test('media and stone references come from the content', () => {
    expect(blockMediaAssetIds({ type: 'image', content: { mediaAssetId: 4, alt: '' } })).toEqual([4]);
    expect(blockMediaAssetIds({ type: 'gallery', content: { items: [{ mediaAssetId: 2 }, { mediaAssetId: 2 }, { mediaAssetId: 5 }] } })).toEqual([2, 5]);
    expect(blockMediaAssetIds({ type: 'steps', content: { items: [{ title: 'a', mediaAssetId: null }, { mediaAssetId: 8 }] } })).toEqual([8]);
    expect(blockMediaAssetIds({ type: 'video', content: { mediaAssetId: 9 } })).toEqual([]);
    expect(blockStoneGroupIds({ type: 'stone_cards', content: { items: [{ stoneGroupId: 3 }, { stoneGroupId: null }, { stoneGroupId: 3 }] } })).toEqual([3]);
    expect(blockStoneGroupIds({ type: 'image', content: { stoneGroupId: 3 } })).toEqual([]);
  });

  test('links and YouTube addresses', () => {
    expect(isSafeBlockHref('/contact')).toBe(true);
    expect(isSafeBlockHref('https://urblo.com.au/projects')).toBe(true);
    for (const unsafe of ['', '//evil.example', 'javascript:alert(1)', '/%2f%2fevil', 'mailto:a@b.c']) {
      expect(isSafeBlockHref(unsafe)).toBe(false);
    }
    expect(normalizeYouTubeId('https://www.youtube.com/watch?v=abcdefghijk')).toBe('abcdefghijk');
    expect(normalizeYouTubeId('https://youtu.be/abcdefghijk?t=4')).toBe('abcdefghijk');
    expect(normalizeYouTubeId('https://www.youtube-nocookie.com/embed/abcdefghijk')).toBe('abcdefghijk');
    expect(normalizeYouTubeId('https://vimeo.com/abcdefghijk')).toBeNull();
  });

  test('collapsed editor summaries', () => {
    expect(summarizeContentBlock({ type: 'stats', content: { items: [{ value: '1,200', unit: 'm²', label: 'Paving' }, { value: '14', label: 'Weeks' }] } })).toBe('1,200 m² · 14');
    expect(summarizeContentBlock({ type: 'steps', content: { items: [{}, {}] } })).toBe('2 steps');
    expect(summarizeContentBlock({ type: 'gallery', content: { items: [{}] } })).toBe('1 image');
    expect(summarizeContentBlock({ type: 'heading', content: { title: ' From intent ' } })).toBe('From intent');
  });

  test('legacy media blocks upgrade one to one with their provenance', () => {
    expect(upgradeLegacyMediaBlock({
      key: 'media:7', id: 7, mediaRole: 'normal_image', mediaAssetId: 3, projectMaterialMapKey: null,
      blockTitle: 'Title', youtubeUrl: '', label: 'Detail', caption: 'Caption', sortOrder: 2,
    }, 0)).toEqual({
      key: 'block:legacy:media:7',
      id: null,
      type: 'image',
      sortOrder: 2,
      content: { mediaAssetId: 3, alt: '', title: 'Title', label: 'Detail', caption: 'Caption', legacyProjectMediaId: 7 },
    });
    expect(upgradeLegacyMediaBlock({
      key: 'media:new:x', id: null, mediaRole: 'hotspot_image', mediaAssetId: null, projectMaterialMapKey: 'map:2',
      blockTitle: '', youtubeUrl: '', label: '', caption: '', sortOrder: 0,
    }, 0).content).toEqual({ projectMaterialMapKey: 'map:2', title: '', label: '', caption: '' });
    expect(isLegacyProjectDraft({ mediaBlocks: [] })).toBe(true);
    expect(isLegacyProjectDraft({ schemaVersion: 1, blocks: [] })).toBe(true);
    expect(isLegacyProjectDraft({ schemaVersion: 2, blocks: [] })).toBe(false);
    expect(upgradeLegacyProjectDraft({ schemaVersion: 1, project: {} })).toEqual({ schemaVersion: 2, project: {}, blocks: [] });
  });
});
