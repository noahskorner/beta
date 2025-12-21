'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Handle, NodeProps, Position, NodeResizer } from 'reactflow';
import { MarkdownEditor } from '@/components/markdown-editor/markdown-editor';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SquareArrowOutUpRight, WandSparkles } from 'lucide-react';

export const DEFAULT_CARD_WIDTH = 320;
export const DEFAULT_CARD_HEIGHT = 260;

export type CanvasNodeData = {
  content?: string;
  width?: number;
  height?: number;
};

type CanvasCardNodeProps = NodeProps<CanvasNodeData> & {
  onContentChange: (content: string) => void;
  onResize: (size: { width: number; height: number }) => void;
};

export function CanvasCardNode({ data, selected, onContentChange, onResize }: CanvasCardNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const width = data.width ?? DEFAULT_CARD_WIDTH;
  const height = data.height ?? DEFAULT_CARD_HEIGHT;

  const handleContentChange = useCallback(
    (value: string) => {
      onContentChange(value);
    },
    [onContentChange]
  );

  const handleResize = useCallback(
    (_event: unknown, params: { width: number; height: number }) => {
      onResize({ width: params.width, height: params.height });
    },
    [onResize]
  );

  const handleEnableEditing = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setIsEditing(true);

    const editorElement = editorContainerRef.current?.querySelector<HTMLElement>('.cm-content');
    editorElement?.focus();
  }, []);

  const handleEditorBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const stopEventWhenEditing = useCallback(
    (event: ReactPointerEvent) => {
      if (isEditing) {
        event.stopPropagation();
      }
    },
    [isEditing]
  );

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) {
        setIsEditing(false);
        const editorElement = editorContainerRef.current?.querySelector<HTMLElement>('.cm-content');
        editorElement?.blur();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <Card
      ref={cardRef}
      className={cn(
        'relative flex h-full w-full min-w-[220px] border-border/70 bg-card/90 shadow-sm backdrop-blur md:p-0 md:px-0',
        selected && 'ring-2 ring-primary/50'
      )}
      style={{ width, height }}
      onPointerDownCapture={(event) => {
        if (isEditing) {
          event.stopPropagation();
        }
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={220}
        minHeight={180}
        onResize={handleResize}
        onResizeEnd={handleResize}
        lineStyle={{ borderColor: 'hsl(var(--primary)/0.2)' }}
        handleStyle={{
          width: 10,
          height: 10,
          borderRadius: '9999px',
          border: '1px solid hsl(var(--primary))',
          background: 'hsl(var(--card))',
          boxShadow: '0 1px 2px hsl(var(--primary)/0.3)',
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!z-20 !size-3 !rounded-full !border-none !bg-primary/70"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!z-20 !size-3 !rounded-full !border-none !bg-primary/70"
      />
      <CardContent className="flex h-full min-h-0 flex-col p-0">
        <div className="flex items-center justify-end border-b p-1 bg-background/50 rounded-t-lg">
          <Button size="icon" variant="ghost">
            <WandSparkles />
          </Button>
          <Button size="icon" variant="ghost">
            <SquareArrowOutUpRight />
          </Button>
        </div>
        <div
          className={cn('flex-1 p-2', isEditing ? 'cursor-text' : 'cursor-grab')}
          onDoubleClick={handleEnableEditing}
        >
          <div
            className={cn('h-full', isEditing ? 'nodrag nopan' : 'pointer-events-none select-none')}
            onPointerDown={stopEventWhenEditing}
            ref={editorContainerRef}
          >
            <MarkdownEditor
              content={data.content ?? ''}
              onContentChange={handleContentChange}
              height="100%"
              editable={isEditing}
              autoFocus={isEditing}
              onBlur={handleEditorBlur}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
