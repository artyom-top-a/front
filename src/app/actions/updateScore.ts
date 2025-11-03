'use server';

import { client } from '@/lib/prisma';

interface ScoreUpdate {
  id: string;
  score: number;
}

// Example data you provided:
// const newScores: ScoreUpdate[] = [
//   { "id": "bb07206c-7303-4860-96b0-6c85c9562bf3", "score": 0 },
//   { "id": "27e11f3d-889b-464d-9e37-5900c839f1af", "score": 1 },
//   { "id": "399dcf34-14ac-4cd9-bb3b-1a1dbf843200", "score": 1 },
//   { "id": "1897485e-094a-4229-a016-cf49a2b41ce1", "score": 1 },
//   { "id": "d220b8d3-4c69-4cd0-a457-3f70765b89d0", "score": 1 },
//   { "id": "6eaee074-66e5-42b6-856d-6e2fc6eab2d5", "score": 3 },
// ];

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
