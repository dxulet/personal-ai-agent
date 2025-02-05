import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl, getTokens } from '../../../lib/services/google-calendar'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      // If no code, redirect to Google OAuth
      const authUrl = await getAuthUrl();
      return NextResponse.redirect(authUrl);
    }

    // Exchange code for tokens
    const tokens = await getTokens(code);
    
    // Create a redirect URL with tokens as hash parameters
    const redirectUrl = new URL('/', request.url);
    redirectUrl.hash = `access_token=${tokens.access_token}&expiry_date=${tokens.expiry_date}`;
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in auth:', error);
    const errorUrl = new URL('/', request.url);
    errorUrl.searchParams.set('error', 'Failed to authenticate with Google');
    return NextResponse.redirect(errorUrl);
  }
}