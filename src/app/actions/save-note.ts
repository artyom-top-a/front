"use server"

import { client } from "@/lib/prisma";
import { JSONContent } from "novel";


export async function saveNoteToDB(noteId: string, title: string, content: JSONContent, userId: string) {
  console.log(noteId, title, content, userId)
  try {
    const note = await client.note.upsert({
      where: { id: noteId }, // Update note if it exists
      update: {
        title,
        content,
        updatedAt: new Date(),
      },
      create: {
        id: noteId,
        ownerId: userId,
        title,
        content
      },
    });

    console.log('Note saved:', note);
  } catch (error) {
    console.error('Failed to save note with Prisma:', error);
  }
}
