// import { NextRequest, NextResponse } from "next/server";
// import { pdfToText } from "pdf-ts";
// import { openai } from '@ai-sdk/openai';
// import { z } from 'zod';
// import { generateObject, generateText } from 'ai';
// import pdfParse from "pdf-parse";
// import { auth } from "../../../../../auth";
// import { client } from "@/lib/prisma";

// type Flashcard = {
//     question: string;
//     answer: string;
// };

// const flashcardSchema = z.object({
//     flashcards: z.array(
//         z.object({
//             question: z.string(),
//             answer: z.string(),
//         })
//     ),
// });

// export async function POST(req: NextRequest) {
//     try {
//         const session = await auth();
//         const user = session?.user;

//         if (!user || !user.id) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//         }

//         const userId: string = user.id;

//         // Retrieve user’s generation count and limit
//         const userRecord = await client.user.findUnique({
//             where: { id: userId },
//             select: { generations: true, generationsUsedThisMonth: true },
//         });

//         if (!userRecord) {
//             return NextResponse.json({ error: 'User not found' }, { status: 404 });
//         }

//         // Check if the user has exceeded the monthly generation limit
//         if (userRecord.generationsUsedThisMonth >= userRecord.generations) {
//             return NextResponse.json({ error: 'Generation limit exceeded' }, { status: 403 });
//         }


//         const formData = await req.formData();
//         const file = formData.get("file");

//         if (!file || !(file instanceof File)) {
//             return NextResponse.json({ error: "No files received." }, { status: 400 });
//         }

//         const buffer = Buffer.from(await file.arrayBuffer());
//         const data = await pdfParse(buffer);
//         // const parsedText = await pdfToText(buffer);

//         const cleanText = data.text
//             .replace(/\n/g, " ")
//             .replace(/(\w+)-\s+(\w+)/g, "$1$2")
//             .replace(/\s{2,}/g, " ");


//         const titleResponse = await generateText({
//             model: openai('gpt-3.5-turbo'),
// prompt: `
// Create a short, engaging, and descriptive title for the following content. The title should:
// - Be concise and directly reflect the key topic or theme of the content.
// - Avoid unnecessary phrases like "flashcards," "summary," or similar.
// - Not include quotation marks or extra formatting.
// - Focus on capturing the essence of the content in a memorable way.

// Content: "${cleanText.slice(0, 1000)}..."`,

//         });

//         const generatedTitle = titleResponse.text.trim() || "Generated Flashcards";

//         const wordCount = cleanText.split(/\s+/).length;
//         const targetFlashcardCount = Math.min(Math.max(Math.floor(wordCount / 100), 10), 50);

//         console.log(`Word count: ${wordCount}`);
//         console.log(`Target flashcard count: ${targetFlashcardCount}`);

//         // Split text into manageable chunks if content is too large
//         const chunkSize = 5000; // Number of characters per chunk
//         const chunks: string[] = [];
//         for (let i = 0; i < cleanText.length; i += chunkSize) {
//             chunks.push(cleanText.slice(i, i + chunkSize));
//         }

//         console.log(`Total chunks created: ${chunks.length}`);

//         // Initialize an array to hold all flashcards
//         let allFlashcards: Flashcard[] = [];

//         for (let i = 0; i < chunks.length; i++) {
//             const chunk = chunks[i];
//             console.log(`Processing chunk ${i + 1}/${chunks.length}`);

//     const { object } = await generateObject({
//         model: openai('gpt-3.5-turbo'),
//         schema: flashcardSchema,
//         prompt: `
//    Based on the following text content, first identify the language and then generate up to ${Math.min(targetFlashcardCount, 10)} unique flashcards with concise questions and answers in that language. Avoid abbreviations, and provide full answers without ellipses ("..."). Each answer should be concise (1-3 sentences), but should fully convey the concept without trailing off. Exclude any questions about the language of the text; only focus on content-related material. Each answer should be complete and contextually relevant. Follow these guidelines:

//   1. **Identify Language**: Detect the language of the content and ensure all generated flashcards are in that language.
//   2. **Capture Key Points**: Identify main topics, concepts, and important information throughout the text.
//   3. **Logical Inference**: If sections of the text seem fragmented, attempt logical inferences based on context.
//   4. **Use Variety in Questions**: Create a mix of questions covering definitions, explanations, implications, and examples.
//   5. **Organize Logically**: Arrange flashcards in a logical order for a coherent flow of information.
//   6. **Contextualize Answers**: For each answer, provide concise yet contextually rich explanations.
//   7. **Focus on Core Ideas**: Emphasize memorable and practical points to help learners retain core ideas.

//   Text Content: ${chunk}
// ,
// `,
//     });

//             const generatedFlashcards = object.flashcards as Flashcard[];

//             allFlashcards = allFlashcards.concat(generatedFlashcards);
//         }


//         // Limit total flashcards to target count and log the final flashcard array
//         allFlashcards = allFlashcards.slice(0, targetFlashcardCount);

//         // Save flashcards and update user’s generation count
//         const savedDeck = await client.deck.create({
//             data: {
//                 title: generatedTitle,
//                 ownerId: userId,
//                 cards: {
//                     create: allFlashcards.map((flashcard) => ({
//                         question: flashcard.question,
//                         answer: flashcard.answer,
//                     })),
//                 },
//             },
//         });

//         // Increment generation count on success
//         await client.user.update({
//             where: { id: userId },
//             data: {
//                 generationsUsedThisMonth: {
//                     increment: 1,
//                 },
//             },
//         });

//         return NextResponse.json({
//             message: 'Flashcards generated successfully!',
//             deckId: savedDeck.id,
//         }, { status: 200 });

//     } catch (error: unknown) {
//         if (error instanceof Error) {
//           console.error("Error generating flashcards:", error.message);
//           return NextResponse.json(
//             { error: 'Failed to generate flashcards due to JSON parsing issues or insufficient content.' },
//             { status: 500 }
//           );
//         } else {
//           console.error("Unknown error generating flashcards:", error);
//           return NextResponse.json(
//             { error: 'Failed to generate flashcards due to JSON parsing issues or insufficient content.' },
//             { status: 500 }
//           );
//         }
//       }
// }


export const maxDuration = 30; // Maximum execution time in seconds (default: 10s, max: 900s)
export const dynamic = 'force-dynamic';


import { NextRequest, NextResponse } from "next/server";
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { generateObject, generateText } from 'ai';
import pdfParse from "pdf-parse";
import { auth } from "../../../../../auth";
import { client } from "@/lib/prisma";
import { aj } from "@/lib/arcjet";

// Flashcard Type
type Flashcard = {
    question: string;
    answer: string;
};

// Zod Schema
const flashcardSchema = z.object({
    flashcards: z.array(
        z.object({
            question: z.string(),
            answer: z.string(),
        })
    ),
});

// API Handler
export async function POST(req: NextRequest) {
    const startTime = Date.now(); // Log start time

    try {
        // Authentication
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

        // Fetch User Data
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

        // File Handling
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: "No files received." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const data = await pdfParse(buffer);

        const totalPages = data.numpages;
        if (totalPages > 100) {
            return NextResponse.json(
                { error: `The document has ${totalPages} pages, exceeding the limit of 100 pages.` },
                { status: 413 }
            );
        }

        const cleanText = data.text
            .replace(/\n/g, " ")
            .replace(/(\w+)-\s+(\w+)/g, "$1$2")
            .replace(/\s{2,}/g, " ");

        const wordCount = cleanText.split(/\s+/).length;
        if (wordCount > 10000) {
            return NextResponse.json(
                { error: `The document contains ${wordCount} words, exceeding the limit of 10,000 words.` },
                { status: 413 }
            );
        }

        console.log(`Word count: ${wordCount}`);

        // Generate Title
        const titleResponse = await generateText({
            model: openai('gpt-3.5-turbo'),
            prompt: `
            Create a short, engaging, and descriptive title for the following content. The title should:
            - Be concise and directly reflect the key topic or theme of the content.
            - Avoid unnecessary phrases like "flashcards," "summary," or similar.
            - Not include quotation marks or extra formatting.
            - Focus on capturing the essence of the content in a memorable way.

            Content: "${cleanText.slice(0, 1000)}..."`,
        });

        const generatedTitle = titleResponse.text.trim() || "Generated Flashcards";

        // Calculate Flashcards Count
        const targetFlashcardCount = Math.min(Math.max(Math.floor(wordCount / 100), 10), 50);

        console.log(`Target flashcard count: ${targetFlashcardCount}`);

        // Split Text into Chunks
        const chunkSize = 5000; // Reduced chunk size
        const chunks: string[] = [];
        for (let i = 0; i < cleanText.length; i += chunkSize) {
            chunks.push(cleanText.slice(i, i + chunkSize));
        }
        console.log(`Total chunks created: ${chunks.length}`);

        // Process Chunks in Parallel
        const chunkPromises = chunks.map(async (chunk) => {
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
            return object.flashcards as Flashcard[];
        });

        const chunkResults = await Promise.all(chunkPromises);

        // Combine Results
        let allFlashcards: Flashcard[] = [];
        chunkResults.forEach((result) => {
            allFlashcards = allFlashcards.concat(result);
        });

        // Limit Total Flashcards
        allFlashcards = allFlashcards.slice(0, targetFlashcardCount);

        // Save to Database with Bulk Insert
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

        // Update User's Generation Count
        await client.user.update({
            where: { id: userId },
            data: {
                generationsUsedThisMonth: {
                    increment: 1,
                },
            },
        });

        const endTime = Date.now(); // Log end time
        console.log(`Total processing time: ${endTime - startTime} ms`);

        return NextResponse.json({
            message: 'Flashcards generated successfully!',
            deckId: savedDeck.id,
        }, { status: 200 });

    } catch (error: unknown) {
        const endTime = Date.now();
        console.error("Error generating flashcards:", error);
        console.log(`Failed after: ${endTime - startTime} ms`);

        return NextResponse.json(
            { error: 'Failed to generate flashcards due to processing issues.' },
            { status: 500 }
        );
    }
}
