'use client';

import { useMemo } from 'react';
import { Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signIn } from 'next-auth/react';
import { ROUTES } from '../routes';

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});
type LoginFormSchema = z.infer<typeof schema>;

export default function Login() {
  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const formDescription = useMemo(
    () =>
      'We use passwordless magic links to keep your workspace secure. Enter your email and we will send you a one-time sign-in link.',
    [],
  );

  const onSubmit = async ({ email }: LoginFormSchema) => {
    await signIn('email', { email, callbackUrl: ROUTES.dashboard.home });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_30%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.08),transparent,rgba(15,23,42,0.08))]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-6 py-12 lg:flex-row lg:items-center lg:py-20">
        <div className="flex max-w-xl flex-col gap-4 text-center lg:text-left">
          <div className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary lg:self-start">
            <Sparkles className="h-4 w-4" aria-hidden />
            Welcome back
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Sign in to keep building momentum.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Access your projects, stay in sync with your team, and pick up right where you left
            off. We keep your account secure with passwordless authentication.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border bg-background/80 p-4 shadow-sm backdrop-blur">
              <ShieldCheck className="mt-1 h-4 w-4 text-emerald-500" aria-hidden />
              <div>
                <p className="text-sm font-medium text-foreground">Secure by default</p>
                <p className="text-muted-foreground text-sm">
                  Magic links mean no passwords to leak or forget.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border bg-background/80 p-4 shadow-sm backdrop-blur">
              <Mail className="mt-1 h-4 w-4 text-sky-500" aria-hidden />
              <div>
                <p className="text-sm font-medium text-foreground">Fast access</p>
                <p className="text-muted-foreground text-sm">
                  Check your inbox and you are back to shipping.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md border border-border/60 bg-background/95 backdrop-blur">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" aria-hidden />
              <span>Magic link sign-in</span>
            </div>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription className="leading-relaxed">{formDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Sending magic link...' : 'Email me a magic link'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
