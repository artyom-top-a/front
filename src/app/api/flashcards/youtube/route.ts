export const maxDuration = 30; // Maximum execution time in seconds (default: 10s, max: 900s)
export const dynamic = 'force-dynamic';

import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateObject, generateText } from 'ai';
import { client } from '@/lib/prisma';
import { auth } from '../../../../../auth';
import { Innertube } from 'youtubei.js/web';
import { aj } from '@/lib/arcjet';

export const runtime = 'nodejs'; // New syntax

// Types
type Flashcard = {
  question: string;
  answer: string;
};

// Zod schemas for validation
const youtubeSchema = z.object({
  url: z.string().url(), // Validate YouTube URL
});

const flashcardSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
});

// POST handler
export async function POST(req: NextRequest) {
  const startTime = Date.now(); // Start timing for performance logs

  try {
    // Authenticate user
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

    // const userId: string = "cm3j6a5b3000011eo834krxyd"

    // Check user generation limits
    const userRecord = await client.user.findUnique({
      where: { id: userId },
      select: { generations: true, generationsUsedThisMonth: true },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userRecord.generationsUsedThisMonth >= userRecord.generations) {
      return NextResponse.json({ error: 'Generation limit exceeded' }, { status: 403 });
    }

    // Parse request body
    const { url } = youtubeSchema.parse(await req.json());

    // Fetch transcript using youtubei.js
    const youtube = await Innertube.create({
      lang: 'en',
      location: 'US',
      retrieve_player: false,
    });


    const fetchTranscript = async (): Promise<string[]> => {
      try {
        const videoId = new URL(url).searchParams.get('v') || url.split('/').pop();
        if (!videoId) throw new Error('Invalid Video ID.');

        const info = await youtube.getInfo(videoId);

        // Ensure duration is defined
        const durationInSeconds = info.basic_info.duration ?? null; // Use null if undefined
        

        if (durationInSeconds !== null) {

          if (durationInSeconds > 7200) {
            throw new Error('Video is longer than 2 hours. Processing not allowed.');
          }

          const minutes = Math.floor(durationInSeconds / 60);
          const seconds = durationInSeconds % 60;
          console.log(`Video Duration: ${minutes} minutes and ${seconds} seconds (${durationInSeconds} seconds)`);
        } else {
          console.log(`Video Duration: Not available`);
        }

        const transcriptData = await info.getTranscript();

        if (
          !transcriptData ||
          !transcriptData.transcript ||
          !transcriptData.transcript.content ||
          !transcriptData.transcript.content.body ||
          !transcriptData.transcript.content.body.initial_segments
        ) {
          throw new Error('Transcript is unavailable for this video.');
        }

        return transcriptData.transcript.content.body.initial_segments.map(
          (segment: any) => segment.snippet.text
        );
      } catch (error) {
        console.error('Error fetching transcript:', error);
        throw error;
      }
    };


    // Ensure wordCount is declared only once
    const transcriptArray = await fetchTranscript();
    const videoContent = transcriptArray.join(' ');

    // If wordCount has already been declared earlier, reassign it instead of redeclaring
    const wordCount = videoContent.split(/\s+/).length; // Ensure no duplicate declaration
    const charCount = videoContent.length;

    // if (wordCount > 18000) {
    //   throw new Error('Transcript exceeds 18,000 words. Processing not allowed.');
    // }

    console.log(`Transcript Length: ${wordCount} words, ${charCount} characters`);

    // Generate title for the deck
    const titleResponse = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: `
          Create a short, engaging, and descriptive title for the following content. The title should:
          - Be concise and directly reflect the key topic or theme of the content.
          - Avoid unnecessary phrases like "flashcards," "summary," or similar.
          - Not include quotation marks or extra formatting.
          - Focus on capturing the essence of the content in a memorable way.
          
          Content: "${videoContent.slice(0, 1000)}..."`,
    });

    const generatedTitle = titleResponse.text.trim() || "Generated Flashcards";

    // Calculate flashcard count
    const targetFlashcardCount = Math.min(Math.max(Math.floor(wordCount / 100), 10), 40);

    console.log(`Target flashcard count: ${targetFlashcardCount}`);

    // Split content into dynamic chunks
    const chunkSize = videoContent.length <= 5000 ? 2000 : Math.ceil(videoContent.length / 5);
    const chunks: string[] = [];
    for (let i = 0; i < videoContent.length; i += chunkSize) {
      chunks.push(videoContent.slice(i, i + chunkSize));
    }

    console.log(`Total chunks created: ${chunks.length}`);

    // Process chunks in parallel
    const chunkPromises = chunks.map(async (chunk) => {
      const { object } = await generateObject({
        model: openai('gpt-3.5-turbo'),
        schema: flashcardSchema,
        prompt: `
            First, identify the language of the following text and then generate unique flashcards with concise questions and answers exclusively in that language. Only create content-based flashcards and avoid abbreviations, and provide full answers without ellipses ("..."). Each answer should be concise (1-3 sentences), but should fully convey the concept without trailing off. Exclude any questions about the language of the text; only focus on content-related material. Each answer should be complete and contextually relevant. Follow these guidelines:
    
              1. Include essential points, key terms, and concepts, as well as smaller details that may seem less important but contribute to a full understanding of the content.
              2. Ensure a variety of question types, such as definitions, explanations, deeper analyses, and examples, to cover different aspects of the material.
              3. Break down complex ideas into multiple questions if needed to capture every relevant detail.
              4. Avoid overly trivial questions; however, feel free to include questions about smaller details that aid in memory retention and review.
              5. Maintain a logical order in the questions to match the flow of the content, helping users follow along in a structured way.
              6. Provide clear, concise answers for each question, with sufficient context to reinforce understanding and learning.
    
              Transcript Content: ${chunk}
            `,
      });
      return object.flashcards || [];
    });

    const chunkResults = await Promise.all(chunkPromises);

    // Combine all flashcards
    let allFlashcards: Flashcard[] = [];
    chunkResults.forEach((result) => {
      allFlashcards = allFlashcards.concat(result);
    });

    // Limit total flashcards
    allFlashcards = allFlashcards.slice(0, targetFlashcardCount);

    console.log(`Total flashcards generated: ${allFlashcards.length}`);

    // Save to database using batch inserts
    const savedDeck = await client.deck.create({
      data: {
        title: generatedTitle,
        ownerId: userId,
        cards: {
          createMany: {
            data: allFlashcards.map((flashcard) => ({
              question: flashcard.question,
              answer: flashcard.answer,
            })),
          },
        },
      },
    });

    // Update user's generation count
    await client.user.update({
      where: { id: userId },
      data: {
        generationsUsedThisMonth: {
          increment: 1,
        },
      },
    });

    const endTime = Date.now(); // Log execution time
    console.log(`Processing completed in ${endTime - startTime} ms`);

    // Return success response
    return NextResponse.json({
      message: 'Flashcards generated successfully!',
      deckId: savedDeck.id,
    }, { status: 200 });

  } catch (error: unknown) {
    const endTime = Date.now();

    console.log(`Failed after ${endTime - startTime} ms`);
    if (error instanceof Error) {
      console.error('Error generating flashcards:', error.message);
      return NextResponse.json(
        { error: error.message || 'Failed to generate flashcards' },
        { status: 500 }
      );
    } else {
      console.error('Unknown error generating flashcards:', error);
      return NextResponse.json(
        { error: 'Failed to generate flashcards due to an unknown error' },
        { status: 500 }
      );
    }
  }
}