export const maxDuration = 60; // Maximum execution time in seconds (default: 10s, max: 900s)
export const dynamic = 'force-dynamic';

import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateText } from 'ai';
import { client } from '@/lib/prisma';
import { auth } from '../../../../../auth';
import { aj } from '@/lib/arcjet';

const textSchema = z.object({
  content: z.string().min(1), // Expecting non-empty text content
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    const user = session?.user;

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId: string = user.id;

    const decision = await aj.protect(req, { userId, requested: 5 }); // Deduct 5 tokens from the bucket
    console.log("Arcjet decision", decision);
  
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Too Many Requests", reason: decision.reason },
        { status: 429 },
      );
    }

    const userRecord = await client.user.findUnique({
      where: { id: userId },
      select: { generations: true, generationsUsedThisMonth: true },
    });


    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the user has exceeded the monthly generation limit
    if (userRecord.generationsUsedThisMonth >= userRecord.generations) {
      return NextResponse.json({ error: 'Generation limit exceeded' }, { status: 403 });
    }

    const { content } = textSchema.parse(await req.json());

    // Generate a title with language detection, excluding the language name
    const titlePrompt = `
You are an AI assistant tasked with analyzing a transcript and generating a concise, descriptive title that represents the main theme of the content. Follow these rules strictly:

- Internally detect the language of the transcript with high accuracy.
- Generate the title **only in the detected language**.
- Do not mention the detected language in the title.
- Do not include any prefixes or labels such as "Title:", "Language:", or "Sprachanalyse:".
- Do not describe or explain the process of language detection.
- Do not provide any commentary, explanation, or additional information.
- Output only the final title as a single line, without any extra text or formatting before or after it.
- Ensure the title reflects the transcript's main theme comprehensively but concisely.

Transcript:
${content}
`;


    const titleResponse = await generateText({
      model: openai('gpt-5-nano'),
      temperature: 1, 
      prompt: titlePrompt,
    });

    if (!titleResponse || !titleResponse.text) {
      throw new Error('Failed to generate title');
    }

    let title = titleResponse.text.trim() || 'Untitled';

    title = title.replace(/^Title:\s*/i, '').trim();

    // Generate structured HTML content with improved prompting
    const contentPrompt = `
      Please detect the language of the following text and generate detailed, well - structured notes in that language, formatted in valid HTML.The notes should:

      - Begin with an < h2 > tag containing the main topic or title(do not mention the language).
      - Divide the lecture notes into 1-4 major sections (<h2> headings), each representing roughly one-quarter of the entire content.
      - Provide a comprehensive overview of all parts of the lecture text, not just the beginning.
      - Organize content under < h2 > and < h3 > tags for key sections and subsections.
      - Use < p > tags for paragraphs with extensive and clear explanations.
      - Include bullet points using < ul > and<li> for lists where appropriate, covering key points.
      - Use formatting, such as <strong> for bold and<em> for italic, to emphasize important concepts.
      - Include quotes in <blockquote>tags for important statements or ideas.
      - Only use < pre > <code></code></pre > for actual code snippets if they appear in the content.
      - ** Focus on delivering a comprehensive summary ** by expanding on each section's key points, details, and examples where possible.
      - Avoid any ellipses("...") or language mentions; ensure each section is thoroughly explained and fully written out.

      Your goal is to provide an **in -depth, structured summary ** that captures all important points, examples, and finer details for a comprehensive understanding of the content.

      Text Content:
      ${content}
    `;

    const contentResponse = await generateText({
      model: openai('gpt-5-nano'),
      temperature: 1, 
      prompt: contentPrompt,
    });

    if (!contentResponse || !contentResponse.text) {
      throw new Error('Failed to generate content');
    }

    const generatedHtmlContent = contentResponse.text.trim();

    // Create a new note in the database
    const note = await client.note.create({
      data: {
        title,
        source: content,
        // source: "This is the source text",
        content: generatedHtmlContent,
        ownerId: userId, // userId is now guaranteed to be a string
        isPublic: false, // Set default visibility as private
      },
    });


    // Increment the generation count on success
    await client.user.update({
      where: { id: userId },
      data: {
        generationsUsedThisMonth: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Notes generated successfully!',
        notes: { title, content: generatedHtmlContent, id: note.id, },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error generating summary:', error.message);
      return NextResponse.json(
        { error: error.message || 'Failed to generate summary' },
        { status: 500 }
      );
    } else {
      console.error('Unknown error generating summary:', error);
      return NextResponse.json(
        { error: 'Failed to generate summary due to an unknown error' },
        { status: 500 }
      );
    }
  }
}
