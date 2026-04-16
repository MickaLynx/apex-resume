'use client';

import { useState, useEffect, useCallback } from 'react';

interface AffiliateStats {
  code: string;
  clicks: number;
  conversions: number;
  earnings_cents: number;
  payout_threshold_cents: number;
  created_at: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rezi-clone.vercel.app';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AffiliatePage() {
  const [affiliate, setAffiliate] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/affiliate/stats');
      if (!res.ok) throw new Error('Failed to load stats');
      const json = await res.json() as { affiliate: AffiliateStats | null };
      setAffiliate(json.affiliate);
    } catch {
      setError('Failed to load affiliate data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRegister = async () => {
    setRegistering(true);
    setError(null);
    try {
      const res = await fetch('/api/affiliate/register', { method: 'POST' });
      if (!res.ok) throw new Error('Registration failed');
      await fetchStats();
    } catch {
      setError('Failed to create affiliate link. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const affiliateLink = affiliate ? `${APP_URL}?ref=${affiliate.code}` : '';

  const handleCopy = async () => {
    if (!affiliateLink) return;
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea');
      el.value = affiliateLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Affiliate Program</h1>
        <p className="text-zinc-400">
          Earn commissions by referring new users to TalentInk.
        </p>
      </div>

      {/* Commission info */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="text-2xl font-bold text-green-400 mb-1">$30</div>
          <div className="text-sm text-zinc-400">per Pro Monthly conversion</div>
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="text-2xl font-bold text-blue-400 mb-1">$50</div>
          <div className="text-sm text-zinc-400">per Lifetime plan conversion</div>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm">
          {error}
        </div>
      )}

      {!affiliate ? (
        /* No affiliate code yet */
        <div className="p-8 rounded-xl border border-dashed border-zinc-700 text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-lg font-semibold mb-2">Get your affiliate link</h2>
          <p className="text-zinc-400 mb-6 text-sm">
            Generate a unique link and start earning commissions immediately.
            Minimum payout: $30.
          </p>
          <button
            onClick={handleRegister}
            disabled={registering}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-lg font-medium transition-colors"
          >
            {registering ? 'Creating link...' : 'Get your affiliate link'}
          </button>
        </div>
      ) : (
        <>
          {/* Affiliate link */}
          <div className="mb-6 p-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="text-sm text-zinc-400 mb-2 font-medium">Your affiliate link</div>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-sm bg-zinc-800 rounded-lg px-3 py-2 text-zinc-200 truncate font-mono">
                {affiliateLink}
              </code>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Your code: <span className="font-mono text-zinc-300">{affiliate.code}</span>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-center">
              <div className="text-3xl font-bold mb-1">{affiliate.clicks}</div>
              <div className="text-xs text-zinc-400">Total Clicks</div>
            </div>
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-center">
              <div className="text-3xl font-bold mb-1">{affiliate.conversions}</div>
              <div className="text-xs text-zinc-400">Conversions</div>
            </div>
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {formatCents(affiliate.earnings_cents)}
              </div>
              <div className="text-xs text-zinc-400">Earnings</div>
            </div>
          </div>

          {/* Payout progress */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Payout progress</span>
              <span className="font-medium">
                {formatCents(affiliate.earnings_cents)} / {formatCents(affiliate.payout_threshold_cents)}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (affiliate.earnings_cents / affiliate.payout_threshold_cents) * 100)}%`,
                }}
              />
            </div>
            {affiliate.earnings_cents >= affiliate.payout_threshold_cents ? (
              <p className="text-xs text-green-400 mt-2">
                You have reached the payout threshold! Contact us to request your payment.
              </p>
            ) : (
              <p className="text-xs text-zinc-500 mt-2">
                Reach {formatCents(affiliate.payout_threshold_cents)} to request a payout.
              </p>
            )}
          </div>

          {/* Tips */}
          <div className="mt-6 p-5 rounded-xl border border-zinc-700 bg-zinc-900/30">
            <h3 className="text-sm font-semibold mb-3">Tips to maximize earnings</h3>
            <ul className="space-y-1.5 text-sm text-zinc-400">
              <li>• Share your link in LinkedIn posts, resume tips threads, or career communities</li>
              <li>• Mention TalentInk when helping friends with their resume</li>
              <li>• Create a YouTube or blog review — long-form content converts well</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
