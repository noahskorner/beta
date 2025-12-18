import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { FileExplorer } from './file-explorer';
import { cn } from '../../../lib/utils';

export interface SidebarProps {
  email: string;
  className?: string;
}

export async function Sidebar({ email: _email, className }: SidebarProps) {
  return (
    <SidebarComponent className={cn('border-r-none', className)}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <FileExplorer />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
}
