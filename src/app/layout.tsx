import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'ApexResume — AI Resume Builder',
  description: 'Build ATS-optimized resumes with AI. Score, tailor, and download professional resumes in minutes.',
  keywords: ['resume builder', 'AI resume', 'ATS optimization', 'cover letter', 'job application'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-zinc-950 text-zinc-50`}>
        {children}
      </body>
    </html>
  );
}
