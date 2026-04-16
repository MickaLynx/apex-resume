import { streamText } from 'ai';

export async function POST(req: Request) {
  const { resumeContent, jobDescription } = await req.json();

  const result = streamText({
    model: 'anthropic/claude-sonnet-4.6',
    system: `You are an expert resume reviewer. Score the resume against 23 criteria.
Return a JSON object with:
- totalScore (0-100)
- criteria (array of {name, score (0-100), feedback, priority ("critical"|"important"|"minor")})
- topImprovements (array of 3 most impactful changes)

The 23 criteria are:
1. Contact information completeness
2. Professional summary quality and relevance
3. Experience section: achievement quantification (numbers, %)
4. Experience section: action verbs usage
5. Experience section: relevance to target role
6. Skills section completeness
7. Education formatting
8. Consistency (tense, formatting, spacing)
9. Length appropriateness (1-2 pages)
10. ATS compatibility (no tables, images, headers/footers)
11. Keyword density vs job description
12. Grammar and spelling
13. Professional tone
14. Chronological order correctness
15. Gap explanation (if any)
16. Certifications and credentials
17. Technical skills specificity
18. Soft skills demonstration (not just listing)
19. Project descriptions quality
20. Industry terminology usage
21. Measurable impact statements
22. Leadership indicators
23. Overall visual hierarchy and readability

${jobDescription ? `Target job description:\n${jobDescription}` : ''}`,
    prompt: `Score this resume:\n\n${resumeContent}`,
  });

  return result.toTextStreamResponse();
}
