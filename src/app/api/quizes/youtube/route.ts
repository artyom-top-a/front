import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { YoutubeTranscript } from 'youtube-transcript';
import { generateObject } from 'ai';

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

// Zod schema for validating the request body
const youtubeSchema = z.object({
  url: z.string().url(), // Expecting a valid YouTube video URL
});

// Zod schema for quiz structure
const quizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const { url } = youtubeSchema.parse(await req.json());

    const transcript = await YoutubeTranscript.fetchTranscript(url);

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: 'Could not retrieve YouTube transcript' }, { status: 400 });
    }

    const videoContent = transcript.map((section) => section.text).join(' ');

    const wordCount = videoContent.split(/\s+/).length;
    const targetQuizCount = Math.min(Math.max(Math.floor(wordCount / 100), 10), 40);

    let allQuestions: QuizQuestion[] = [];

    // Determine chunk size based on content length
    const chunkSize = videoContent.length <= 5000 ? 2000 : Math.ceil(videoContent.length / 5);

    // Divide the content into chunks
    const chunks: string[] = [];
    for (let i = 0; i < videoContent.length; i += chunkSize) {
      chunks.push(videoContent.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      const { object } = await generateObject({
        model: openai('gpt-3.5-turbo'),
        schema: quizSchema,
        prompt: `
  First, identify the language of the following text, and then create multiple-choice quiz questions exclusively in that language. For each quiz question, follow these instructions:

  1. Each question should focus on core ideas, key terms, or relevant details from the content.
  2. Provide four answer options per question. Ensure that one option is clearly correct based on the content, and the other three options (distractors) are plausible but incorrect.
  3. Structure the questions in a logical order that mirrors the content's flow, helping the user review systematically.
  4. Avoid overly simple questions and trivial distractors; ensure each question aids in retention and comprehension.
  5. Make sure the correct answer is fully accurate, with each option written out without ellipses or abbreviations.

  Transcript Content: ${chunk}
`,
      });

      const generatedQuestions = object.questions || [];
      allQuestions = allQuestions.concat(generatedQuestions);
    }

    allQuestions = allQuestions.slice(0, targetQuizCount);

    return NextResponse.json(
      {
        message: 'Quiz questions generated successfully!',
        questions: allQuestions,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error generating quiz questions:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error('Unknown error generating quiz questions:', error);
      return NextResponse.json({ error: 'Failed to generate quiz questions' }, { status: 500 });
    }
  }
}
