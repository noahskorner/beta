'use client';

import { useCallback } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { MarkdownEditor } from '@/components/markdown-editor/markdown-editor';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type CanvasNodeData = {
  content?: string;
};

type CanvasCardNodeProps = NodeProps<CanvasNodeData> & {
  onContentChange: (content: string) => void;
};

export function CanvasCardNode({ data, selected, onContentChange }: CanvasCardNodeProps) {
  const handleContentChange = useCallback(
    (value: string) => {
      onContentChange(value);
    },
    [onContentChange]
  );

  return (
    <Card
      className={cn(
        'relative min-w-[220px] max-w-70 border-border/70 bg-card/90 shadow-sm backdrop-blur',
        selected && 'ring-2 ring-primary/50'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-3 !rounded-full !border-none !bg-primary/70"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!size-3 !rounded-full border-none! !bg-primary/70"
      />
      <CardContent className="px-4 pb-4 pt-0">
        {/* <div className="nodrag rounded-md border border-border/70 bg-background/70 px-2 py-1"> */}
        <MarkdownEditor
          content={data.content ?? ''}
          onContentChange={handleContentChange}
          height="200px"
        />
        {/* </div> */}
      </CardContent>
    </Card>
  );
}
