import Link from 'next/link';

const templates = [
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    description: 'Clean, dark-themed design. Best for tech and creative roles.',
    popular: true,
    bg: 'bg-zinc-900',
    text: 'text-zinc-100',
    accent: 'text-blue-400',
    border: 'border-zinc-700',
  },
  {
    id: 'classic-white',
    name: 'Classic Professional',
    description: 'Traditional format. Best for corporate and finance roles.',
    popular: false,
    bg: 'bg-white',
    text: 'text-zinc-900',
    accent: 'text-blue-600',
    border: 'border-zinc-300',
  },
  {
    id: 'minimal-blue',
    name: 'Minimal Blue',
    description: 'Minimalist with blue accents. Best for startups and design roles.',
    popular: true,
    bg: 'bg-slate-50',
    text: 'text-slate-900',
    accent: 'text-indigo-600',
    border: 'border-indigo-200',
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Bold header, two-column layout. Best for senior leadership.',
    popular: false,
    bg: 'bg-zinc-50',
    text: 'text-zinc-900',
    accent: 'text-amber-600',
    border: 'border-amber-200',
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    description: 'Visual, colorful layout. Best for designers and artists.',
    popular: false,
    bg: 'bg-violet-50',
    text: 'text-violet-900',
    accent: 'text-violet-600',
    border: 'border-violet-200',
  },
];

function TemplateMiniPreview({ t }: { t: typeof templates[number] }) {
  return (
    <div className={`h-48 ${t.bg} ${t.text} p-4 text-[8px] leading-tight overflow-hidden`}>
      <div className={`font-bold text-[11px] mb-2 ${t.accent}`}>Jane Smith</div>
      <div className={`text-[7px] uppercase tracking-widest ${t.accent} mb-1 pb-0.5 border-b ${t.border}`}>
        Summary
      </div>
      <div className="mb-2 opacity-70">
        Senior engineer with 8+ years building scalable systems...
      </div>
      <div className={`text-[7px] uppercase tracking-widest ${t.accent} mb-1 pb-0.5 border-b ${t.border}`}>
        Experience
      </div>
      <div className="mb-0.5">
        <span className="font-semibold">Sr. Engineer</span>
        <span className="opacity-50 ml-1">2020 - Present</span>
      </div>
      <div className="opacity-60 mb-1">Acme Corp</div>
      <div className={`text-[7px] uppercase tracking-widest ${t.accent} mb-1 pb-0.5 border-b ${t.border}`}>
        Skills
      </div>
      <div className="flex flex-wrap gap-0.5">
        {['React', 'Node.js', 'TypeScript', 'AWS'].map(s => (
          <span key={s} className={`px-1 border ${t.border} rounded text-[7px]`}>{s}</span>
        ))}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-2">Resume Templates</h1>
      <p className="text-zinc-400 text-sm mb-8">
        All templates are ATS-optimized. Choose one and customize with AI.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <Link
            key={t.id}
            href={`/resume/new?template=${t.id}`}
            className="group relative border border-zinc-800 rounded-xl overflow-hidden hover:border-blue-500 transition-colors"
          >
            {t.popular && (
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-blue-600 rounded text-xs font-medium z-10">
                Popular
              </div>
            )}
            <TemplateMiniPreview t={t} />
            <div className="p-4">
              <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                {t.name}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">{t.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
