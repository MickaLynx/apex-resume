'use client';

import { useState, useCallback } from 'react';

interface ResumeSection {
  id: string;
  type: 'summary' | 'experience' | 'education' | 'skills' | 'certifications';
  content: Record<string, unknown>;
}

interface ExperienceEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export default function ResumeEditorPage() {
  const [title, setTitle] = useState('Untitled Resume');
  const [summary, setSummary] = useState('');
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([
    { company: '', role: '', startDate: '', endDate: '', bullets: [''] },
  ]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const addExperience = useCallback(() => {
    setExperiences((prev) => [
      ...prev,
      { company: '', role: '', startDate: '', endDate: '', bullets: [''] },
    ]);
  }, []);

  const updateExperience = useCallback(
    (index: number, field: keyof ExperienceEntry, value: string) => {
      setExperiences((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    [],
  );

  const addBullet = useCallback((expIndex: number) => {
    setExperiences((prev) => {
      const updated = [...prev];
      updated[expIndex] = {
        ...updated[expIndex],
        bullets: [...updated[expIndex].bullets, ''],
      };
      return updated;
    });
  }, []);

  const updateBullet = useCallback(
    (expIndex: number, bulletIndex: number, value: string) => {
      setExperiences((prev) => {
        const updated = [...prev];
        const bullets = [...updated[expIndex].bullets];
        bullets[bulletIndex] = value;
        updated[expIndex] = { ...updated[expIndex], bullets };
        return updated;
      });
    },
    [],
  );

  const addSkill = useCallback(() => {
    if (skillInput.trim()) {
      setSkills((prev) => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  }, [skillInput]);

  const removeSkill = useCallback((index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAIGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experience: experiences, skills, summary }),
      });
      if (res.ok) {
        const reader = res.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          let result = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += decoder.decode(value);
          }
          setSummary(result);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  }, [experiences, skills, summary]);

  const handleScore = useCallback(async () => {
    const content = JSON.stringify({ summary, experiences, skills });
    const res = await fetch('/api/resume/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeContent: content }),
    });
    if (res.ok) {
      const data = await res.text();
      try {
        const parsed = JSON.parse(data);
        setScore(parsed.totalScore);
      } catch {
        setScore(null);
      }
    }
  }, [summary, experiences, skills]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none outline-none"
          placeholder="Resume title"
        />
        <div className="flex gap-3">
          <button
            onClick={handleScore}
            className="px-4 py-2 border border-zinc-700 rounded-lg text-sm hover:border-zinc-500 transition-colors"
          >
            Score Resume
          </button>
          <button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'AI Enhance'}
          </button>
        </div>
      </div>

      {/* Score badge */}
      {score !== null && (
        <div className={`mb-6 p-4 rounded-xl border ${
          score >= 80 ? 'border-green-500/30 bg-green-950/20' :
          score >= 60 ? 'border-yellow-500/30 bg-yellow-950/20' :
          'border-red-500/30 bg-red-950/20'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold font-mono">{score}</span>
            <span className="text-zinc-400">/100</span>
            <span className="text-sm text-zinc-500 ml-auto">
              {score >= 80 ? 'Excellent' : score >= 60 ? 'Good — needs improvements' : 'Needs work'}
            </span>
          </div>
        </div>
      )}

      {/* Summary */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Professional Summary</h2>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm resize-none focus:border-blue-500 outline-none"
          placeholder="Write a 2-3 sentence professional summary..."
        />
      </section>

      {/* Experience */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Experience</h2>
          <button
            onClick={addExperience}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            + Add Position
          </button>
        </div>
        {experiences.map((exp, i) => (
          <div key={i} className="mb-6 p-4 border border-zinc-800 rounded-lg">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={exp.company}
                onChange={(e) => updateExperience(i, 'company', e.target.value)}
                placeholder="Company"
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={exp.role}
                onChange={(e) => updateExperience(i, 'role', e.target.value)}
                placeholder="Role"
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={exp.startDate}
                onChange={(e) => updateExperience(i, 'startDate', e.target.value)}
                placeholder="Start date"
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={exp.endDate}
                onChange={(e) => updateExperience(i, 'endDate', e.target.value)}
                placeholder="End date (or Present)"
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              {exp.bullets.map((bullet, j) => (
                <input
                  key={j}
                  type="text"
                  value={bullet}
                  onChange={(e) => updateBullet(i, j, e.target.value)}
                  placeholder="Achievement or responsibility..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              ))}
              <button
                onClick={() => addBullet(i)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                + Add bullet point
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Skills</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            placeholder="Add a skill..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={addSkill}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-zinc-800 rounded-full text-sm flex items-center gap-2"
            >
              {skill}
              <button
                onClick={() => removeSkill(i)}
                className="text-zinc-500 hover:text-red-400"
              >
                x
              </button>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
