export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-zinc-400 text-sm mb-8">Last updated: April 2026</p>

      <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-3">1. Information We Collect</h2>
          <p>We collect the minimum data required to provide our service:</p>
          <ul className="list-disc ml-5 space-y-1 text-zinc-300">
            <li><strong>Account Information:</strong> Name and email address.</li>
            <li><strong>Resume Content:</strong> Text and data you input into your resume.</li>
            <li><strong>Payment Information:</strong> Billing details processed directly by Stripe (see Section 3).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">2. How We Use Your Data</h2>
          <ul className="list-disc ml-5 space-y-1 text-zinc-300">
            <li><strong>AI Enhancement:</strong> Resume content is sent to a third-party AI API for optimization. The AI provider does not store this content.</li>
            <li><strong>Service Delivery:</strong> Data is stored using Supabase, which is committed to EU data compliance standards.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">3. Payment Processing</h2>
          <p className="text-zinc-300">
            We use Stripe for all payment transactions. We do not store credit card numbers.
            Stripe is a PCI-compliant provider ensuring your financial information is handled securely.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. Your Rights</h2>
          <ul className="list-disc ml-5 space-y-1 text-zinc-300">
            <li><strong>Deletion:</strong> You can delete your account and all data at any time from your dashboard.</li>
            <li><strong>No Data Sales:</strong> We never sell your personal data or resume content to third parties.</li>
            <li><strong>Cookies:</strong> We use cookies only for authentication and session management.</li>
            <li><strong>Data Export:</strong> You can export all your data in standard formats.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. Data Security</h2>
          <p className="text-zinc-300">
            All data is encrypted in transit (TLS 1.3) and at rest. We use Supabase&apos;s
            row-level security policies to ensure users can only access their own data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. Contact</h2>
          <p className="text-zinc-300">
            For privacy inquiries, contact us at privacy@qubitum.ai.
          </p>
        </section>
      </div>
    </div>
  );
}
