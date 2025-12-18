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
    <SidebarProvider defaultOpen={defaultOpen}>
      <FilesProvider files={files}>
        <Sidebar email={email} />
        <SidebarInset>
          <Toolbar email={email} name={session?.user?.name} />
          <main className="flex-1 overflow-auto px-4 py-6">{children}</main>
        </SidebarInset>
      </FilesProvider>
    </SidebarProvider>
  );
}
