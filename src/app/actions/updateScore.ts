'use server';

import { client } from '@/lib/prisma';

interface ScoreUpdate {
  id: string;
  score: number;
}


export async function updateScores(deckId: string, newScores: ScoreUpdate[]) {
  try {
    console.log("Updating scores for deck:", deckId);
    console.log("New Scores:", newScores);

    // If there's nothing to update, just return the current card state
    if (newScores.length === 0) {
      const existingCards = await client.card.findMany({
        where: { deckId },
        orderBy: { score: 'asc' },
      });
      return { success: true, updatedCards: existingCards };
    }

    // Construct nested update operations for all cards that need their scores updated
    const updateData = newScores.map(({ id, score }) => ({
      where: { id },
      data: { score },
    }));

    // Update all cards via the deck relation
    const updatedDeck = await client.deck.update({
      where: { id: deckId },
      data: {
        cards: {
          update: updateData,
        },
      },
      include: { cards: true },
    });

    // Sort the updated cards by their score
    const updatedCards = updatedDeck.cards.sort((a, b) => a.score - b.score);

    console.log("Updated cards:", updatedCards);

    return { success: true, updatedCards };
  } catch (error) {
    console.error('Error updating scores:', error);
    return { error: 'Failed to update scores' };
  }
}
