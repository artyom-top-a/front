import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/prisma';
import { auth } from '../../../../../auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const deckId = params.id;

  try {
    // Fetch the deck by ID
    const deck = await client.deck.findUnique({
      where: { id: deckId },
      include: {
        cards: {
          orderBy: { score: 'asc' }, // Order cards by their score
        },
      },
    });

    // Check if the deck exists
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Access control: check if the deck is public or if the user is the owner
    const isOwner = session && deck.ownerId === session.user?.id;
    if (!deck.isPublic && !isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Return the deck data with ownership status if access conditions are met
    return NextResponse.json({ deck, isOwner }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching deck:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("Unknown error fetching deck:", error);
      return NextResponse.json({ error: "Failed to fetch deck" }, { status: 500 });
    }
  }
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const deckId = params.id;
  const { title, flashcards } = await req.json();

  try {
    // Update the deck title and its cards in one request
    await client.deck.update({
      where: { id: deckId },
      data: {
        title,
        cards: {
          deleteMany: {}, // Optional: delete existing cards if needed
          create: flashcards.map((card: { question: string; answer: string; score?: number }) => ({
            question: card.question,
            answer: card.answer,
            score: card.score || 0, 
          })),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 });
  }
}


export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id: deckId } = params

  try {
    await client.deck.delete({
      where: { id: deckId },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deck:', error)
    return NextResponse.json({ error: 'Failed to delete deck' }, { status: 500 })
  }
}