import { useMemo } from 'react';
import { readLayout, type QuiltLayout } from '@/lib/quilt';

const palette = ['#d87962', '#e9bd72', '#73958a', '#bdc9b0', '#d9a4a0', '#597674', '#e2c4a4'];

export function QuiltPreview({ layout, className = '', editable = false, selected = 0, onCellClick }: { layout?: Record<string, unknown>; className?: string; editable?: boolean; selected?: number; onCellClick?: (index: number) => void }) {
  const parsed: QuiltLayout = useMemo(() => readLayout(layout), [layout]);
  return (
    <div className={`relative overflow-hidden rounded-xl border border-border/70 bg-[#ede3cf] p-3 shadow-inner ${className}`}>
      <div className="grid aspect-square h-full w-full gap-1.5" style={{ gridTemplateColumns: `repeat(${parsed.cols}, minmax(0, 1fr))` }} data-testid="quilt-preview">
        {parsed.cells.map((cell, index) => (
          <button key={index} onClick={() => onCellClick?.(index)} disabled={!editable} className={`relative overflow-hidden rounded-[3px] transition-transform duration-200 ${editable ? 'cursor-pointer hover:z-10 hover:scale-105' : 'cursor-default'} ${selected === index && editable ? 'ring-2 ring-[#597674] ring-offset-1' : ''}`} style={{ backgroundColor: cell.color || palette[index % palette.length] }} data-testid={`quilt-cell-${index}`}>
            <span className="absolute inset-0 opacity-20" style={{ backgroundImage: index % 3 === 0 ? 'repeating-linear-gradient(45deg, transparent 0 5px, #fff 6px 7px)' : index % 3 === 1 ? 'radial-gradient(circle at 30% 35%, #fff 0 1px, transparent 2px)' : 'linear-gradient(135deg, transparent 45%, #fff 46% 49%, transparent 50%)' }} />
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-foreground/5" />
    </div>
  );
}