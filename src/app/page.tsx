import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-3xl text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Your resume,{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              perfected by AI
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto">
            AI writes, scores, and tailors your resume to each job description.
            Pass ATS screening. Land more interviews.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
            >
              Build Your Resume — Free
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3 border border-zinc-700 hover:border-zinc-500 rounded-lg font-medium transition-colors"
            >
              See Pricing
            </Link>
          </div>
          <p className="text-sm text-zinc-500">
            4M+ resumes created. No credit card required.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { title: 'AI Scoring', desc: '23 criteria analyzed in real-time. Know exactly where to improve.', icon: '📊' },
            { title: 'Job Tailoring', desc: 'Paste a job description. AI adapts your resume to match.', icon: '🎯' },
            { title: 'ATS-Proof', desc: 'Guaranteed to pass Applicant Tracking Systems. No tables, no images.', icon: '✅' },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="px-6 py-24 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Simple pricing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { plan: 'Free', price: '$0', features: ['1 resume', '3 downloads', 'Basic AI'] },
              { plan: 'Pro', price: '$29/mo', features: ['Unlimited resumes', 'Full AI', 'Priority support'], highlight: true },
              { plan: 'Lifetime', price: '$149', features: ['Everything in Pro', 'Forever', 'Future updates'] },
            ].map((p) => (
              <div
                key={p.plan}
                className={`p-6 rounded-xl border ${
                  p.highlight ? 'border-blue-500 bg-blue-950/20' : 'border-zinc-800 bg-zinc-900/50'
                }`}
              >
                <h3 className="font-semibold mb-1">{p.plan}</h3>
                <div className="text-2xl font-bold mb-4">{p.price}</div>
                <ul className="text-sm text-zinc-400 space-y-2">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-800 text-center text-sm text-zinc-500">
        <p>&copy; {new Date().getFullYear()} ApexResume by QubitumAI. All rights reserved.</p>
      </footer>
    </main>
  );
}
