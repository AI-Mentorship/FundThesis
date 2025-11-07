# Supabase Authentication Setup

This project uses Supabase for authentication. The following routes are protected and require authentication:

## Protected Routes
- `/dashboard`
- `/discover`
- `/insights`
- `/portfolio`
- `/learn`
- `/enviro`
- `/profile`

## Public Routes
- `/` (home page)
- `/login`
- `/signup`

## Environment Variables

Create a `.env.local` file in the `Frontend` directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

## Installation

Make sure to install the Supabase dependencies:

```bash
cd Frontend
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Supabase Server-Side Rendering utilities for Next.js

## How It Works

1. **Middleware Protection**: The `middleware.ts` file checks for a valid Supabase session on protected routes. If no session exists, users are redirected to `/login`.

2. **Client-Side Auth**: The `auth-client.ts` file provides React hooks and functions for authentication:
   - `useSession()` - React hook to get the current session
   - `authClient.signIn.email()` - Sign in with email/password
   - `authClient.signUp.email()` - Sign up with email/password
   - `authClient.signOut()` - Sign out

3. **Server-Side Auth**: The `supabase-server.ts` file provides server-side Supabase client for Server Components and API routes.

4. **Navigation**: The Navbar component automatically shows/hides navigation items and auth buttons based on authentication state.

## Testing

1. Start the development server: `npm run dev`
2. Navigate to a protected route (e.g., `/dashboard`) - you should be redirected to `/login`
3. Sign up or log in to access protected routes
4. The navbar will update to show your profile and sign out button when authenticated




