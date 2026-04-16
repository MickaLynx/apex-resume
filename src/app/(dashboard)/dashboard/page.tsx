'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Resume {
  id: string;
  title: string;
  score: number | null;
  updatedAt: string;
  template: string;
}

export default function DashboardPage() {
  const [resumes] = useState<Resume[]>([]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Resumes</h1>
        <Link
          href="/resume/new"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
        >
          + New Resume
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-700 rounded-xl">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-lg font-semibold mb-2">No resumes yet</h2>
          <p className="text-zinc-400 mb-6">
            Create your first AI-powered resume in minutes.
          </p>
          <Link
            href="/resume/new"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          >
            Create Resume
          </Link>
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
                Updated {new Date(resume.updatedAt).toLocaleDateString()}
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
