'use client';

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Folder } from './folder';
import { FileNode } from '../../utils/build-file-tree';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/app/routes';

export interface FileTreeProps {
  file: FileNode;
  draggedFile?: FileNode | null;
  onDragStart: (file: FileNode) => void;
  onDragEnd: () => void;
  onDropOnFolder: (target: FileNode) => void;
}

export function FileTree({ file, draggedFile, onDragStart, onDragEnd, onDropOnFolder }: FileTreeProps) {
  const router = useRouter();

  return file.isFolder ? (
    <Folder
      file={file}
      draggedFile={draggedFile}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDropOnFolder={onDropOnFolder}
    />
  ) : (
    <SidebarMenuItem key={file.id}>
      <SidebarMenuButton
        size="sm"
        className="cursor-grab"
        draggable
        onClick={() => router.push(ROUTES.dashboard.detail(file.id))}
        onDragStart={(event) => {
          event.stopPropagation();
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', file.id);
          onDragStart(file);
        }}
        onDragEnd={onDragEnd}
      >
        {file.name}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
