import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LandingPage() {
  const t = useTranslations('landing');
  const tf = useTranslations('footer');
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-3xl text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            {t('hero_title')}{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              {t('hero_highlight')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto">
            {t('hero_subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
              {t('cta_primary')}
            </Link>
            <Link href="/pricing" className="px-8 py-3 border border-zinc-700 hover:border-zinc-500 rounded-lg font-medium transition-colors">
              {t('cta_secondary')}
            </Link>
          </div>
          <p className="text-sm text-zinc-500">{t('social_proof')}</p>
        </div>
      </section>

      <section className="px-6 py-24 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { title: t('feature_scoring'), desc: t('feature_scoring_desc'), icon: '\u{1F4CA}' },
            { title: t('feature_tailoring'), desc: t('feature_tailoring_desc'), icon: '\u{1F3AF}' },
            { title: t('feature_ats'), desc: t('feature_ats_desc'), icon: '\u{2705}' },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 py-8 border-t border-zinc-800 text-center text-sm text-zinc-500">
        <p>&copy; {new Date().getFullYear()} ApexResume. {tf('rights')}</p>
      </footer>
    </main>
  );
}
