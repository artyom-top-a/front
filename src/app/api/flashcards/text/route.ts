// import { openai } from '@ai-sdk/openai';
// import { NextRequest, NextResponse } from 'next/server';
// import { generateObject, generateText } from 'ai';
// import { z } from 'zod';
// import { auth } from '../../../../../auth';
// import { client } from '@/lib/prisma';


// type Flashcard = {
//   question: string;
//   answer: string;
// };

// // Zod schema for validating the request body
// const textSchema = z.object({
//   content: z.string().min(1), // Expecting non-empty text content
// });

// // Zod schema for flashcards structure
// const flashcardSchema = z.object({
//   flashcards: z.array(
//     z.object({
//       question: z.string(),
//       answer: z.string(),
//     })
//   ),
// });


// export async function POST(req: NextRequest) {
//   const session = await auth();
//   const user = session?.user;

//   if (!user || !user.id) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const userId: string = user.id;
//   const userRecord = await client.user.findUnique({
//     where: { id: userId },
//     select: { generations: true, generationsUsedThisMonth: true },
//   });

//   if (!userRecord) {
//     return NextResponse.json({ error: 'User not found' }, { status: 404 });
//   }

//   // Check if the user has exceeded the monthly generation limit
//   if (userRecord.generationsUsedThisMonth >= userRecord.generations) {
//     return NextResponse.json({ error: 'Generation limit exceeded' }, { status: 403 });
//   }


//   try {


//     const { content } = textSchema.parse(await req.json());

//     const titleResponse = await generateText({
//       model: openai('gpt-3.5-turbo'),
// prompt: `
//       Create a short, engaging, and descriptive title for the following content. The title should:
//       - Be concise and directly reflect the key topic or theme of the content.
//       - Avoid unnecessary phrases like "flashcards," "summary," or similar.
//       - Not include quotation marks or extra formatting.
//       - Focus on capturing the essence of the content in a memorable way.

//       Content: "${content.slice(0, 1000)}..."`,

//     });



//     const generatedTitle = titleResponse.text.trim() || "Generated Deck";

//     const wordCount = content.split(/\s+/).length;
//     const targetFlashcardCount = Math.min(Math.max(Math.floor(wordCount / 100), 10), 40);

//     let allFlashcards: Flashcard[] = [];
//     const chunkSize = content.length <= 5000 ? 2000 : Math.ceil(content.length / 5);
//     const chunks: string[] = [];
//     for (let i = 0; i < content.length; i += chunkSize) {
//       chunks.push(content.slice(i, i + chunkSize));
//     }

//     for (const chunk of chunks) {
//       const { object } = await generateObject({
//         model: openai('gpt-3.5-turbo'),
//         schema: flashcardSchema,
//         prompt: `
//         Create a set of comprehensive and detailed flashcards with questions and answers based on the following university-level lecture notes.
//         Each question should:
//         1. Focus on key concepts, definitions, and important details that are essential for understanding the subject matter.
//         2. Ask about both basic definitions and more complex ideas, encouraging deeper understanding of the topic.
//         3. Avoid asking trivial or overly obvious questions. Make sure each question helps a university student review key points or challenges their comprehension.
//         4. Ensure every major point, fact, or concept from the notes is covered without skipping any significant details. Use a structured approach so that no important content is missed.
//         5. Keep the questions relevant to the subject and logical, ensuring they make sense in the context of the notes.
//         6. The answers should be concise but informative, providing clear and accurate explanations for each question.

//         Lecture Notes: ${chunk}
//       `,
//       });
//       const generatedFlashcards = object.flashcards || [];
//       allFlashcards = allFlashcards.concat(generatedFlashcards);
//     }

//     allFlashcards = allFlashcards.slice(0, targetFlashcardCount);

//     const savedDeck = await client.deck.create({
//       data: {
//         title: generatedTitle,
//         ownerId: userId,
//         cards: {
//           create: allFlashcards.map((flashcard) => ({
//             question: flashcard.question,
//             answer: flashcard.answer,
//           })),
//         },
//       },
//     });

//     // Increment the generation count on success
//     await client.user.update({
//       where: { id: userId },
//       data: {
//         generationsUsedThisMonth: {
//           increment: 1,
//         },
//       },
//     });

//     // Return a simple test message to verify the API route works
//     return NextResponse.json({
//       message: "Flashcards generated successfully!",
//       deckId: savedDeck.id,
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Error testing API route:', error);
//     return NextResponse.json({ error: error }, { status: 500 });
//   }
// }


export const maxDuration = 30; // Maximum execution time in seconds (default: 10s, max: 900s)
export const dynamic = 'force-dynamic';

import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { auth } from '../../../../../auth';
import { client } from '@/lib/prisma';
import { aj } from '@/lib/arcjet';

// Flashcard type
type Flashcard = {
  question: string;
  answer: string;
};

// Zod schemas for validation
const textSchema = z.object({
  content: z.string().min(1), // Ensures text content is non-empty
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
  const startTime = Date.now(); // Track start time for debugging

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
    const { content } = textSchema.parse(await req.json());

    // Generate title
    const titleResponse = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: `
      Create a short, engaging, and descriptive title for the following content. The title should:
      - Be concise and directly reflect the key topic or theme of the content.
      - Avoid unnecessary phrases like "flashcards," "summary," or similar.
      - Not include quotation marks or extra formatting.
      - Focus on capturing the essence of the content in a memorable way.
      
      Content: "${content.slice(0, 1000)}..."`,
    });

    const generatedTitle = titleResponse.text.trim() || 'Generated Deck';

    // Calculate flashcard count based on content length
    const wordCount = content.split(/\s+/).length;
    const targetFlashcardCount = Math.min(Math.max(Math.floor(wordCount / 100), 10), 40);

    console.log(`Word count: ${wordCount}`);
    console.log(`Target flashcard count: ${targetFlashcardCount}`);

    // Split content into chunks dynamically
    const chunkSize = content.length <= 5000 ? 2000 : Math.ceil(content.length / 5);
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }

    console.log(`Total chunks created: ${chunks.length}`);

    // Process chunks in parallel
    const chunkPromises = chunks.map(async (chunk) => {
      const { object } = await generateObject({
        model: openai('gpt-3.5-turbo'),
        schema: flashcardSchema,
        prompt: `
         Create a set of comprehensive and detailed flashcards with questions and answers based on the following university-level lecture notes.
         Each question should:
         1. Focus on key concepts, definitions, and important details that are essential for understanding the subject matter.
         2. Ask about both basic definitions and more complex ideas, encouraging deeper understanding of the topic.
         3. Avoid asking trivial or overly obvious questions. Make sure each question helps a university student review key points or challenges their comprehension.
         4. Ensure every major point, fact, or concept from the notes is covered without skipping any significant details. Use a structured approach so that no important content is missed.
         5. Keep the questions relevant to the subject and logical, ensuring they make sense in the context of the notes.
         6. The answers should be concise but informative, providing clear and accurate explanations for each question.

         Lecture Notes: ${chunk}
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

    // Save to database with batch insertion
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

    // Increment user's generation count
    await client.user.update({
      where: { id: userId },
      data: {
        generationsUsedThisMonth: {
          increment: 1,
        },
      },
    });

    const endTime = Date.now();
    console.log(`Processing completed in ${endTime - startTime} ms`);

    // Return success response
    return NextResponse.json({
      message: 'Flashcards generated successfully!',
      deckId: savedDeck.id,
    }, { status: 200 });

  } catch (error) {
    const endTime = Date.now();
    console.error('Error generating flashcards:', error);
    console.log(`Failed after ${endTime - startTime} ms`);

    return NextResponse.json(
      { error: 'Failed to generate flashcards due to processing issues.' },
      { status: 500 }
    );
  }
}
