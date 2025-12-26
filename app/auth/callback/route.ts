/**
 * OAuth Callback Route - Security Boundary
 *
 * This route is the critical security checkpoint in the OAuth flow:
 *
 * Flow: Google → Supabase → This Route → Home
 *
 * 1. User clicks "Sign in with Google" on /login
 * 2. Supabase redirects to Google for authentication
 * 3. Google authenticates and redirects back to Supabase
 * 4. Supabase redirects here with an ephemeral `code` parameter
 * 5. This route exchanges the code for a session via `exchangeCodeForSession()`
 * 6. Session is stored in HTTP-only cookies (invisible to JavaScript = XSS-safe)
 * 7. User is redirected to home
 *
 * Why this route is necessary:
 * - Without it, tokens would be stored in localStorage (vulnerable to XSS attacks)
 * - HTTP-only cookies can only be set server-side
 * - The middleware can then read these cookies to authenticate SSR requests
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
