import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ROUTES } from './routes';

const highlights = [
  {
    title: 'Email magic links',
    description: 'Sign in securely without managing another password.',
  },
  {
    title: 'Structured workspace',
    description: 'Dashboard, file tree, and notes stay in sync across devices.',
  },
  {
    title: 'Shadcn components',
    description: 'Buttons, cards, and theming match the rest of your stack.',
  },
];

export const metadata: Metadata = {
  title: 'Beta | Home',
  description: 'Lightweight landing page with a clear sign-in path.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10 md:py-16">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm">
              B
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Beta</p>
              <p className="text-base font-semibold">A calm home for your notes.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.signIn}>Sign in</Link>
            </Button>
          </div>
        </header>

        <main className="grid gap-12">
          <section className="grid items-start gap-10 md:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
                <Sparkles className="size-3.5" />
                Stay organized, write faster.
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                  Welcome back. Sign in and pick up where you left off.
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  Clean layout, calm colors, and components that match the rest of your dashboard.
                  Sign in to sync your files and keep shipping.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href={ROUTES.signIn} className="inline-flex items-center gap-2">
                    Sign in
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={ROUTES.dashboard.home}>Go to dashboard</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  Passwordless magic links
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="size-4 text-primary" />
                  Jump straight to your files
                </div>
              </div>
            </div>

            <Card className="border-primary/20 bg-card/80 shadow-lg backdrop-blur">
              <CardHeader>
                <CardTitle>Built on your shadcn stack</CardTitle>
                <CardDescription>
                  Buttons, cards, and theming stay consistent with the rest of the app.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/40 px-4 py-3"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                    <div>
                      <p className="font-medium leading-tight">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
