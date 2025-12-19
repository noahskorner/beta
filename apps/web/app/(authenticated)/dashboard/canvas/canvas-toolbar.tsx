'use client';

import type { DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RotateCcw, StickyNote } from 'lucide-react';

export const CANVAS_CARD_DRAG_TYPE = 'application/canvas-card';

type CanvasToolbarProps = {
  onReset: () => void;
};

export function CanvasToolbar({ onReset }: CanvasToolbarProps) {
  const handleDragStart = (event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData(CANVAS_CARD_DRAG_TYPE, 'card');
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="pointer-events-auto w-16 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-lg backdrop-blur">
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col items-center gap-1 text-center text-[11px] text-muted-foreground">
          <Button
            draggable
            variant="secondary"
            size="icon"
            className="h-12 w-12 cursor-grab active:cursor-grabbing"
            onDragStart={handleDragStart}
            title="Drag to add a new card"
          >
            <StickyNote className="size-5" />
          </Button>
        </div>

        <Separator />

        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={onReset}
          title="Reset canvas"
        >
          <RotateCcw className="size-5" />
        </Button>
      </div>
    </div>
  );
}
