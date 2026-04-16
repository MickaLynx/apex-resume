import Link from 'next/link';

const templates = [
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    preview: '/templates/modern-dark.png',
    description: 'Clean, dark-themed design. Best for tech and creative roles.',
    popular: true,
  },
  {
    id: 'classic-white',
    name: 'Classic Professional',
    preview: '/templates/classic-white.png',
    description: 'Traditional format. Best for corporate and finance roles.',
    popular: false,
  },
  {
    id: 'minimal-blue',
    name: 'Minimal Blue',
    preview: '/templates/minimal-blue.png',
    description: 'Minimalist with blue accents. Best for startups and design roles.',
    popular: true,
  },
  {
    id: 'executive',
    name: 'Executive',
    preview: '/templates/executive.png',
    description: 'Bold header, two-column layout. Best for senior leadership.',
    popular: false,
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    preview: '/templates/creative.png',
    description: 'Visual, colorful layout. Best for designers and artists.',
    popular: false,
  },
];

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
            <div className="h-48 bg-zinc-900 flex items-center justify-center">
              <span className="text-4xl opacity-30">📄</span>
            </div>
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
