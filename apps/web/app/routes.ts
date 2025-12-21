export const ROUTES = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  auth: {
    callback: '/auth/callback',
  },
  dashboard: {
    home: '/dashboard',
    canvas: '/dashboard/canvas',
    detail: (fileId: string) => `/dashboard/${fileId}`,
  },
  external: {
    email: 'http://localhost:8025',
  },
} as const;
