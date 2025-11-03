// app/api/save-note/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/prisma';
import { auth } from '../../../../auth';

export async function POST(req: NextRequest) {
  const { noteId, title, content, userId } = await req.json();
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const note = await client.note.upsert({
      where: { id: noteId },
      update: {
        title,
        content,
        updatedAt: new Date(),
      },
      create: {
        id: noteId,
        ownerId: userId,
        title,
        content,
      },
    });
    return NextResponse.json({ success: true, note });
  } catch (error: unknown) {
    // Check if the error is an instance of Error before accessing .message
    if (error instanceof Error) {
      console.error('Failed to save note with Prisma:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    // Fallback for unexpected error types
    console.error('An unexpected error occurred:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
