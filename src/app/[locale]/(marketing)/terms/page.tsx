export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-zinc-400 text-sm mb-8">Last updated: April 2026</p>

      <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-3">1. Service Description</h2>
          <p className="text-zinc-300">
            We provide an AI-powered resume building platform. Our service includes resume editing,
            AI-enhanced content generation, cover letter creation, and PDF export.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">2. Account & Eligibility</h2>
          <ul className="list-disc ml-5 space-y-1 text-zinc-300">
            <li>You must be at least 16 years old to use this service.</li>
            <li>You are responsible for maintaining the security of your account.</li>
            <li>One account per person. Sharing accounts is not permitted.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">3. Content Ownership</h2>
          <p className="text-zinc-300">
            You retain full ownership of all content you create using our service.
            AI-generated suggestions become yours once accepted. We do not claim any rights
            over your resumes, cover letters, or any other content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. Pricing & Payments</h2>
          <ul className="list-disc ml-5 space-y-1 text-zinc-300">
            <li><strong>Free Plan:</strong> 1 resume, limited AI generations.</li>
            <li><strong>Pro Plan:</strong> $29/month, unlimited resumes, unlimited AI, priority support.</li>
            <li><strong>Lifetime Plan:</strong> $149 one-time, all Pro features forever.</li>
            <li>Payments are processed securely via Stripe.</li>
            <li>Pro subscriptions can be cancelled anytime. Access continues until the end of the billing period.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. Refund Policy</h2>
          <p className="text-zinc-300">
            Monthly subscriptions: No refunds for partial months. You can cancel anytime.
            Lifetime purchases: 14-day refund guarantee, no questions asked.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. Prohibited Use</h2>
          <ul className="list-disc ml-5 space-y-1 text-zinc-300">
            <li>Creating fraudulent or misleading resumes.</li>
            <li>Attempting to reverse-engineer or scrape our AI systems.</li>
            <li>Using automated tools to access the service beyond normal usage.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">7. Limitation of Liability</h2>
          <p className="text-zinc-300">
            Our service is provided &quot;as is.&quot; We do not guarantee that AI-generated content will result
            in job interviews or offers. We are not liable for hiring outcomes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">8. Contact</h2>
          <p className="text-zinc-300">
            For questions about these terms, contact us at legal@qubitum.ai.
          </p>
        </section>
      </div>
    </div>
  );
}
