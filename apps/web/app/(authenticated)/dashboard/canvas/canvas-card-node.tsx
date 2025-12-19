'use client';

import { useCallback } from 'react';
import { Handle, NodeProps, Position, NodeResizer } from 'reactflow';
import { MarkdownEditor } from '@/components/markdown-editor/markdown-editor';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

  return (
    <Card
      className={cn(
        'relative flex h-full w-full min-w-[220px] border-border/70 bg-card/90 shadow-sm backdrop-blur',
        selected && 'ring-2 ring-primary/50'
      )}
      style={{ width, height }}
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
      <CardContent className="flex h-full min-h-0 flex-col px-4 pb-4 pt-0">
        <div className="flex-1">
          <MarkdownEditor
            content={data.content ?? ''}
            onContentChange={handleContentChange}
            height="100%"
          />
        </div>
      </CardContent>
    </Card>
  );
}
