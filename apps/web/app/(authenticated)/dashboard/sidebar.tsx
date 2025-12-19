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
  className?: string;
}

export async function Sidebar({ className }: SidebarProps) {
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
