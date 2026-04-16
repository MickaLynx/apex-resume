import { NextRequest, NextResponse } from 'next/server';

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

interface ResumeData {
  title: string;
  summary: string;
  experiences: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  template?: 'modern-dark' | 'classic-white' | 'minimal-blue';
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateResumeHTML(data: ResumeData): string {
  const template = data.template || 'classic-white';

  const themes = {
    'modern-dark': { bg: '#18181b', text: '#f4f4f5', accent: '#60a5fa', border: '#3f3f46', skillBg: '#27272a' },
    'classic-white': { bg: '#ffffff', text: '#18181b', accent: '#2563eb', border: '#d4d4d8', skillBg: '#f4f4f5' },
    'minimal-blue': { bg: '#f8fafc', text: '#0f172a', accent: '#4f46e5', border: '#c7d2fe', skillBg: '#e0e7ff' },
  };

  const t = themes[template];

  const experienceHTML = data.experiences
    .filter(exp => exp.company || exp.role)
    .map(exp => `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <strong style="font-size: 14px;">${escapeHtml(exp.role)}</strong>
          <span style="font-size: 11px; opacity: 0.6;">${escapeHtml(exp.startDate)} - ${escapeHtml(exp.endDate)}</span>
        </div>
        <div style="font-size: 13px; opacity: 0.7; margin-bottom: 4px;">${escapeHtml(exp.company)}</div>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.5;">
          ${exp.bullets.filter(b => b.trim()).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
        </ul>
      </div>
    `).join('');

  const educationHTML = data.education
    .filter(edu => edu.institution || edu.degree)
    .map(edu => `
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between;">
          <strong style="font-size: 13px;">${escapeHtml(edu.degree)}${edu.field ? ` in ${escapeHtml(edu.field)}` : ''}</strong>
          <span style="font-size: 11px; opacity: 0.6;">${escapeHtml(edu.startDate)} - ${escapeHtml(edu.endDate)}</span>
        </div>
        <div style="font-size: 13px; opacity: 0.7;">${escapeHtml(edu.institution)}</div>
      </div>
    `).join('');

  const skillsHTML = data.skills.length > 0
    ? data.skills.map(s => `<span style="display: inline-block; padding: 2px 10px; margin: 2px 4px 2px 0; font-size: 12px; border-radius: 4px; border: 1px solid ${t.border}; background: ${t.skillBg};">${escapeHtml(s)}</span>`).join('')
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(data.title || 'Resume')}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: ${t.bg}; color: ${t.text}; }
    .page { width: 210mm; min-height: 297mm; padding: 24mm 20mm; margin: 0 auto; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 20px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${t.accent}; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid ${t.border}; }
    section { margin-bottom: 20px; }
    @media print {
      body { background: white; }
      .page { padding: 15mm; width: 100%; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; padding: 16px; background: #18181b; color: white;">
    <button onclick="window.print()" style="padding: 8px 24px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer;">
      Save as PDF (Ctrl+P)
    </button>
  </div>
  <div class="page">
    <h1>${escapeHtml(data.title || 'Resume')}</h1>
    ${data.summary ? `<section><div class="section-title">Professional Summary</div><p style="font-size: 13px; line-height: 1.6;">${escapeHtml(data.summary)}</p></section>` : ''}
    ${experienceHTML ? `<section><div class="section-title">Experience</div>${experienceHTML}</section>` : ''}
    ${skillsHTML ? `<section><div class="section-title">Skills</div><div>${skillsHTML}</div></section>` : ''}
    ${educationHTML ? `<section><div class="section-title">Education</div>${educationHTML}</section>` : ''}
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const data: ResumeData = await req.json();
    const html = generateResumeHTML(data);

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
