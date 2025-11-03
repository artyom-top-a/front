"use client";

import { useEffect, useState } from "react";
import { ContentLayout } from "@/components/global/content-layout";
import { PackageOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Deck from "@/components/global/deck";
import ShimmerCard from "@/components/shimmer/shimmer-card";
import GenerateDeckDialog from "@/components/dialogs/create-deck-dialog";

interface DeckType {
  id: string;
  title: string;
  cardsCount: number;
}

const FlashCardsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [decks, setDecks] = useState<DeckType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch decks data
  useEffect(() => {
    async function fetchDecks() {
      try {
        const response = await fetch("/api/decks");
        const data = await response.json();
        if (response.ok && data.decks) {
          setDecks(data.decks);
        } else {
          console.error("Failed to fetch decks:", data.error);
        }
      } catch (error) {
        console.error("Error fetching decks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDecks();
  }, []);

  const handleDeleteDeck = (deckId: string) => {
    setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
  };


  // Filter decks based on search query
  const filteredDecks = decks.filter((deck) =>
    deck.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ContentLayout title="Flash Cards" className="!py-0">
      <div className="w-full flex flex-row items-center justify-between pt-8">
        <div className="flex flex-row items-center justify-center space-x-2.5">
          <div className="text-lg md:text-xl font-bold text-primary">Your Decks</div>
          <div className="text-base font-medium bg-[#F4F0FF] size-7 rounded-md text-primary flex items-center justify-center">
            {decks.length}
          </div>
        </div>
        <div className="hidden md:block">
          <GenerateDeckDialog />
        </div>
      </div>

      {/* Sticky Search Input */}
      <div className="sticky top-0 z-10 w-full py-4 bg-white dark:bg-black">
        <div className="flex flex-row items-center w-full">
          <Search strokeWidth={2} className="size-5 md:size-[22px] text-primary/50" />
          <Input
            className="ml-2 p-0 text-sm md:text-[15px] font-medium border-none w-full text-primary placeholder:text-primary/30"
            placeholder="Search decks by title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="w-full mt-2 bg-white dark:bg-black grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 pb-24 md:pb-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <ShimmerCard key={index} />
          ))}
        </div>
      ) : decks.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center h-full">
          <PackageOpen className="size-9 text-stone-300 dark:text-stone-600" />
          <div className="mt-4 text-primary/50 text-lg">You have no decks yet. Start by creating a new deck!</div>
        </div>
      ) : filteredDecks.length > 0 ? (
        <div className="w-full mt-2 bg-white dark:bg-black grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 pb-24 md:pb-6">
          {filteredDecks.map((deck, index) => (
            <Deck
              key={index}
              id={deck.id}
              title={deck.title}
              cardsCount={deck.cardsCount}
              onDelete={handleDeleteDeck}
            />
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center h-full">
          <PackageOpen className="size-7 text-stone-300 dark:text-stone-600" />
          <div className="mt-4 text-primary/50 text-base">Oops! No decks found</div>
        </div>
      )}

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 md:hidden">
        <GenerateDeckDialog />
      </div>
    </ContentLayout>
  );
};

export default FlashCardsPage;
