'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface ExperienceEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export default function ResumeEditorPage() {
  const params = useParams();
  const resumeId = params.id as string;
  const isNew = resumeId === 'new';

  const [title, setTitle] = useState('Untitled Resume');
  const [summary, setSummary] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([
    { company: '', role: '', startDate: '', endDate: '', bullets: [''] },
  ]);
  const [education, setEducation] = useState<EducationEntry[]>([
    { institution: '', degree: '', field: '', startDate: '', endDate: '' },
  ]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [dbResumeId, setDbResumeId] = useState<string | null>(isNew ? null : resumeId);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load resume from Supabase
  useEffect(() => {
    if (isNew) return;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();
      if (data) {
        setTitle(data.title || 'Untitled Resume');
        setJobDescription(data.target_job_description || '');
        setScore(data.score || null);
        const content = data.content as Record<string, unknown> || {};
        if (content.summary) setSummary(content.summary as string);
        if (content.experiences) setExperiences(content.experiences as ExperienceEntry[]);
        if (content.education) setEducation(content.education as EducationEntry[]);
        if (content.skills) setSkills(content.skills as string[]);
      }
    }
    load();
  }, [resumeId, isNew]);

  // Save to Supabase
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const supabase = createClient();
    const content = { summary, experiences, education, skills };

    if (dbResumeId) {
      await supabase
        .from('resumes')
        .update({
          title,
          content,
          target_job_description: jobDescription || null,
          score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dbResumeId);
    } else {
      // New resume — get user first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsSaving(false); return; }
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();
      if (!userRow) { setIsSaving(false); return; }

      const { data } = await supabase
        .from('resumes')
        .insert({
          user_id: userRow.id,
          title,
          content,
          target_job_description: jobDescription || null,
          score,
        })
        .select('id')
        .single();
      if (data) {
        setDbResumeId(data.id);
        window.history.replaceState(null, '', `/resume/${data.id}`);
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setIsSaving(false);
  }, [title, summary, experiences, education, skills, jobDescription, score, dbResumeId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!dbResumeId) return;
    const interval = setInterval(handleSave, 30000);
    return () => clearInterval(interval);
  }, [dbResumeId, handleSave]);

  const addExperience = useCallback(() => {
    setExperiences(prev => [...prev, { company: '', role: '', startDate: '', endDate: '', bullets: [''] }]);
  }, []);

  const updateExperience = useCallback((index: number, field: keyof ExperienceEntry, value: string) => {
    setExperiences(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const addBullet = useCallback((expIndex: number) => {
    setExperiences(prev => {
      const updated = [...prev];
      updated[expIndex] = { ...updated[expIndex], bullets: [...updated[expIndex].bullets, ''] };
      return updated;
    });
  }, []);

  const updateBullet = useCallback((expIndex: number, bulletIndex: number, value: string) => {
    setExperiences(prev => {
      const updated = [...prev];
      const bullets = [...updated[expIndex].bullets];
      bullets[bulletIndex] = value;
      updated[expIndex] = { ...updated[expIndex], bullets };
      return updated;
    });
  }, []);

  const addEducation = useCallback(() => {
    setEducation(prev => [...prev, { institution: '', degree: '', field: '', startDate: '', endDate: '' }]);
  }, []);

  const updateEducation = useCallback((index: number, field: keyof EducationEntry, value: string) => {
    setEducation(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const addSkill = useCallback(() => {
    if (skillInput.trim()) {
      setSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  }, [skillInput]);

  const removeSkill = useCallback((index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAIGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experience: experiences, education, skills, summary, jobDescription }),
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
  }, [experiences, education, skills, summary, jobDescription]);

  const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/resume/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, summary, experiences, education, skills, template: 'classic-white' }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/pdf')) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-zA-Z0-9-_ ]/g, '') || 'resume'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Fallback: open HTML in new tab for browser print
        const html = await res.text();
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(html);
          win.document.close();
          setTimeout(() => win.print(), 500);
        }
      }
    } finally {
      setIsDownloading(false);
    }
  }, [title, summary, experiences, education, skills]);

  const handleScore = useCallback(async () => {
    const content = JSON.stringify({ summary, experiences, education, skills });
    const res = await fetch('/api/resume/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeContent: content, jobDescription }),
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
  }, [summary, experiences, education, skills, jobDescription]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none outline-none"
          placeholder="Resume title"
        />
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 border border-zinc-700 rounded-lg text-sm hover:border-zinc-500 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
          <button
            onClick={handleScore}
            className="px-4 py-2 border border-zinc-700 rounded-lg text-sm hover:border-zinc-500 transition-colors"
          >
            Score Resume
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isDownloading ? 'Exporting...' : 'Download PDF'}
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

      {/* Job Description (optional) */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Target Job Description <span className="text-sm text-zinc-500 font-normal">(optional — AI will tailor your resume)</span></h2>
        <textarea
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          rows={3}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm resize-none focus:border-blue-500 outline-none"
          placeholder="Paste the job description here and AI will tailor your resume to match..."
        />
      </section>

      {/* Summary */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Professional Summary</h2>
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={4}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm resize-none focus:border-blue-500 outline-none"
          placeholder="Write a 2-3 sentence professional summary..."
        />
      </section>

      {/* Experience */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Experience</h2>
          <button onClick={addExperience} className="text-sm text-blue-400 hover:text-blue-300">+ Add Position</button>
        </div>
        {experiences.map((exp, i) => (
          <div key={i} className="mb-6 p-4 border border-zinc-800 rounded-lg">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="text" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} placeholder="Company" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              <input type="text" value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} placeholder="Role" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              <input type="text" value={exp.startDate} onChange={e => updateExperience(i, 'startDate', e.target.value)} placeholder="Start date" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              <input type="text" value={exp.endDate} onChange={e => updateExperience(i, 'endDate', e.target.value)} placeholder="End date (or Present)" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-2">
              {exp.bullets.map((bullet, j) => (
                <input key={j} type="text" value={bullet} onChange={e => updateBullet(i, j, e.target.value)} placeholder="Achievement or responsibility..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              ))}
              <button onClick={() => addBullet(i)} className="text-xs text-zinc-500 hover:text-zinc-300">+ Add bullet point</button>
            </div>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Education</h2>
          <button onClick={addEducation} className="text-sm text-blue-400 hover:text-blue-300">+ Add Education</button>
        </div>
        {education.map((edu, i) => (
          <div key={i} className="mb-4 p-4 border border-zinc-800 rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} placeholder="Institution" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              <input type="text" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} placeholder="Degree (e.g., B.S., M.A.)" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              <input type="text" value={edu.field} onChange={e => updateEducation(i, 'field', e.target.value)} placeholder="Field of study" className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              <div className="flex gap-2">
                <input type="text" value={edu.startDate} onChange={e => updateEducation(i, 'startDate', e.target.value)} placeholder="Start" className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                <input type="text" value={edu.endDate} onChange={e => updateEducation(i, 'endDate', e.target.value)} placeholder="End" className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Skills</h2>
        <div className="flex gap-2 mb-3">
          <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Add a skill..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
          <button onClick={addSkill} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="px-3 py-1 bg-zinc-800 rounded-full text-sm flex items-center gap-2">
              {skill}
              <button onClick={() => removeSkill(i)} className="text-zinc-500 hover:text-red-400">x</button>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
