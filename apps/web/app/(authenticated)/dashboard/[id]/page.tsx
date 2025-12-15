import { GetFileFacade } from '@/app/api/files/[id]/get-file.facade';
import { File } from './file';

export interface FilePageProps {
  params: Promise<{ id: string }>;
}

export default async function FilePage({ params }: FilePageProps) {
  const { id } = await params;
  const facade = new GetFileFacade();
  const file = await facade.get({ id });

  if (file == null) {
    return <>Not found.</>;
  }

  return (
    <div className="w-full h-full flex items-stretch justify-center">
      <div className="w-full h-full flex p-8 pt-12 justify-center">
        <div className="w-full max-w-3xl">
          <File id={id} content={file.content ?? ''} />
        </div>
      </div>
    </div>
  );
}
