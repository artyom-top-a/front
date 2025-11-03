import { client } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const getNotesSchema = z.object({
  userEmail: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail } = getNotesSchema.parse(body);

    // Fetch notes for the user
    const notes = await client.note.findMany({
      where: {
        owner: {
          email: userEmail,
        },
      },
      orderBy: {
        createdAt: 'desc', // Adjust the order if needed
      },
    });

    return NextResponse.json({ notes }, { status: 200 });
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
        { error: 'Failed to generate summary' },
        { status: 500 }
      );
    }
  }

}
