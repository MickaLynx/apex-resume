import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'crypto';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + '_affiliate_salt').digest('hex').slice(0, 16);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get('ref');

  if (!ref) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const admin = getSupabaseAdmin();

  // Verify the code exists and get current clicks
  const { data: affiliate } = await admin
    .from('affiliates')
    .select('code, clicks')
    .eq('code', ref)
    .single();

  if (!affiliate) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Record click and increment counter (best-effort)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';

  const ipHash = hashIp(ip);
  const referrer = request.headers.get('referer') ?? null;
  const userAgent = request.headers.get('user-agent') ?? null;

  // Insert click record (fire-and-forget — don't block redirect)
  void admin.from('affiliate_clicks').insert({
    affiliate_code: ref,
    referrer,
    user_agent: userAgent,
    ip_hash: ipHash,
  }).then(() => {/* recorded */}, () => {/* ignore errors */});

  // Increment clicks counter (fire-and-forget)
  void admin.from('affiliates')
    .update({ clicks: affiliate.clicks + 1 })
    .eq('code', ref)
    .then(() => {/* updated */}, () => {/* ignore errors */});

  // Set ref_code cookie (30 days) and redirect to homepage
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const response = NextResponse.redirect(new URL('/', appUrl));

  response.cookies.set('ref_code', ref, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return response;
}
