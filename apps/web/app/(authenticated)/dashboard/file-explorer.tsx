'use client';

import { SidebarMenu } from '@/components/ui/sidebar';
import { useFiles } from './file-context';
import { FileTree } from './file-tree';
import { useCallback, useState } from 'react';
import { FileNode } from '../../utils/build-file-tree';
import { toast } from 'sonner';

export function FileExplorer() {
  const { tree, moveFile } = useFiles();
  const [draggedFile, setDraggedFile] = useState<FileNode | null>(null);

  const resetDrag = useCallback(() => setDraggedFile(null), []);

  const combinePath = useCallback((parentPath: string | null, name: string) => {
    const normalizedParent = parentPath ? parentPath.replace(/\/+$/, '') : '';
    const normalizedName = name.replace(/^\/+/, '');

    if (!normalizedParent) {
      return `/${normalizedName}`;
    }

    const parentWithLeadingSlash = normalizedParent.startsWith('/')
      ? normalizedParent
      : `/${normalizedParent}`;

    return `${parentWithLeadingSlash}/${normalizedName}`;
  }, []);

  const handleMove = useCallback(
    async (file: FileNode, targetFolder: FileNode | null) => {
      if (!file) return;
      if (targetFolder && !targetFolder.isFolder) return;
      if (targetFolder && targetFolder.path.startsWith(`${file.path}/`)) {
        toast.error('Cannot move an item into one of its own descendants.');
        resetDrag();
        return;
      }

      const newPath = combinePath(targetFolder?.path ?? null, file.name);
      if (newPath === file.path) {
        resetDrag();
        return;
      }

      try {
        await moveFile(file.id, newPath);
      } catch {
        // Error toast handled inside moveFile
      } finally {
        resetDrag();
      }
    },
    [combinePath, moveFile, resetDrag]
  );

  return (
    <SidebarMenu
      onDragOver={(event) => {
        if (draggedFile) {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        }
      }}
      onDrop={(event) => {
        if (!draggedFile) return;
        event.preventDefault();
        handleMove(draggedFile, null);
      }}
    >
      {tree.map((file) => (
        <FileTree
          key={file.id}
          file={file}
          draggedFile={draggedFile}
          onDragStart={setDraggedFile}
          onDragEnd={resetDrag}
          onDropOnFolder={(target) => {
            if (!draggedFile) return;
            handleMove(draggedFile, target);
          }}
        />
      ))}
    </SidebarMenu>
  );
}
