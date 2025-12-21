import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { FileExplorer } from './file-explorer';
import { cn } from '../../../lib/utils';
import Link from 'next/link';
import { ROUTES } from '@/app/routes';
import { ExternalLink } from 'lucide-react';

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
        <SidebarGroup>
          <SidebarGroupLabel>Canvas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={ROUTES.dashboard.canvas}>
                    Canvas <ExternalLink />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
}
