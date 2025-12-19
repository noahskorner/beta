'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  Node,
  NodeProps,
  ReactFlowInstance,
  Viewport,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Plus, RotateCcw } from 'lucide-react';
import { uuid } from '@/app/utils/uuid';
import { CanvasCardNode, CanvasNodeData } from './canvas-card-node';

type CanvasState = {
  nodes: Node<CanvasNodeData>[];
  edges: Edge[];
  viewport: Viewport;
};

const STORAGE_KEY = 'canvas';

const BASE_CANVAS_STATE: CanvasState = {
  nodes: [
    {
      id: 'origin',
      type: 'card',
      position: { x: 0, y: 0 },
      data: {
        content: 'Drag cards around the canvas and drag from the handles to connect them.',
      },
    },
    {
      id: 'outline',
      type: 'card',
      position: { x: 240, y: 120 },
      data: {
        content: 'Drop in quick thoughts, then arrange them visually to see connections.',
      },
    },
  ],
  edges: [
    {
      id: 'e-origin-outline',
      source: 'origin',
      target: 'outline',
      animated: true,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 1.5 },
    },
  ],
  viewport: { x: 120, y: 100, zoom: 1 },
};

const createDefaultState = (): CanvasState => ({
  nodes: BASE_CANVAS_STATE.nodes.map((node) => ({
    ...node,
    position: { ...node.position },
    data: { ...node.data },
  })),
  edges: BASE_CANVAS_STATE.edges.map((edge) => ({ ...edge })),
  viewport: { ...BASE_CANVAS_STATE.viewport },
});

export interface CanvasProps {
  storageKey?: string;
}

export function Canvas({ storageKey = STORAGE_KEY }: CanvasProps) {
  const defaultState = useMemo(createDefaultState, []);
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNodeData>(defaultState.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultState.edges);
  const [viewport, setViewport] = useState<Viewport>(defaultState.viewport);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [newContent, setNewContent] = useState('');
  const [editContent, setEditContent] = useState('');
  const [hydrated, setHydrated] = useState(false);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<CanvasState>;
        if (parsed.nodes?.length) {
          setNodes(parsed.nodes);
        }
        if (parsed.edges) {
          setEdges(parsed.edges);
        }
        if (parsed.viewport) {
          setViewport(parsed.viewport);
        }
      } catch (error) {
        console.error('Failed to parse canvas state', error);
      }
    }

    setHydrated(true);
  }, [setEdges, setNodes, setViewport, storageKey]);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') {
      return;
    }

    const payload: CanvasState = { nodes, edges, viewport };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [edges, nodes, storageKey, viewport, hydrated]);

  useEffect(() => {
    if (reactFlowInstance && hydrated && viewport) {
      reactFlowInstance.setViewport(viewport, { duration: 0 });
    }
  }, [hydrated, reactFlowInstance, viewport]);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((previousEdges) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { strokeWidth: 1.5 },
          },
          previousEdges
        )
      ),
    [setEdges]
  );

  const handleAddCard = useCallback(() => {
    const content = newContent.trim();
    setNodes((current) => {
      const basePosition = { x: 160 + current.length * 30, y: 140 + current.length * 24 };
      const position = reactFlowInstance?.project(basePosition) ?? basePosition;

      return [
        ...current,
        {
          id: uuid(),
          type: 'card',
          position,
          data: { content: content || undefined },
        },
      ];
    });

    setNewContent('');
  }, [newContent, reactFlowInstance, setNodes]);

  const handleUpdateCard = useCallback(() => {
    if (!selectedNodeId) {
      return;
    }

    const content = editContent.trim();

    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: { ...node.data, content: content || undefined },
            }
          : node
      )
    );
  }, [editContent, selectedNodeId, setNodes]);

  const handleCardContentChange = useCallback(
    (nodeId: string, content: string) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, content: content } } : node
        )
      );
    },
    [setNodes]
  );

  const handleReset = useCallback(() => {
    const freshState = createDefaultState();
    setNodes(freshState.nodes);
    setEdges(freshState.edges);
    setViewport(freshState.viewport);
    reactFlowInstance?.setViewport(freshState.viewport, { duration: 0 });
    setSelectedNodeId(null);
    setEditContent('');
    setNewContent('');
  }, [reactFlowInstance, setEdges, setNodes]);

  const nodeTypes = useMemo(
    () => ({
      card: (props: NodeProps<CanvasNodeData>) => (
        <CanvasCardNode
          {...props}
          onContentChange={(content) => handleCardContentChange(props.id, content)}
        />
      ),
    }),
    [handleCardContentChange]
  );

  const onMoveEnd = useCallback((_event: unknown, nextViewport: Viewport) => {
    setViewport(nextViewport);
  }, []);

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node<CanvasNodeData>[] }) => {
      setSelectedNodeId(selectedNodes[0]?.id ?? null);
    },
    []
  );

  useEffect(() => {
    if (!selectedNode) {
      setEditContent('');
      return;
    }

    setEditContent(selectedNode.data.content ?? '');
  }, [selectedNode]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultViewport={viewport}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMoveEnd={onMoveEnd}
        onInit={setReactFlowInstance}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        panOnScroll
        selectionOnDrag
        deleteKeyCode={['Delete', 'Backspace']}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={22} size={1} color="hsl(var(--muted-foreground)/0.3)" />
        <Controls className="border border-border/70 bg-card/90 shadow-sm" />
      </ReactFlow>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-3">
        <div className="pointer-events-auto w-full max-w-5xl rounded-2xl border border-border/70 bg-card/95 px-4 py-3 shadow-xl backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Canvas toolbar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-0">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                New card
              </p>
              <textarea
                value={newContent}
                onChange={(event) => setNewContent(event.target.value)}
                placeholder="Optional content"
                rows={1}
                className="h-10 w-full resize-none rounded-md border border-border/70 bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:flex-1"
              />
              <Button onClick={handleAddCard} size="sm" className="shrink-0">
                <Plus className="mr-2 size-4" />
                Add
              </Button>
            </div>

            <Separator />

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Selected
              </p>
              <textarea
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                placeholder="Content for selected card"
                rows={1}
                disabled={!selectedNode}
                className={cn(
                  'h-10 w-full resize-none rounded-md border border-border/70 bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:flex-1',
                  !selectedNode && 'opacity-60'
                )}
              />
              <Button
                onClick={handleUpdateCard}
                size="sm"
                variant="secondary"
                className="shrink-0"
                disabled={!selectedNode}
              >
                Update
              </Button>
            </div>

            <Separator />

            <div className="flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-flex">•</span>
                <span>
                  Stored locally in <code className="font-mono text-[11px]">{storageKey}</code>.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
                  <RotateCcw className="size-4" />
                  Reset canvas
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}

export default Canvas;
