export const maxDuration = 60; // Maximum execution time in seconds (default: 10s, max: 900s)
export const dynamic = 'force-dynamic';


import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateText } from 'ai';
import { client } from '@/lib/prisma';
import { auth } from '../../../../../auth';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { aj } from '@/lib/arcjet';

const articleSchema = z.object({
  url: z.string().url(), // Valid article URL
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

    const { url } = articleSchema.parse(await req.json());

    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);
    const articleContent = $('article').text() || $('body').text();

    if (!articleContent) {
      return NextResponse.json({ error: 'Could not extract article content' }, { status: 400 });
    }

    const cleanText = articleContent
      .replace(/(\w+)-\s+(\w+)/g, '$1$2') // Fix hyphenated line breaks
      .replace(/\s{2,}/g, ' ') // Remove extra spaces
      .replace(/[^a-zA-Z0-9.,!?'\s]/g, '') // Remove special characters
      .trim();

    console.log(cleanText)

    if (!cleanText) {
      throw new Error('Could not extract valid article content');
    }

    // Calculate word count
    const wordCount = cleanText.split(/\s+/).length;

    // Validate word count
    if (wordCount > 5000) {
      return NextResponse.json(
        { error: `The content exceeds the word limit of 5,000 words. Detected ${wordCount} words.` },
        { status: 413 }
      );
    }

    console.log(`Word count: ${wordCount}`);

    // Generate a title with language detection, excluding the language name
    const titlePrompt = `
You are an AI assistant tasked with analyzing a transcript to generate a concise, descriptive title. The transcript is written in English. Follow these rules strictly:

- Generate the title **only in English**, regardless of any unrelated content or noise.
- Ignore any introductory text, metadata, or unrelated fragments.
- Do not include prefixes like "Title:", "Language:", or any other explanatory text.
- Focus only on the main theme of the transcript.
- Output the final title as a single line, without any additional commentary or formatting.

Here is the transcript:
${cleanText}
`;




    const titleResponse = await generateText({
      model: openai('gpt-5-nano'),
      prompt: titlePrompt,
      temperature: 1, 
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
      ${cleanText}
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
        source: cleanText,
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
