'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface Resume {
  id: string;
  title: string;
  score: number | null;
  updated_at: string;
  template_id: string;
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadResumes() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get or create user row
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userRow) {
        const { data: newUser } = await supabase
          .from('users')
          .insert({ auth_id: user.id, email: user.email ?? '' })
          .select('id')
          .single();
        if (newUser) setUserId(newUser.id);
      } else {
        setUserId(userRow.id);
      }

      const uid = userRow?.id;
      if (!uid) { setLoading(false); return; }

      const { data } = await supabase
        .from('resumes')
        .select('id, title, score, updated_at, template_id')
        .eq('user_id', uid)
        .order('updated_at', { ascending: false });

      if (data) setResumes(data);
      setLoading(false);
    }
    loadResumes();
  }, []);

  const handleCreateResume = async () => {
    if (!userId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('resumes')
      .insert({ user_id: userId, title: 'Untitled Resume', content: {} })
      .select('id')
      .single();
    if (data) {
      window.location.href = `/resume/${data.id}`;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Resumes</h1>
        <button
          onClick={handleCreateResume}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
        >
          + New Resume
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 border border-zinc-800 rounded-xl bg-zinc-900/50 animate-pulse" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-700 rounded-xl">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-lg font-semibold mb-2">No resumes yet</h2>
          <p className="text-zinc-400 mb-6">Create your first AI-powered resume in minutes.</p>
          <button
            onClick={handleCreateResume}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          >
            Create Resume
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <Link
              key={resume.id}
              href={`/resume/${resume.id}`}
              className="p-5 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors bg-zinc-900/50"
            >
              <h3 className="font-semibold mb-1 truncate">{resume.title}</h3>
              <p className="text-xs text-zinc-500 mb-3">
                Updated {new Date(resume.updated_at).toLocaleDateString()}
              </p>
              {resume.score !== null && (
                <div className="flex items-center gap-2">
                  <div
                    className={`text-sm font-mono font-bold ${
                      resume.score >= 80 ? 'text-green-400' :
                      resume.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}
                  >
                    {resume.score}/100
                  </div>
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        resume.score >= 80 ? 'bg-green-400' :
                        resume.score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${resume.score}%` }}
                    />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
