import { streamText, Output } from 'ai';

export async function POST(req: Request) {
  const { experience, education, skills, targetJob } = await req.json();

  const result = streamText({
    model: 'anthropic/claude-sonnet-4.6',
    system: `You are a professional resume writer. Generate polished, ATS-optimized resume content.
Rules:
- Use strong action verbs (Led, Delivered, Architected, Optimized)
- Quantify achievements with numbers and percentages
- Keep bullet points concise (1-2 lines max)
- Match keywords from the target job description
- No personal pronouns (I, my, we)
- Professional tone throughout`,
    prompt: `Generate a professional resume based on this information:

Experience: ${JSON.stringify(experience)}
Education: ${JSON.stringify(education)}
Skills: ${JSON.stringify(skills)}
${targetJob ? `Target job: ${targetJob}` : ''}

Return the resume sections as structured markdown with clear headers.`,
  });

  return result.toTextStreamResponse();
}
