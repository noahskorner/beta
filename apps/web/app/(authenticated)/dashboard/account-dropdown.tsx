'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { EllipsisVertical, Laptop, Moon, Sun } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

export function AccountDropdown({
  user,
  variant = 'sidebar',
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  variant?: 'sidebar' | 'toolbar';
}) {
  const { isMobile } = useSidebar();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (!resolvedTheme) return;

    const lightThemeHref =
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs.min.css';
    const darkThemeHref =
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css';

    const linkId = 'hljs-theme';

    let link = document.getElementById(linkId) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    link.href = isDark ? darkThemeHref : lightThemeHref;
  }, [isDark, resolvedTheme]);

  const initials = useMemo(() => {
    const value = user.name || user.email;
    return value
      .split('@')[0]
      .split(/[\s._-]+/)
      .filter(Boolean)
      .map((segment) => segment[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user.email, user.name]);

  const onLogoutClick = () => {
    signOut();
  };

  const trigger =
    variant === 'toolbar' ? (
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-2"
        data-slot="account-dropdown-trigger"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden text-left sm:flex sm:flex-col sm:px-2">
          <span className="text-sm font-medium leading-tight">{user.name || 'Account'}</span>
          <span className="text-xs text-muted-foreground leading-tight">{user.email}</span>
        </div>
      </Button>
    ) : (
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <Avatar className="h-8 w-8 rounded-lg grayscale">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.name}</span>
          <span className="text-muted-foreground truncate text-xs">{user.email}</span>
        </div>
        <EllipsisVertical />
      </SidebarMenuButton>
    );

  const content = (
    <DropdownMenuContent
      className={cn(
        'min-w-56 rounded-lg',
        variant === 'sidebar' && 'w-(--radix-dropdown-menu-trigger-width)'
      )}
      side={isMobile ? 'bottom' : 'right'}
      align="end"
      sideOffset={4}
    >
      <div className="flex items-center gap-3 px-2 py-1.5">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left leading-tight">
          <span className="truncate text-sm font-medium">{user.name || 'Account'}</span>
          <span className="text-muted-foreground truncate text-xs">{user.email}</span>
        </div>
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Theme</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={theme ?? resolvedTheme ?? 'system'}
        onValueChange={(value) => setTheme(value)}
      >
        <DropdownMenuRadioItem value="light" className="flex items-center gap-2">
          <Sun className="size-4 text-muted-foreground" />
          <span>Light</span>
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark" className="flex items-center gap-2">
          <Moon className="size-4 text-muted-foreground" />
          <span>Dark</span>
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="system" className="flex items-center gap-2">
          <Laptop className="size-4 text-muted-foreground" />
          <span>System</span>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onLogoutClick}>Log out</DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (variant === 'toolbar') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        {content}
      </DropdownMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          {content}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
