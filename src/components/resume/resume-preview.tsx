'use client';

interface ResumePreviewProps {
  content: {
    summary?: string;
    experiences?: Array<{
      company: string;
      role: string;
      startDate: string;
      endDate: string;
      bullets: string[];
    }>;
    skills?: string[];
    education?: Array<{
      school: string;
      degree: string;
      year: string;
    }>;
  };
  template?: 'modern-dark' | 'classic-white' | 'minimal-blue';
}

export function ResumePreview({ content, template = 'modern-dark' }: ResumePreviewProps) {
  const themes = {
    'modern-dark': { bg: 'bg-zinc-900', text: 'text-zinc-100', accent: 'text-blue-400', border: 'border-zinc-700' },
    'classic-white': { bg: 'bg-white', text: 'text-zinc-900', accent: 'text-blue-600', border: 'border-zinc-300' },
    'minimal-blue': { bg: 'bg-slate-50', text: 'text-slate-900', accent: 'text-indigo-600', border: 'border-indigo-200' },
  };

  const t = themes[template];

  return (
    <div className={`${t.bg} ${t.text} p-8 rounded-lg border ${t.border} max-w-[21cm] mx-auto shadow-2xl`}
      style={{ minHeight: '29.7cm', fontFamily: 'var(--font-geist-sans)' }}>
      
      {/* Summary */}
      {content.summary && (
        <section className="mb-6">
          <h2 className={`text-sm font-bold uppercase tracking-wider ${t.accent} mb-2`}>
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed">{content.summary}</p>
        </section>
      )}

      {/* Experience */}
      {content.experiences && content.experiences.length > 0 && (
        <section className="mb-6">
          <h2 className={`text-sm font-bold uppercase tracking-wider ${t.accent} mb-3`}>
            Experience
          </h2>
          {content.experiences.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">{exp.role}</h3>
                <span className="text-xs opacity-60">{exp.startDate} — {exp.endDate}</span>
              </div>
              <p className="text-sm opacity-70 mb-1">{exp.company}</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {exp.bullets.filter(b => b.trim()).map((bullet, j) => (
                  <li key={j}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {content.skills && content.skills.length > 0 && (
        <section className="mb-6">
          <h2 className={`text-sm font-bold uppercase tracking-wider ${t.accent} mb-2`}>
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {content.skills.map((skill, i) => (
              <span key={i} className={`px-2 py-0.5 text-xs rounded border ${t.border}`}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {content.education && content.education.length > 0 && (
        <section>
          <h2 className={`text-sm font-bold uppercase tracking-wider ${t.accent} mb-2`}>
            Education
          </h2>
          {content.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <span className="font-medium text-sm">{edu.degree}</span>
                <span className="text-xs opacity-60">{edu.year}</span>
              </div>
              <p className="text-sm opacity-70">{edu.school}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
