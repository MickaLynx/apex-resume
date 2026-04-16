import { createClient } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function generateCode(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST() {
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

  // Check if already has an affiliate code
  const { data: existing } = await admin
    .from('affiliates')
    .select('code')
    .eq('user_id', userRow.id)
    .single();

  if (existing) {
    return NextResponse.json({ code: existing.code });
  }

  // Generate a unique code
  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data: conflict } = await admin
      .from('affiliates')
      .select('code')
      .eq('code', code)
      .single();

    if (!conflict) break;
    code = generateCode();
    attempts++;
  }

  const { data: affiliate, error } = await admin
    .from('affiliates')
    .insert({ user_id: userRow.id, code })
    .select('code')
    .single();

  if (error || !affiliate) {
    console.error('Affiliate register error:', error);
    return NextResponse.json({ error: 'Failed to create affiliate' }, { status: 500 });
  }

  return NextResponse.json({ code: affiliate.code });
}
