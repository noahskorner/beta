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
import { Laptop, Moon, Sun } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

export function AccountDropdown({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
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

  const content = (
    <DropdownMenuContent className={cn('min-w-56 rounded-lg')} side="bottom" sideOffset={4}>
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 w-11 rounded-full"
          data-slot="account-dropdown-trigger"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {content}
    </DropdownMenu>
  );
}
