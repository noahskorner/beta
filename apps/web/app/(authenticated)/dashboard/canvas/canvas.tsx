'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  Panel,
  Position,
  ReactFlowInstance,
  Viewport,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Plus, RotateCcw } from 'lucide-react';
import { uuid } from '@/app/utils/uuid';

type CanvasNodeData = {
  title: string;
  body?: string;
};

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
        title: 'Ideas hub',
        body: 'Drag cards around the canvas and drag from the handles to connect them.',
      },
    },
    {
      id: 'outline',
      type: 'card',
      position: { x: 240, y: 120 },
      data: {
        title: 'Outline thoughts',
        body: 'Drop in quick thoughts, then arrange them visually to see connections.',
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

function CanvasCardNode({ data, selected }: NodeProps<CanvasNodeData>) {
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
        className="!size-3 !rounded-full !border-none !bg-primary/70"
      />
      <CardHeader className="space-y-1 px-4 py-3">
        <CardTitle className="text-sm leading-tight">{data.title}</CardTitle>
      </CardHeader>
      {data.body ? (
        <CardContent className="px-4 pb-4 pt-0">
          <p className="whitespace-pre-wrap text-xs text-muted-foreground">{data.body}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}

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
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
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
    const title = newTitle.trim() || 'New card';
    const body = newBody.trim();
    setNodes((current) => {
      const basePosition = { x: 160 + current.length * 30, y: 140 + current.length * 24 };
      const position = reactFlowInstance?.project(basePosition) ?? basePosition;

      return [
        ...current,
        {
          id: uuid(),
          type: 'card',
          position,
          data: { title, body: body || undefined },
        },
      ];
    });
    setNewTitle('');
    setNewBody('');
  }, [newBody, newTitle, reactFlowInstance, setNodes]);

  const handleUpdateCard = useCallback(() => {
    if (!selectedNodeId) {
      return;
    }

    const title = editTitle.trim() || 'Untitled card';
    const body = editBody.trim();

    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: { ...node.data, title, body: body || undefined },
            }
          : node
      )
    );
  }, [editBody, editTitle, selectedNodeId, setNodes]);

  const handleReset = useCallback(() => {
    const freshState = createDefaultState();
    setNodes(freshState.nodes);
    setEdges(freshState.edges);
    setViewport(freshState.viewport);
    reactFlowInstance?.setViewport(freshState.viewport, { duration: 0 });
    setSelectedNodeId(null);
    setEditTitle('');
    setEditBody('');
    setNewTitle('');
    setNewBody('');
  }, [reactFlowInstance, setEdges, setNodes]);

  const nodeTypes = useMemo(
    () => ({
      card: CanvasCardNode,
    }),
    []
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
      setEditTitle('');
      setEditBody('');
      return;
    }

    setEditTitle(selectedNode.data.title);
    setEditBody(selectedNode.data.body ?? '');
  }, [selectedNode]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-border/70 bg-muted/20">
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
              <Input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Title"
                className="text-sm md:w-48"
              />
              <textarea
                value={newBody}
                onChange={(event) => setNewBody(event.target.value)}
                placeholder="Optional body"
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
              <Input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                placeholder="Select a card to edit"
                disabled={!selectedNode}
                className="text-sm md:w-48"
              />
              <textarea
                value={editBody}
                onChange={(event) => setEditBody(event.target.value)}
                placeholder="Body for selected card"
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
                <span className="font-medium">
                  {selectedNode ? `Editing: ${selectedNode.data.title}` : 'No card selected'}
                </span>
                <span className="hidden md:inline-flex">•</span>
                <span>
                  Stored locally in{' '}
                  <code className="font-mono text-[11px]">{storageKey}</code>.
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
