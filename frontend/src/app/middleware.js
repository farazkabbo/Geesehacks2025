import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  // Define public routes that don't require authentication
  publicRoutes: [
    '/',                // Landing page
    '/sign-in',         // Sign in page
    '/signup',          // Sign up page
    '/api/trpc/(.*)',   // TRPC routes if you're using them
    '/api/(.*)',        // API routes
    '/about',           // Any other public pages you might have
    '/contact',
    '/privacy-policy',
    '/terms-of-service'
  ],

  // Handle authentication and redirections
  afterAuth(auth, req) {
    // Get the current path from the request URL
    const url = new URL(req.url);
    const path = url.pathname;

    // If user is logged in and trying to access auth pages, redirect to dashboard
    if (auth.userId && (path === '/sign-in' || path === '/signup')) {
      const dashboard = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboard);
    }

    // If user is not logged in and trying to access protected routes
    if (!auth.userId && !auth.isPublicRoute) {
      const signIn = new URL('/sign-in', req.url);
      // Preserve the current URL user was trying to visit
      signIn.searchParams.set('redirect_url', path);
      return NextResponse.redirect(signIn);
    }

    // Allow all other requests to proceed
    return NextResponse.next();
  }
});

// Configure middleware matcher
export const config = {
  matcher: [
    // Match all paths except static files and api
    '/((?!.+\\.[\\w]+$|_next).*)',
    // Match root path
    '/',
    // Match API routes
    '/(api|trpc)(.*)'
  ]
};