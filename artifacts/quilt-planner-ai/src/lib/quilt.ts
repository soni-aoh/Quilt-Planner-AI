import type { ProjectLayoutJson } from '@workspace/api-client-react';

export type LayoutCell = { fabricId?: string; color?: string };
export type QuiltLayout = { rows: number; cols: number; cells: LayoutCell[] };

export function readLayout(value: ProjectLayoutJson | undefined): QuiltLayout {
  const candidate = value as Partial<QuiltLayout> | undefined;
  const rows = Number(candidate?.rows) || 6;
  const cols = Number(candidate?.cols) || 6;
  const cells = Array.isArray(candidate?.cells) ? candidate.cells : [];
  return {
    rows,
    cols,
    cells: Array.from({ length: rows * cols }, (_, index) => cells[index] || {}),
  };
}

export function makeLayout(rows: number, cols: number): QuiltLayout {
  const swatches = ['#d87962', '#e9bd72', '#73958a', '#bdc9b0', '#d9a4a0', '#597674'];
  return {
    rows,
    cols,
    cells: Array.from({ length: rows * cols }, (_, index) => ({
      color: swatches[index % swatches.length],
    })),
  };
}

export function quiltTypeLabel(type?: string) {
  return ({ grid: 'Patchwork grid', medallion: 'Medallion', strips: 'Strip quilt', custom: 'Custom layout' } as Record<string, string>)[type || ''] || 'Quilt plan';
}

export function relativeDate(value?: string) {
  if (!value) return 'Not saved yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}