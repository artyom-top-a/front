export const maxDuration = 60; // Maximum execution time in seconds (default: 10s, max: 900s)
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
// import { z } from 'zod';
import pdfParse from 'pdf-parse';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { client } from '@/lib/prisma';
import { auth } from '../../../../../auth';
import { parseHTMLToJSONContent } from '@/utils/parse-html-to-json-content';
import { aj } from '@/lib/arcjet';

export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await auth();

    const user = session?.user;

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId: string = user.id; // Ensure userId is strictly of type string

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

    // Parse the form data to get the file
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    // Read the file content
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from the PDF using pdf-parse
    const data = await pdfParse(buffer);
    const totalPages = data.numpages;
    const extractedText = data.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: 'Failed to extract text from the file.' }, { status: 400 });
    }

    // Page limit check
    if (totalPages > 100) {
      return NextResponse.json(
        { error: `The document has ${totalPages} pages, exceeding the limit of 100 pages.` },
        { status: 413 }
      );
    }

    // Word count check
    const wordCount = extractedText.split(/\s+/).length;
    if (wordCount > 10000) {
      return NextResponse.json(
        { error: `The document contains ${wordCount} words, exceeding the limit of 10,000 words.` },
        { status: 413 }
      );
    }

    console.log(`Document Info: ${totalPages} pages, ${wordCount} words`);

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
    ${extractedText}
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

    title = title.replace(/^Language:\s*\w+/i, '').trim();
    title = title.replace(/^Title:\s*/i, '').trim();


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
      ${extractedText}
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

    const cleanSource = extractedText.replace(/[\x00-\x1F]/g, "");
    const cleanContent = generatedHtmlContent
  .replace(/^```html\s*/i, "")
  .replace(/\s*```$/i, "");

    // const jsonContent = parseHTMLToJSONContent(generatedHtmlContent)

    // Create a new note in the database
    const note = await client.note.create({
      data: {
        title,
        // source: extractedText,
        // content: generatedHtmlContent,
        source: cleanSource,
        content: cleanContent,
        // content: jsonContent,
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
        message: 'Notes generated and saved successfully!',
        noteId: note.id,
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




















// // app/api/generate-summary/pdf/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import pdfParse from 'pdf-parse';
// import { openai } from '@ai-sdk/openai';
// import { generateText } from 'ai';
// import { client } from '@/lib/prisma';
// import { auth } from '../../../../../auth';
// import { aj } from '@/lib/arcjet';

// export const dynamic = 'force-dynamic';
// export const maxDuration = 45;

// export async function POST(req: NextRequest) {
//   try {
//     // — auth + rate-limit checks (unchanged) —
//     const session = await auth();
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }
//     const userId = session.user.id;
//     const decision = await aj.protect(req, { userId, requested: 5 });
//     if (decision.isDenied()) {
//       return NextResponse.json({ error: 'Too Many Requests', reason: decision.reason }, { status: 429 });
//     }
//     const userRecord = await client.user.findUnique({ where: { id: userId }, select: { generations: true, generationsUsedThisMonth: true }});
//     if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     if (userRecord.generationsUsedThisMonth >= userRecord.generations) {
//       return NextResponse.json({ error: 'Generation limit exceeded' }, { status: 403 });
//     }

//     // — parse formData + pages array —
//     const formData = await req.formData();
//     const file = formData.get('file');
//     const pagesField = formData.get('pages')?.toString() || '[]';
//     const selectedPages: number[] = JSON.parse(pagesField);

//     if (!file || !(file instanceof File)) {
//       return NextResponse.json({ error: 'No file received.' }, { status: 400 });
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());
//     const data = await pdfParse(buffer);
//     const allPages = data.text.split('\f'); // split raw text by page breaks

//     // pick only requested pages (1-based indices)
//     const extractedText = selectedPages.length
//       ? selectedPages
//           .sort((a, b) => a - b)
//           .map((p) => allPages[p - 1] || '')
//           .join('\n')
//       : data.text;

//     // word-count guard on extractedText
//     const wordCount = extractedText.split(/\s+/).length;
//     if (wordCount > 10000) {
//       return NextResponse.json(
//         { error: `Selected pages have ${wordCount} words, exceeding the 10,000-word limit.` },
//         { status: 413 }
//       );
//     }

//     // — generate title prompt —
//     const titlePrompt = `
// You are an AI assistant tasked with analyzing a transcript and generating a concise title.
// Output exactly one line: the title in the transcript’s language, no labels or extra text.
// Transcript:
// ${extractedText}
//     `;
//     const titleRes = await generateText({ model: openai('o1-mini'), prompt: titlePrompt });
//     const title = (titleRes.text || 'Untitled').trim();

//     // — generate content prompt —
//     const contentPrompt = `
//     Please detect the language of the following text and generate detailed, well - structured notes in that language, formatted in valid HTML.The notes should:

//     - Begin with an < h2 > tag containing the main topic or title(do not mention the language).
//     - Divide the lecture notes into 1-4 major sections (<h2> headings), each representing roughly one-quarter of the entire content.
//     - Provide a comprehensive overview of all parts of the lecture text, not just the beginning.
//     - Organize content under < h2 > and < h3 > tags for key sections and subsections.
//     - Use < p > tags for paragraphs with extensive and clear explanations.
//     - Include bullet points using < ul > and<li> for lists where appropriate, covering key points.
//     - Use formatting, such as <strong> for bold and<em> for italic, to emphasize important concepts.
//     - Include quotes in <blockquote>tags for important statements or ideas.
//     - Only use < pre > <code></code></pre > for actual code snippets if they appear in the content.
//     - ** Focus on delivering a comprehensive summary ** by expanding on each section's key points, details, and examples where possible.
//     - Avoid any ellipses("...") or language mentions; ensure each section is thoroughly explained and fully written out.

//     Your goal is to provide an **in -depth, structured summary ** that captures all important points, examples, and finer details for a comprehensive understanding of the content.

//     Text Content:
//     ${extractedText}
//   `;
//     const contentRes = await generateText({ model: openai('o1-mini'), prompt: contentPrompt });
//     const htmlContent = contentRes.text?.trim() || '';

//     // — persist to DB and update usage —
//     const note = await client.note.create({
//       data: {
//         title,
//         source: extractedText,
//         content: htmlContent,
//         ownerId: userId,
//         isPublic: false,
//       },
//     });
//     await client.user.update({
//       where: { id: userId },
//       data: { generationsUsedThisMonth: { increment: 1 } },
//     });

//     return NextResponse.json({
//       message: 'Notes generated!',
//       noteId: note.id,
//       notes: { id: note.id, title, content: htmlContent }
//     }, { status: 200 });

//   } catch (err: any) {
//     console.error('Error in generate-summary/pdf:', err);
//     return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
//   }
// }
