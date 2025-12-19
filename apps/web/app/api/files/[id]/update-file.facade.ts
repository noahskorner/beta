import { ContainerClient } from '@azure/storage-blob';
import { PRISMA } from '@/app/prisma';
import { getContainerClient } from '../../../container-client';

export interface UpdateFileCommand {
  id: string;
  content: string | undefined;
  path?: string;
}

export class UpdateFileFacade {
  public async update({ id, content, path }: UpdateFileCommand) {
    const file = await PRISMA.file.findUniqueOrThrow({
      where: {
        id: id,
      },
    });

    const containerClient = await getContainerClient();
    const pathChanged = path != null && path !== file.path;

    if (pathChanged) {
      await this.moveEntry({ fileId: id, filePath: file.path, newPath: path, containerClient });
    }

    if (!file.isFolder && content !== undefined) {
      const targetPath = pathChanged ? path : file.path;
      const blockBlobClient = containerClient.getBlockBlobClient(targetPath);
      await blockBlobClient.upload(content ?? '', Buffer.byteLength(content ?? ''));
    }

    if (!pathChanged) {
      await PRISMA.file.update({
        where: {
          id: id,
        },
        data: {
          updatedAt: new Date(),
        },
      });
    }
  }

  private async moveEntry({
    fileId,
    filePath,
    newPath,
    containerClient,
  }: {
    fileId: string;
    filePath: string;
    newPath: string;
    containerClient: ContainerClient;
  }) {
    if (newPath === filePath) return;

    const file = await PRISMA.file.findUniqueOrThrow({
      where: { id: fileId },
    });

    if (file.isFolder && newPath.startsWith(`${filePath}/`)) {
      throw new Error('Cannot move a folder into one of its descendants');
    }

    if (file.isFolder) {
      const descendants = await PRISMA.file.findMany({
        where: {
          OR: [{ id: fileId }, { path: { startsWith: `${filePath}/` } }],
        },
        orderBy: { path: 'asc' },
      });

      const moves = descendants.map((entry) => {
        const updatedPath =
          entry.id === fileId ? newPath : entry.path.replace(`${filePath}/`, `${newPath}/`);

        return {
          id: entry.id,
          isFolder: entry.isFolder,
          fromPath: entry.path,
          toPath: updatedPath,
        };
      });

      await this.ensurePathsAvailable(
        moves.map((move) => move.toPath),
        moves.map((move) => move.id)
      );

      for (const move of moves.filter(
        (entry) => !entry.isFolder && entry.fromPath !== entry.toPath
      )) {
        await this.copyBlob(containerClient, move.fromPath, move.toPath);
      }

      await PRISMA.$transaction(
        moves.map((move) =>
          PRISMA.file.update({
            where: { id: move.id },
            data: { path: move.toPath },
          })
        )
      );

      for (const move of moves.filter(
        (entry) => !entry.isFolder && entry.fromPath !== entry.toPath
      )) {
        await this.deleteBlob(containerClient, move.fromPath);
      }
      return;
    }

    await this.ensurePathsAvailable([newPath], [fileId]);
    await this.copyBlob(containerClient, filePath, newPath);
    await PRISMA.file.update({
      where: { id: fileId },
      data: { path: newPath },
    });
    await this.deleteBlob(containerClient, filePath);
  }

  private async ensurePathsAvailable(newPaths: string[], ignoreIds: string[]) {
    const conflict = await PRISMA.file.findFirst({
      where: {
        path: { in: newPaths },
        NOT: { id: { in: ignoreIds } },
      },
      select: {
        path: true,
      },
    });

    if (conflict) {
      throw new Error(`A file or folder already exists at ${conflict.path}`);
    }
  }

  private async copyBlob(containerClient: ContainerClient, fromPath: string, toPath: string) {
    if (fromPath === toPath) return;
    const source = containerClient.getBlockBlobClient(fromPath);
    const destination = containerClient.getBlockBlobClient(toPath);
    const download = await source.download();
    const buffer = await this.streamToBuffer(download.readableStreamBody ?? null);
    await destination.upload(buffer, buffer.length);
  }

  private async deleteBlob(containerClient: ContainerClient, path: string) {
    await containerClient.getBlockBlobClient(path).deleteIfExists();
  }

  private async streamToBuffer(readableStream: NodeJS.ReadableStream | null): Promise<Buffer> {
    if (!readableStream) return Buffer.alloc(0);
    const chunks: Buffer[] = [];
    for await (const chunk of readableStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
}
