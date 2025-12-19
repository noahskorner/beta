'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from '@/components/ui/sidebar';
import { FileTree, FileTreeProps } from './file-tree';
import { useEffect, useState } from 'react';
import { ChevronRight, FolderOpen, PencilLine, SquarePen, Trash } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../../../components/ui/context-menu';
import { useFiles } from './file-context';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FolderProps extends FileTreeProps {}

export function Folder({
  file: node,
  draggedFile,
  onDragStart,
  onDragEnd,
  onDropOnFolder,
}: FolderProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { createFile, createFolder } = useFiles();

  const onCreateFileClick = () => {
    return createFile({
      path: `${node.path}/untitled.md`,
      isFolder: false,
    });
  };

  const onCreateFolderClick = () => {
    return createFolder({
      path: `${node.path}/untitled`,
      isFolder: true,
    });
  };

  const canAcceptDrop =
    draggedFile != null &&
    draggedFile.id !== node.id &&
    !node.path.startsWith(`${draggedFile.path}/`);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!draggedFile) {
      setIsDragOver(false);
    }
  }, [draggedFile]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible [&[data-state=open]>li>button>svg:first-child]:rotate-90"
    >
      <SidebarMenuItem
        onDragOver={(event) => {
          if (canAcceptDrop) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
          }
        }}
        onDragEnter={(event) => {
          if (!canAcceptDrop) return;
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(event) => {
          if (!canAcceptDrop) return;
          const relatedTarget = event.relatedTarget as Node | null;
          if (relatedTarget && event.currentTarget.contains(relatedTarget)) return;
          setIsDragOver(false);
        }}
        onDrop={(event) => {
          if (!canAcceptDrop) return;
          event.preventDefault();
          setIsDragOver(false);
          onDropOnFolder(node);
          setIsOpen(true);
        }}
      >
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                size="sm"
                draggable
                onDragStart={(event) => {
                  event.stopPropagation();
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', node.id);
                  onDragStart(node);
                }}
                onDragEnd={onDragEnd}
                className={cn(
                  'cursor-grab',
                  isDragOver && 'bg-primary/10 text-primary ring-1 ring-primary/30'
                )}
              >
                <ChevronRight className="transition-transform" />
                {node.name}
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </ContextMenuTrigger>

          <ContextMenuContent className="w-48">
            <ContextMenuItem onClick={onCreateFolderClick} className="text-xs">
              <FolderOpen /> New folder...
            </ContextMenuItem>
            <ContextMenuItem onClick={onCreateFileClick} className="text-xs">
              <SquarePen /> New file...
            </ContextMenuItem>
            <ContextMenuItem className="text-xs">
              <PencilLine /> Rename
            </ContextMenuItem>
            <ContextMenuItem variant="destructive" className="text-xs">
              <Trash /> Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {(node.children?.length ?? 0) > 0 && (
          <CollapsibleContent>
            <SidebarMenuSub className="ml-1 mr-0 pl-1 pr-0">
              {node.children?.map((child) => (
                <FileTree
                  key={child.id}
                  file={child}
                  draggedFile={draggedFile}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDropOnFolder={onDropOnFolder}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
}
