export const maxDuration = 15; // Maximum execution time in seconds (default: 10s, max: 900s)
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { generateObject, generateText } from 'ai';
import pdfParse from "pdf-parse";
import { auth } from "../../../../../auth";
import { client } from "@/lib/prisma";
import { aj } from "@/lib/arcjet";

type Flashcard = {
  question: string;
  answer: string;
};

const flashcardSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
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

    // Retrieve user’s generation count and limit
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


    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);
    // const parsedText = await pdfToText(buffer);

    const cleanText = data.text
      .replace(/\n/g, " ")
      .replace(/(\w+)-\s+(\w+)/g, "$1$2")
      .replace(/\s{2,}/g, " ");


    const titleResponse = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: `Create a short, engaging, and informative title for a set of flashcards based on the following content. Ensure the title is relevant to the main topic and key points.
  
  Content: "${cleanText.slice(0, 1000)}..."`,
      maxTokens: 10,
    });

    const generatedTitle = titleResponse.text.trim() || "Generated Flashcards";

    const wordCount = cleanText.split(/\s+/).length;
    const targetFlashcardCount = Math.min(Math.max(Math.floor(wordCount / 100), 10), 50);

    console.log(`Word count: ${wordCount}`);
    console.log(`Target flashcard count: ${targetFlashcardCount}`);

    // Split text into manageable chunks if content is too large
    const chunkSize = 5000; // Number of characters per chunk
    const chunks: string[] = [];

    for (let i = 0; i < cleanText.length; i += chunkSize) {
      chunks.push(cleanText.slice(i, i + chunkSize)); // No error now
    }

    console.log(`Total chunks created: ${chunks.length}`);

    // Initialize an array to hold all flashcards
    let allFlashcards: Flashcard[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length}`);

      const { object } = await generateObject({
        model: openai('gpt-3.5-turbo'),
        schema: flashcardSchema,
        prompt: `
           Based on the following text content, first identify the language and then generate up to ${Math.min(targetFlashcardCount, 10)} unique flashcards with concise questions and answers in that language. Avoid abbreviations, and provide full answers without ellipses ("..."). Each answer should be concise (1-3 sentences), but should fully convey the concept without trailing off. Exclude any questions about the language of the text; only focus on content-related material. Each answer should be complete and contextually relevant. Follow these guidelines:
  
          1. **Identify Language**: Detect the language of the content and ensure all generated flashcards are in that language.
          2. **Capture Key Points**: Identify main topics, concepts, and important information throughout the text.
          3. **Logical Inference**: If sections of the text seem fragmented, attempt logical inferences based on context.
          4. **Use Variety in Questions**: Create a mix of questions covering definitions, explanations, implications, and examples.
          5. **Organize Logically**: Arrange flashcards in a logical order for a coherent flow of information.
          6. **Contextualize Answers**: For each answer, provide concise yet contextually rich explanations.
          7. **Focus on Core Ideas**: Emphasize memorable and practical points to help learners retain core ideas.
  
          Text Content: ${chunk}
        ,
        `,
      });

      const generatedFlashcards = object.flashcards as Flashcard[];

      allFlashcards = allFlashcards.concat(generatedFlashcards);
    }


    // Limit total flashcards to target count and log the final flashcard array
    allFlashcards = allFlashcards.slice(0, targetFlashcardCount);

    // Save flashcards and update user’s generation count
    await client.deck.create({
      data: {
        title: generatedTitle,
        ownerId: userId,
        cards: {
          create: allFlashcards.map((flashcard) => ({
            question: flashcard.question,
            answer: flashcard.answer,
          })),
        },
      },
    });

    // Increment generation count on success
    await client.user.update({
      where: { id: userId },
      data: {
        generationsUsedThisMonth: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      message: 'Flashcards generated successfully!',
      flashcards: allFlashcards,
    }, { status: 200 });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error generating flashcards:", error.message);
      return NextResponse.json(
        { error: 'Failed to generate flashcards due to JSON parsing issues or insufficient content.' },
        { status: 500 }
      );
    } else {
      console.error("Unknown error generating flashcards:", error);
      return NextResponse.json(
        { error: 'Failed to generate flashcards due to JSON parsing issues or insufficient content.' },
        { status: 500 }
      );
    }
  }
}
