import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const AFFILIATE_COMMISSION_PRO_CENTS = 3000;   // $30
const AFFILIATE_COMMISSION_LIFETIME_CENTS = 5000; // $50

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );
}

async function creditAffiliate(
  refCode: string,
  userId: string,
  plan: string,
): Promise<void> {
  const supabase = getSupabase();
  const commissionCents = plan === 'lifetime'
    ? AFFILIATE_COMMISSION_LIFETIME_CENTS
    : AFFILIATE_COMMISSION_PRO_CENTS;

  // Get current affiliate stats
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, conversions, earnings_cents')
    .eq('code', refCode)
    .single();

  if (!affiliate) return;

  // Get the internal user id from auth user id
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', userId)
    .single();

  // Update affiliate stats
  await supabase
    .from('affiliates')
    .update({
      conversions: affiliate.conversions + 1,
      earnings_cents: affiliate.earnings_cents + commissionCents,
    })
    .eq('id', affiliate.id);

  // Mark the click as converted if we have the user
  if (userRow) {
    await supabase
      .from('affiliate_clicks')
      .update({ converted_user_id: userRow.id })
      .eq('affiliate_code', refCode)
      .is('converted_user_id', null)
      .order('created_at', { ascending: false })
      .limit(1);

    // Record who referred this user
    await supabase
      .from('users')
      .update({ referred_by: refCode })
      .eq('id', userRow.id)
      .is('referred_by', null); // only set once
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      const refCode = session.metadata?.ref_code;

      if (userId && plan) {
        await getSupabase().from('users').update({
          plan: plan === 'lifetime' ? 'lifetime' : 'pro',
          stripe_customer_id: session.customer as string,
        }).eq('auth_id', userId);

        // Credit the affiliate who referred this user
        if (refCode) {
          await creditAffiliate(refCode, userId, plan);
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await getSupabase().from('users').update({
        plan: 'free',
      }).eq('stripe_customer_id', customerId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      // Could send email notification here via Resend
      console.warn(`Payment failed for customer ${customerId}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
