import Stripe from 'stripe';
import { NextResponse, type NextRequest } from 'next/server';

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY ?? ''); }

const PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  lifetime: process.env.STRIPE_PRICE_LIFETIME!,
} as const;

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = await req.json() as {
      plan: string;
      userId: string;
      email: string;
    };

    if (!plan || !PRICES[plan as keyof typeof PRICES]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Pass affiliate ref_code through to webhook via metadata
    const refCode = req.cookies.get('ref_code')?.value ?? null;

    const priceId = PRICES[plan as keyof typeof PRICES];
    const isSubscription = plan === 'pro_monthly';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: isSubscription ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
      customer_email: email,
      metadata: {
        userId,
        plan,
        ...(refCode ? { ref_code: refCode } : {}),
      },
      allow_promotion_codes: true,
    };

    const session = await getStripe().checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
