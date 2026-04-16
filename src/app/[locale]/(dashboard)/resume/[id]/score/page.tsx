'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface ScoreCriterion {
  name: string;
  score: number;
  feedback: string;
  priority: 'critical' | 'important' | 'minor';
}

export default function ScorePage() {
  const params = useParams();
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [criteria, setCriteria] = useState<ScoreCriterion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch('/api/resume/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeId: params.id }),
        });
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setTotalScore(data.totalScore);
          setCriteria(data.criteria || []);
        } catch {
          setTotalScore(null);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchScore();
  }, [params.id]);

  const priorityColor = (p: string) => {
    if (p === 'critical') return 'text-red-400 bg-red-950/20 border-red-500/30';
    if (p === 'important') return 'text-yellow-400 bg-yellow-950/20 border-yellow-500/30';
    return 'text-zinc-400 bg-zinc-900/50 border-zinc-800';
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-zinc-800 rounded-xl" />
          <div className="h-12 bg-zinc-800 rounded-lg" />
          <div className="h-12 bg-zinc-800 rounded-lg" />
          <div className="h-12 bg-zinc-800 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Score Header */}
      {totalScore !== null && (
        <div className={`p-8 rounded-2xl mb-8 text-center border ${
          totalScore >= 80 ? 'border-green-500/30 bg-green-950/10' :
          totalScore >= 60 ? 'border-yellow-500/30 bg-yellow-950/10' :
          'border-red-500/30 bg-red-950/10'
        }`}>
          <div className="text-6xl font-bold font-mono mb-2">{totalScore}</div>
          <div className="text-zinc-400">/100</div>
          <div className="mt-2 text-sm">
            {totalScore >= 80 ? 'Excellent — ready to send' :
             totalScore >= 60 ? 'Good — a few improvements needed' :
             'Needs work — follow the recommendations below'}
          </div>
        </div>
      )}

      {/* Criteria */}
      <h2 className="text-xl font-bold mb-4">Detailed Scoring</h2>
      <div className="space-y-3">
        {criteria.map((c, i) => (
          <div key={i} className={`p-4 rounded-xl border ${priorityColor(c.priority)}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{c.name}</h3>
              <span className="font-mono font-bold">{c.score}/100</span>
            </div>
            <p className="text-sm opacity-80">{c.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
