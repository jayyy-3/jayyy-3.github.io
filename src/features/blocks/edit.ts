// Pure content edits shared by block forms (kept here so they are unit-tested once).
import { CONTENT_BLOCK_LIMITS, type ComparisonTableContent } from './schema.ts';

/** Adds an empty column and an empty cell to every row; no-op at four columns. */
export function addComparisonColumn(content: ComparisonTableContent): ComparisonTableContent {
    if (content.columns.length >= CONTENT_BLOCK_LIMITS.comparisonColumns.max) return content;
    return {
        ...content,
        columns: [...content.columns, ''],
        rows: content.rows.map((row) => ({ ...row, cells: [...alignedCells(row.cells, content.columns.length), ''] })),
    };
}

/** Removes one column and that cell from every row; no-op at two columns. */
export function removeComparisonColumn(content: ComparisonTableContent, index: number): ComparisonTableContent {
    if (content.columns.length <= CONTENT_BLOCK_LIMITS.comparisonColumns.min) return content;
    return {
        ...content,
        columns: content.columns.filter((_, entry) => entry !== index),
        rows: content.rows.map((row) => ({
            ...row,
            cells: alignedCells(row.cells, content.columns.length).filter((_, entry) => entry !== index),
        })),
    };
}

function alignedCells(cells: readonly string[], length: number): string[] {
    return Array.from({ length }, (_, index) => cells[index] ?? '');
}
