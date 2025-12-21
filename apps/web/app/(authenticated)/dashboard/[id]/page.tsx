import { GetFileFacade } from '@/app/api/files/[id]/get-file.facade';
import { File } from './file';
import { loadFile } from '../../../utils/load-file';

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

  const MOCK_FILE_CONTENT = await loadFile('markdown.md');

  return (
    <div className="w-full p-4">
      <div className="w-full max-w-3xl mx-auto">
        <File id={id} content={MOCK_FILE_CONTENT} />
      </div>
    </div>
  );
}
