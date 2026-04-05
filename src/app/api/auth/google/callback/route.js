import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Fetch user info
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // PERSIST TO DATABASE (Supabase) for shared system access
    // We store the tokens as a single JSON object in the 'admin_settings' table
    await supabaseAdmin.from('admin_settings').upsert({
      key: 'google_auth_tokens',
      value: tokens,
      updated_at: new Date().toISOString()
    });

    // Build the redirect response - go back to backendcontrol
    const response = NextResponse.redirect(new URL('/backendcontrol', request.url));

    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    };

    // Keep cookies for the admin UI state
    response.cookies.set('google_auth_tokens', JSON.stringify(tokens), {
      ...cookieOptions,
      httpOnly: true,
    });
    response.cookies.set('google_user', JSON.stringify(userInfo.data), cookieOptions);

    return response;
  } catch (error) {
    console.error('Google Auth Error:', error);
    return NextResponse.redirect(new URL('/backendcontrol?error=auth_failed', request.url));
  }
}
