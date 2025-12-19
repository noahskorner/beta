'use client';

import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Folder } from './folder';
import { FileNode } from '../../utils/build-file-tree';
import Link from 'next/link';
import { ROUTES } from '@/app/routes';

export interface FileTreeProps {
  file: FileNode;
  draggedFile?: FileNode | null;
  onDragStart: (file: FileNode) => void;
  onDragEnd: () => void;
  onDropOnFolder: (target: FileNode) => void;
}

export function FileTree({ file, draggedFile, onDragStart, onDragEnd, onDropOnFolder }: FileTreeProps) {
  return file.isFolder ? (
    <Folder
      file={file}
      draggedFile={draggedFile}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDropOnFolder={onDropOnFolder}
    />
  ) : (
    <SidebarMenuItem
      key={file.id}
      draggable
      onDragStart={(event) => {
        event.stopPropagation();
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', file.id);
        onDragStart(file);
      }}
      onDragEnd={onDragEnd}
    >
      <SidebarMenuButton size="sm" asChild className="cursor-grab">
        <Link href={ROUTES.dashboard.detail(file.id)}>{file.name}</Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
