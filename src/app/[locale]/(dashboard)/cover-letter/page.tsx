'use client';

import { useState, useCallback } from 'react';

export default function CoverLetterPage() {
  const [companyName, setCompanyName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeContent, setResumeContent] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!companyName.trim() || !roleName.trim()) return;
    setIsGenerating(true);
    setCoverLetter('');

    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          roleName: roleName.trim(),
          jobDescription: jobDescription.trim(),
          resumeContent: resumeContent.trim(),
        }),
      });

      if (!res.ok) throw new Error('Generation failed');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        setCoverLetter(result);
      }
    } catch {
      setCoverLetter('Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [companyName, roleName, jobDescription, resumeContent]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [coverLetter]);

  const handleDownloadTxt = useCallback(() => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${companyName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [coverLetter, companyName]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-2">AI Cover Letter Generator</h1>
      <p className="text-zinc-400 mb-8 text-sm">
        Generate a personalized cover letter in seconds. Paste your resume and job details below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left: Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Company Name *</label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="e.g., Google"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Role *</label>
            <input
              type="text"
              value={roleName}
              onChange={e => setRoleName(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Job Description <span className="text-zinc-500 font-normal">(optional)</span></label>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={4}
              placeholder="Paste the job posting here for a more tailored letter..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm resize-none outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Your Resume Content <span className="text-zinc-500 font-normal">(optional)</span></label>
            <textarea
              value={resumeContent}
              onChange={e => setResumeContent(e.target.value)}
              rows={6}
              placeholder="Paste your resume text here so the AI can reference your experience..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm resize-none outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !companyName.trim() || !roleName.trim()}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
          </button>
        </div>

        {/* Right: Output */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">Generated Cover Letter</label>
            {coverLetter && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 text-xs border border-zinc-700 rounded hover:border-zinc-500 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="px-3 py-1 text-xs border border-zinc-700 rounded hover:border-zinc-500 transition-colors"
                >
                  Download .txt
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 min-h-[400px] bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {coverLetter || (
              <span className="text-zinc-600">
                Your cover letter will appear here...
              </span>
            )}
            {isGenerating && (
              <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-0.5" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
