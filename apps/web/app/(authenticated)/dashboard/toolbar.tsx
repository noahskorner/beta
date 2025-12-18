'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { FolderOpen, SquarePen } from 'lucide-react';
import { AccountDropdown } from './account-dropdown';
import { useFiles } from './file-context';

type ToolbarProps = {
  email: string;
  name?: string | null;
};

export function Toolbar({ email, name }: ToolbarProps) {
  const { createFile, createFolder } = useFiles();

  const onCreateFileClick = () =>
    createFile({
      path: 'untitled.md',
      isFolder: false,
    });

  const onCreateFolderClick = () =>
    createFolder({
      path: 'untitled',
      isFolder: true,
    });

  const user = useMemo(
    () => ({
      name: name ?? '',
      email,
      avatar: '',
    }),
    [email, name]
  );

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Button variant="outline" size="sm" type="button" onClick={onCreateFolderClick}>
        <FolderOpen className="mr-2 size-4" />
        New folder
      </Button>
      <Button size="sm" type="button" onClick={onCreateFileClick}>
        <SquarePen className="mr-2 size-4" />
        New file
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <div className="flex flex-1 items-center gap-3">
        <h1 className="text-sm font-semibold leading-none">Dashboard</h1>
      </div>
      <div className="flex items-center gap-2">
        <AccountDropdown user={user} />
      </div>
    </header>
  );
}
