import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Get started with basic resume building.',
    features: [
      '1 resume',
      '3 PDF downloads',
      'Basic AI suggestions',
      'ATS compatibility check',
    ],
    cta: 'Start Free',
    href: '/login',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Everything you need to land your dream job.',
    features: [
      'Unlimited resumes',
      'Unlimited downloads',
      'Full AI generation & scoring',
      'Job-specific tailoring',
      'Cover letter generation',
      'Monthly expert review',
      'Priority support',
    ],
    cta: 'Start 7-day free trial',
    href: '/login?plan=pro',
    highlight: true,
  },
  {
    name: 'Lifetime',
    price: '$149',
    period: 'one-time',
    description: 'Pay once, use forever. Best value.',
    features: [
      'Everything in Pro',
      'Lifetime access',
      'All future updates',
      'No recurring charges',
    ],
    cta: 'Get Lifetime Access',
    href: '/login?plan=lifetime',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-zinc-400 text-lg">
            No hidden fees. Cancel anytime. 30-day money-back guarantee.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlight
                  ? 'border-2 border-blue-500 bg-blue-950/10'
                  : 'border border-zinc-800 bg-zinc-900/50'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 rounded-full text-xs font-medium">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-zinc-500 text-sm">{plan.period}</span>
                )}
              </div>
              <p className="text-sm text-zinc-400 mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <span className="text-green-400 mt-0.5">&#10003;</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-lg font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-zinc-500">
          <p>Questions? Email support@apexresume.ai</p>
          <p className="mt-2">Powered by QubitumAI</p>
        </div>
      </div>
    </main>
  );
}
