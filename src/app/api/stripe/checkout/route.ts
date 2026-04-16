import Stripe from 'stripe';
import { NextResponse } from 'next/server';

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY || ""); }

const PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  lifetime: process.env.STRIPE_PRICE_LIFETIME!,
} as const;

export async function POST(req: Request) {
  try {
    const { plan, userId, email } = await req.json();

    if (!plan || !PRICES[plan as keyof typeof PRICES]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const priceId = PRICES[plan as keyof typeof PRICES];
    const isSubscription = plan === 'pro_monthly';

    const session = await getStripe().checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
      customer_email: email,
      metadata: { userId, plan },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
