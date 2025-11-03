"use server"

import { client } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { useCurrentUser } from '../hooks/user';
import { auth } from '../../../auth';

interface Flashcard {
  question: string;
  answer: string;
}

export async function createDeckWithCards(title: string, flashcards: Flashcard[]) {
  try {
    
    // const { session } = useCurrentUser();
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'User is not authenticated' }, { status: 401 });
    }

    // Use the authenticated user's ID as the deck owner
    const ownerId = session.user.id;

    const deck = await client.deck.create({
      data: {
        title,
        ownerId,
        cards: {
          create: flashcards.map((card) => ({
            question: card.question,
            answer: card.answer,
          })),
        },
      },
    });

    revalidatePath('/');

    return NextResponse.json(deck);
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 });
  }
}



export async function getCardsByDeckId(deckId: string) {
  // const { session } = useCurrentUser();
  const session = await auth();

  if (!session?.user?.email) throw new Error('Unauthorized');

  // Verify ownership
  const deck = await client.deck.findFirst({
    where: {
      id: deckId,
      owner: { email: session.user.email },
    },
  });

  if (!deck) throw new Error('Deck not found or not authorized');

  const cards = await client.card.findMany({
    where: { deckId },
    orderBy: { createdAt: 'asc' },
  });

  return cards;
}

export async function updateCard(
  cardId: string,
  data: { question?: string; answer?: string }
) {
  // const { session } = useCurrentUser();
  const session = await auth();
  if (!session?.user?.email) throw new Error('Unauthorized');

  // Verify ownership
  const card = await client.card.findFirst({
    where: {
      id: cardId,
      deck: {
        owner: { email: session.user.email },
      },
    },
  });

  if (!card) throw new Error('Card not found or not authorized');

  const updatedCard = await client.card.update({
    where: { id: cardId },
    data,
  });

  return updatedCard;
}

export async function deleteCard(cardId: string) {
  // const { session } = useCurrentUser();
  const session = await auth();
  if (!session?.user?.email) throw new Error('Unauthorized');

  // Verify ownership
  const card = await client.card.findFirst({
    where: {
      id: cardId,
      deck: {
        owner: { email: session.user.email },
      },
    },
  });

  if (!card) throw new Error('Card not found or not authorized');

  await client.card.delete({
    where: { id: cardId },
  });

  return { success: true };
}



export async function makeDeckPublic(deckId: string) {
  // Get the current user's session
  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    throw new Error("User is not authenticated");
  }

  try {
    // Verify the note belongs to the current user
    const deck = await client.deck.findFirst({
      where: {
        id: deckId,
        owner: { email: session.user.email },
      },
    });

    if (!deck) {
      throw new Error("Deck not found or not authorized");
    }

    // Update the note's public status
    const updatedDeck = await client.deck.update({
      where: { id: deckId },
      data: { isPublic: true },
    });

    return updatedDeck;
  } catch (error) {
    console.error("Error making deck public:", error);
    throw new Error("Failed to update deck");
  }
}