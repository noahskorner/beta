import { cookies } from 'next/headers';
import { Sidebar } from './sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
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
    <SidebarProvider defaultOpen={defaultOpen} className="flex-col">
      <FilesProvider files={files}>
        <Toolbar email={email} name={session?.user?.name} />
        <div className="flex flex-1 min-h-0 w-full">
          <Sidebar email={email} className="md:top-11 md:h-[calc(100svh-3.5rem)]" />
          <SidebarInset className="flex-1 min-h-0">
            <main className="flex-1 overflow-auto">{children}</main>
          </SidebarInset>
        </div>
      </FilesProvider>
    </SidebarProvider>
  );
}
