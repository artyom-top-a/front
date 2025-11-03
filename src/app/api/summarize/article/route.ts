// app/api/summarize/route.ts

import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateObject } from 'ai';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

// Set a max duration for the AI responses (up to 30 seconds)
export const maxDuration = 30;

// Zod schema for validating the request body
const articleSchema = z.object({
    url: z.string().url(), // Expecting a valid URL
});

// Zod schema for the summarization structure
const summarySchema = z.object({
    summary: z.string(),
});

// POST request handler to process the article and return the summary
export async function POST(req: NextRequest) {
    try {
        // Parse the incoming request JSON
        const { url } = articleSchema.parse(await req.json());

        // Fetch the article content from the provided URL
        const response = await fetch(url);
        const html = await response.text();

        // Use Cheerio to parse the HTML and extract the main content
        const $ = cheerio.load(html);
        const articleContent = $('article').text() || $('body').text();

        if (!articleContent) {
            return NextResponse.json({ error: 'Could not extract article content' }, { status: 400 });
        }

        // Use Vercel AI SDK's OpenAI to summarize the article content
        const { object } = await generateObject({
            model: openai('gpt-3.5-turbo'),
            schema: summarySchema,
            prompt: `
                Summarize the following article thoroughly, ensuring that:
                1. All important topics, key points, and sections are covered in detail.
                2. Each section of the article is summarized, capturing the essence of the main ideas.
                3. Provide a clear and concise summary that accurately reflects the article's content.
                4. Avoid trivial details, and focus on the core points and concepts discussed in the article.

                Article Content: ${articleContent}
            `
        });

        // Return the generated summary as a JSON response
        return NextResponse.json({
            message: 'Article summarized successfully!',
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
