import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import { auth } from "../../../../auth";
import { client } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
    })
  ),
  noteContent: z.string().min(1),
  noteId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requestBody = await req.json();
    const { messages, noteContent, noteId } = chatSchema.parse(requestBody);

    const userMessage = messages[messages.length - 1];
    if (noteId) {
      // Save the user message to the database
      await client.message.create({
        data: {
          role: userMessage.role,
          content: userMessage.content,
          noteId,
        },
      });
    }

    // Improved system prompt
    //     const systemPrompt = `
    // You are an AI assistant tasked with helping users based on provided content. The content may come from various sources such as video transcripts, PDFs, raw text, or web links. Please follow these instructions:

    // 1. **Language Detection**:
    //    - Detect the language of the content.
    //    - Respond in the same language as the content.

    // 2. **Content Analysis**:
    //    - Identify the type of content (video transcript, PDF text, raw text, or web link).
    //    - Adjust your response style based on the type:
    //      - For **video transcripts**, focus on summarizing or answering based on spoken context.
    //      - For **PDF text**, prioritize structured and factual responses.
    //      - For **web links**, provide insights or overviews based on extracted content.
    //      - For **raw text**, respond with clarity and precision.

    // 3. **Response Style**:
    //    - Be concise and context-aware.
    //    - Use technical or formal language for academic or professional content.
    //    - Be friendly and approachable for casual content.

    // 4. **User Guidance**:
    //    - If the user asks for a summary, provide a concise overview of the content.
    //    - If the user asks a specific question, focus on answering using the most relevant sections of the content.
    //    - If the content is unclear or incomplete, ask the user for clarification.

    // Content Provided:
    // ${noteContent}

    // Respond to the user's query based on this content.
    // `;

    const systemPrompt = `
You are an AI assistant helping users based on provided content (e.g., video transcripts, PDFs, or text).

Instructions:
- Detect and use the language of the content.
- Adjust tone based on type: use formal style for academic, friendly for casual.
- For summaries: give a concise overview.
- For questions: answer using the most relevant content.
- If content is unclear, ask for clarification.

Content:
${noteContent}
`;




    const { textStream } = await streamText({
      model: openai("gpt-3.5-turbo"),
      messages: [
        {
          role: "system",
          content: systemPrompt.trim(),
        },
        ...messages,
      ],
    });

    let assistantResponse = "";

    const streamResponse = new ReadableStream({
      async start(controller) {
        for await (const textPart of textStream) {
          assistantResponse += textPart;
          controller.enqueue(new TextEncoder().encode(textPart));
        }
        controller.close();
      },
    });

    if (noteId) {
      // Save the assistant response to the database
      await client.message.create({
        data: {
          role: "assistant",
          content: assistantResponse,
          noteId,
        },
      });
    }

    return new NextResponse(streamResponse, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in chat route:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("Unknown error in chat route:", error);
      return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
  }
}
