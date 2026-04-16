import { streamText } from 'ai';

export async function POST(req: Request) {
  const { resumeContent, companyName, roleName, jobDescription } = await req.json();

  const result = streamText({
    model: 'anthropic/claude-sonnet-4.6',
    system: `You are an expert cover letter writer. Write compelling, personalized cover letters.
Rules:
- Address the specific company and role
- Reference 2-3 key achievements from the resume
- Professional but warm tone
- 3-4 paragraphs
- Clear call to action at the end`,
    prompt: `Write a cover letter for ${companyName} (${roleName}).
${jobDescription ? `Job: ${jobDescription}` : ''}
Resume: ${resumeContent}`,
  });

  return result.toTextStreamResponse();
}
