'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFiles } from './file-context';
import { FilePlus2, FolderPlus, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { createFile, createFolder } = useFiles();

  const handleCreateFile = () => {
    return createFile({
      path: 'untitled.md',
      isFolder: false,
    });
  };

  const handleCreateFolder = () => {
    return createFolder({
      path: 'untitled',
      isFolder: true,
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-6 py-12">
      <Card className="w-full max-w-2xl border border-dashed border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <Sparkles className="size-6 text-primary" />
          </div>
          <CardTitle>Start your first note</CardTitle>
          <CardDescription>
            Keep things organized with files and folders. Create something new or pick a file from
            the sidebar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={handleCreateFile} className="inline-flex items-center gap-2">
            <FilePlus2 className="size-4" />
            New note
          </Button>
          <Button
            onClick={handleCreateFolder}
            variant="outline"
            className="inline-flex items-center gap-2"
          >
            <FolderPlus className="size-4" />
            New folder
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
