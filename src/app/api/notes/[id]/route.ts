import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/prisma';
import { auth } from '../../../../../auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const noteId = params.id;

  try {
    // Fetch the note by ID along with owner and chat messages
    const note = await client.note.findUnique({
      where: { id: noteId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        // messages: {
        //   select: {
        //     id: true,
        //     role: true,
        //     content: true,
        //     createdAt: true,
        //   },
        // },
      },
    });

    // Check if the note exists
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const isOwner = session?.user?.id === note.owner.id;

    // Access control based on `isPublic` and ownership
    if (!note.isPublic && !isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Prepare the response
    const response = {
      title: note.title,
      content: note.content,
      source: note.source, // Include source if it's part of the model
      isPublic: note.isPublic,
      isOwner: isOwner,
      owner: note.owner,
      // messages: note.messages, // Include messages in the response
    };

    // Return the note data with chat messages
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}
