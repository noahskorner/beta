import { cookies } from 'next/headers';
import { Sidebar } from './sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FilesProvider } from './file-context';
import { FindFilesFacade } from '../../api/files/find-files.facade';
import { FindFileResponse } from '../../api/files/find-files.response';
import { getServerSession } from 'next-auth';
import { AUTH } from '@/app/auth';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/app/routes';
import { Toolbar } from './toolbar';

const loadFiles = async (): Promise<FindFileResponse[]> => {
  try {
    const facade = new FindFilesFacade();
    const response = await facade.find();
    return response.files;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(AUTH);
  const email = session?.user?.email;
  if (email == null) {
    return redirect(ROUTES.signIn);
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  const files = await loadFiles();

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <FilesProvider files={files}>
        <div className="w-screen h-screen overflow-hidden relative">
          <Toolbar email={email} name={session?.user?.name} />
          <div className="flex flex-1 w-full pt-11">
            <Sidebar className="md:top-11 md:h-[calc(100svh-2.5rem)]" />
            <main className="w-full h-[calc(100svh-2.5rem)] overflow-auto">{children}</main>
          </div>
        </div>
      </FilesProvider>
    </SidebarProvider>
  );
}
