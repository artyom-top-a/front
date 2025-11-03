import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { YoutubeTranscript } from 'youtube-transcript';
import { generateObject } from 'ai';

type TranscriptSection = {
  text: string;
};

// Zod schema for validating the request body
const youtubeSchema = z.object({
  url: z.string().url(), // Expecting a valid URL
});

// Zod schema for the summarization structure
const summarySchema = z.object({
  summary: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const { url } = youtubeSchema.parse(await req.json());

    const transcript = await YoutubeTranscript.fetchTranscript(url);

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: 'Could not retrieve YouTube transcript' }, { status: 400 });
    }

    const videoContent = transcript.map((section: TranscriptSection) => section.text).join(' ');

    const { object } = await generateObject({
      model: openai('gpt-3.5-turbo'),
      schema: summarySchema,
      prompt: `
        Summarize the following YouTube video transcript thoroughly, ensuring that all important topics and key points are covered:
        ${videoContent}
      `
    });

    return NextResponse.json({
      message: 'YouTube video summarized successfully!',
      summary: object.summary,
    }, { status: 200 });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error summarizing article:', error.message);
      return NextResponse.json(
        { error: error.message || 'Failed to summarize article' },
        { status: 500 }
      );
    } else {
      console.error('Unknown error summarizing article:', error);
      return NextResponse.json(
        { error: 'Failed to summarize article' },
        { status: 500 }
      );
    }
  }
}
