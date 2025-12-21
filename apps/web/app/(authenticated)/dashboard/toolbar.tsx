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
    <header className="flex h-11 w-full items-center justify-between border-b bg-sidebar px-2 fixed top-0 z-10">
      <div className="flex items-center justify-between">
        <SidebarTrigger variant="ghost" size="icon" />
        <Separator orientation="vertical" className="h-6" />
        <Button onClick={onCreateFileClick} variant="ghost" size={'icon'} className="size-7">
          <SquarePen />
        </Button>
        <Button onClick={onCreateFolderClick} variant="ghost" size={'icon'} className="size-7">
          <FolderOpen />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <AccountDropdown user={user} />
      </div>
    </header>
  );
}
