import { createClient } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

interface AffiliateStats {
  code: string;
  clicks: number;
  conversions: number;
  earnings_cents: number;
  payout_threshold_cents: number;
  created_at: string;
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Get internal user id
  const { data: userRow } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!userRow) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { data: affiliate } = await admin
    .from('affiliates')
    .select('code, clicks, conversions, earnings_cents, payout_threshold_cents, created_at')
    .eq('user_id', userRow.id)
    .single<AffiliateStats>();

  if (!affiliate) {
    // No affiliate record yet — return nulls so the UI can show the "Get link" CTA
    return NextResponse.json({ affiliate: null });
  }

  return NextResponse.json({ affiliate });
}
