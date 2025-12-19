'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { FindFileResponse } from '../../api/files/find-files.response';
import { buildFileTree, FileNode } from '../../utils/build-file-tree';
import { CreateFileResponse } from '../../api/files/create-file.response';
import { toast } from 'sonner';
import { CreateFileRequest } from '../../api/files/create-file.request';
import { ROUTES } from '../../routes';
import { useRouter } from 'next/navigation';
import { UpdateFileRequest } from '../../api/files/[id]/update-file.request';
import { FindFilesResponse } from '../../api/files/find-files.response';

type FilesContextType = {
  files: FindFileResponse[];
  tree: FileNode[];
  createFile: (request: CreateFileRequest) => Promise<void>;
  createFolder: (request: CreateFileRequest) => Promise<void>;
  moveFile: (fileId: string, newPath: string) => Promise<void>;
};

const FilesContext = createContext<FilesContextType>({
  files: [],
  tree: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createFile: async (_request: CreateFileRequest) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createFolder: async (_request: CreateFileRequest) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  moveFile: async (_fileId: string, _newPath: string) => {},
});

export interface FilesProviderProps {
  children: ReactNode;
  files: FindFileResponse[];
}

export const FilesProvider = ({ files: initialFiles, children }: FilesProviderProps) => {
  const router = useRouter();
  const [files, setFiles] = useState<FindFileResponse[]>(initialFiles);
  const tree = useMemo(() => {
    return buildFileTree([...files]);
  }, [files]);

  const refreshFiles = useCallback(async (): Promise<FindFileResponse[]> => {
    const response = await fetch('/api/files');
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data: FindFilesResponse = await response.json();
    setFiles(data.files);
    return data.files;
  }, []);

  const createFile = async (request: CreateFileRequest) => {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const file: CreateFileResponse = await response.json();
      setFiles((prevFiles) => [...prevFiles, file]);

      router.push(ROUTES.dashboard.detail(file.id));
      toast.success('Successfully created new file!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create new file. Please try again later.');
    }
  };

  const createFolder = async (request: CreateFileRequest) => {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const folder: CreateFileResponse = await response.json();
      setFiles((prevFiles) => [...prevFiles, folder]);

      toast.success('Successfully created new folder!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create new folder. Please try again later.');
    }
  };

  const moveFile = useCallback(
    async (fileId: string, newPath: string) => {
      try {
        const response = await fetch(`/api/files/${fileId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: newPath,
          } satisfies UpdateFileRequest),
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        await refreshFiles();
        toast.success('File moved successfully!');
      } catch (error) {
        console.error(error);
        toast.error('Unable to move file. Please try again later.');
        throw error;
      }
    },
    [refreshFiles]
  );

  return (
    <FilesContext.Provider
      value={{
        files,
        tree: tree,
        createFile,
        createFolder,
        moveFile,
      }}
    >
      {children}
    </FilesContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FilesContext);
  if (!context) {
    throw new Error('useFiles must be used within a FilesProvider');
  }
  return context;
};
