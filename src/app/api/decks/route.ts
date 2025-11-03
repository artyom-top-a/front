import { client } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Fetch decks for the user
    const decks = await client.deck.findMany({
      where: {
        owner: {
          email: userEmail,
        },
      },
      include: {
        _count: {
          select: { cards: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map each deck to include the card count
    const decksWithCardCount = decks.map((deck) => ({
        ...deck,
        cardsCount: deck._count.cards,
      }));

    return NextResponse.json({ decks: decksWithCardCount }, { status: 200 });
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



