'use client';

import { useCallback, useEffect, useMemo, useState, type DragEvent } from 'react';
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
import { uuid } from '@/app/utils/uuid';
import {
  CanvasCardNode,
  CanvasNodeData,
  DEFAULT_CARD_HEIGHT,
  DEFAULT_CARD_WIDTH,
} from './canvas-card-node';
import { CanvasToolbar, CANVAS_CARD_DRAG_TYPE } from './canvas-toolbar';

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
        width: DEFAULT_CARD_WIDTH,
        height: DEFAULT_CARD_HEIGHT,
      },
    },
    {
      id: 'outline',
      type: 'card',
      position: { x: 240, y: 120 },
      data: {
        content: 'Drop in quick thoughts, then arrange them visually to see connections.',
        width: DEFAULT_CARD_WIDTH,
        height: DEFAULT_CARD_HEIGHT,
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
  const [hydrated, setHydrated] = useState(false);

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

  const handleCardResize = useCallback(
    (nodeId: string, size: { width: number; height: number }) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, width: size.width, height: size.height } }
            : node
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
  }, [reactFlowInstance, setEdges, setNodes]);

  const handleDragOver = useCallback((event: DragEvent) => {
    if (!event.dataTransfer?.types.includes(CANVAS_CARD_DRAG_TYPE)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const cardType = event.dataTransfer?.getData(CANVAS_CARD_DRAG_TYPE);

      if (!reactFlowInstance || !cardType) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodes((current) => [
        ...current,
        {
          id: uuid(),
          type: 'card',
          position,
          data: {
            width: DEFAULT_CARD_WIDTH,
            height: DEFAULT_CARD_HEIGHT,
          },
        },
      ]);
    },
    [reactFlowInstance, setNodes]
  );

  const nodeTypes = useMemo(
    () => ({
      card: (props: NodeProps<CanvasNodeData>) => (
        <CanvasCardNode
          {...props}
          onContentChange={(content) => handleCardContentChange(props.id, content)}
          onResize={(size) => handleCardResize(props.id, size)}
        />
      ),
    }),
    [handleCardContentChange, handleCardResize]
  );

  const onMoveEnd = useCallback((_event: unknown, nextViewport: Viewport) => {
    setViewport(nextViewport);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted/20">
      <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
        <CanvasToolbar onReset={handleReset} />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultViewport={viewport}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMoveEnd={onMoveEnd}
        onInit={setReactFlowInstance}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        nodeTypes={nodeTypes}
        panOnScroll
        selectionOnDrag
        deleteKeyCode={['Delete', 'Backspace']}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={22} size={1} color="hsl(var(--muted-foreground)/0.3)" />
        <Controls className="border border-border/70 bg-card/90 shadow-sm" />
      </ReactFlow>
    </div>
  );
}

export default Canvas;
