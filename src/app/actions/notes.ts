"use server"

// app/actions/notes.ts
import { client } from '@/lib/prisma';
import { auth } from '../../../auth';

type Content = string | object;

export async function createNote(
  userEmail: string,
  title: string,
  content: Content,
  isPublic: boolean = false
) {
  if (!userEmail) throw new Error('Unauthorized');

  console.log('content:', content);

  try {
    // Log before the create operation
    console.log('Attempting to create note with title:', title);

    const note = await client.note.create({
      data: {
        title,
        content,
        isPublic,
        owner: {
          connect: { email: userEmail },
        },
      },
    });


    // Check if the note was created successfully
    if (note) {
      console.log('Note created successfully:', note);
    } else {
      console.warn('Note creation did not return a valid response.');
    }

    return note;

  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}



export async function getNotes(userEmail: string) {
  if (!userEmail) throw new Error('Unauthorized');

  const notes = await client.note.findMany({
    where: {
      owner: {
        email: userEmail,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return notes;
}

export async function getNoteById(userEmail: string, noteId: string) {
  if (!userEmail) throw new Error('Unauthorized');

  const note = await client.note.findFirst({
    where: {
      id: noteId,
      owner: {
        email: userEmail,
      },
    },
  });

  if (!note) throw new Error('Note not found');

  return note;
}

export async function updateNote(
  userEmail: string,
  noteId: string,
  data: { title?: string; content?: string | object; isPublic?: boolean }
) {
  if (!userEmail) throw new Error('Unauthorized');

  const updatedNote = await client.note.updateMany({
    where: {
      id: noteId,
      owner: {
        email: userEmail,
      },
    },
    data,
  });

  if (updatedNote.count === 0) throw new Error('Note not found or not authorized');

  return updatedNote;
}

export async function deleteNote(noteId: string) {
  // if (!userEmail) throw new Error('Unauthorized');

  const deletedNote = await client.note.deleteMany({
    where: {
      id: noteId,
      // owner: {
      //   email: userEmail,
      // },
    },
  });

  if (deletedNote.count === 0) throw new Error('Note not found or not authorized');

  return { success: true };
}


export async function makeNotePublic(noteId: string) {
  // Get the current user's session
  const session = await auth()

  if (!session || !session.user || !session.user.email) {
    throw new Error("User is not authenticated");
  }

  try {
    // Verify the note belongs to the current user
    const note = await client.note.findFirst({
      where: {
        id: noteId,
        owner: { email: session.user.email },
      },
    });

    if (!note) {
      throw new Error("Note not found or not authorized");
    }

    // Update the note's public status
    const updatedNote = await client.note.update({
      where: { id: noteId },
      data: { isPublic: true },
    });

    return updatedNote;
  } catch (error) {
    console.error("Error making note public:", error);
    throw new Error("Failed to update note");
  }
}