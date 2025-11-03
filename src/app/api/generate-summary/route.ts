// app/api/generate-notes/route.ts
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    // Generate a title
    const titlePrompt = `
    Generate a short title based on the following text without including the word "Title" at the beginning.
    
    Text Content:
    ${content}
    `;

    const titleResponse = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: titlePrompt,
    });

    if (!titleResponse || !titleResponse.text) {
      throw new Error('Failed to generate title');
    }

    const title = titleResponse.text.trim() || 'Untitled';

    // Generate structured HTML content
    const contentPrompt = `
Based on the following text content, generate well-structured and concise notes in valid HTML format. The notes should:

- Start with an <h2> tag containing the main topic or title.
- Use <h2> and <h3> for subheadings and sections.
- Use <p> tags for paragraphs with clear and concise information.
- Include bullet points using <ul> and <li> where appropriate.
- Apply text formatting such as <strong> for bold, <em> for italic, <u> for underline, and <s> for strikethrough where it enhances readability.
- Include any important quotes in <blockquote> tags.
- Use <code> blocks for any code snippets.

Please ensure the HTML is properly nested and formatted.

Text Content:
${content}
`;
    const contentResponse = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: contentPrompt,
    });

    if (!contentResponse || !contentResponse.text) {
      throw new Error('Failed to generate content');
    }

    const generatedHtmlContent = contentResponse.text.trim();

    // Return the title and HTML content
    return NextResponse.json({
      message: 'Notes generated successfully!',
      notes: { title, content: generatedHtmlContent },
    }, { status: 200 });
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
