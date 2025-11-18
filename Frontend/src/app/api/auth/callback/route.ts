import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

type AuthCallbackPayload = {
  event: AuthChangeEvent;
  session: Session | null;
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore as unknown as ReturnType<typeof cookies>,
    });
    const { event, session } = (await request.json()) as AuthCallbackPayload;

    if (event === 'SIGNED_OUT') {
      await supabase.auth.signOut();
      return NextResponse.json({ success: true });
    }

    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
      const { error } = await supabase.auth.setSession(session);

      if (error) {
        console.error('Error setting Supabase session:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Supabase auth callback error:', error);
    return NextResponse.json({ error: 'Failed to process auth callback' }, { status: 400 });
  }
}

