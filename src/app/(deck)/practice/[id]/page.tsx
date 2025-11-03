"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Flashcard from "@/components/global/flash-card";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { makeDeckPublic } from "@/app/actions/decks";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share, RedoDot, X, Upload, ArrowUpFromLine, ArrowDownToDot } from "lucide-react";
import { updateScores } from "@/app/actions/updateScore";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FlashcardData {
  id: string;
  question: string;
  answer: string;
  remembered?: boolean;
  score: number;
}

const DeckPracticePage = () => {
  const params = useParams();
  const deckId = params.id as string;

  const { toast } = useToast();

  const [deckTitle, setDeckTitle] = useState<string>("");
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(false);

  const [shareLink, setShareLink] = useState<string | null>(null);

  const [currentBatch, setCurrentBatch] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0); // Added correctCount

  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationDirection, setAnimationDirection] = useState<
    "left" | "right"
  >("right");
  const [activeButton, setActiveButton] = useState<"left" | "right" | null>(
    null
  );
  const [isAnswerFirst, setIsAnswerFirst] = useState<boolean>(false);
  const [fadeOut, setFadeOut] = useState<boolean>(false);

  const router = useRouter();

  const currentCard = currentBatch[currentIndex];
  const progress = currentBatch.length
    ? ((currentIndex + 1) / currentBatch.length) * 100
    : 0;

  useEffect(() => {
    async function fetchDeckData() {
      try {
        const response = await fetch(`/api/decks/${deckId}`);
        const data = await response.json();

        if (response.ok && data.deck) {
          setDeckTitle(data.deck.title)

          const realFlashcards = data.deck.cards.map((card: FlashcardData) => ({
            id: card.id,
            question: card.question,
            answer: card.answer,
            remembered: false,
            // score: 0,
            score: card.score,
          }));

          setFlashcards(realFlashcards);

          setIsOwner(data.isOwner === true);
          setIsPublic(data.deck.isPublic === true);

          console.log("API Response:", data);
          console.log("Deck isPublic:", data.deck?.isPublic);

          setLoading(false);

          // Set the initial batch (first 10 cards with lowest score)
          const sortedFlashcards = [...realFlashcards].sort(
            (a, b) => a.score - b.score
          );
          setCurrentBatch(sortedFlashcards.slice(0, 10));
        } else {
          console.error("Error loading deck:", data.error);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching deck data:", error);
        setLoading(false);
      }
    }

    fetchDeckData();
  }, [deckId]);


  // Updated handleRemember with animation direction and correctCount
  const handleRemember = useCallback(() => {
    if (isAnimating || !currentCard) return;

    setAnimationDirection("right"); // Set animation direction to right

    setFlashcards((prevFlashcards) =>
      prevFlashcards.map((card) =>
        card.id === currentCard.id
          ? {
            ...card,
            remembered: true,
            score: card.score + 1,
          }
          : card
      )
    );

    setCorrectCount((prevCount) => prevCount + 1); // Increment correctCount

    if (currentIndex === currentBatch.length - 1) {
      setShowSummary(true);
    } else {
      handleNext();
    }
  }, [isAnimating, currentCard, currentIndex, currentBatch.length]);

  const handleNotRemember = useCallback(() => {
    if (isAnimating || !currentCard) return;

    setAnimationDirection("left");

    setFlashcards((prevFlashcards) =>
      prevFlashcards.map((card) =>
        card.id === currentCard.id
          ? {
            ...card,
            remembered: false, // No change to score
          }
          : card
      )
    );

    if (currentIndex === currentBatch.length - 1) {
      setShowSummary(true);
    } else {
      handleNext();
    }
  }, [isAnimating, currentCard, currentIndex, currentBatch.length]);

  // Modified handleNext to use the existing animationDirection
  const handleNext = useCallback(() => {
    if (isAnimating || currentIndex >= currentBatch.length - 1) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setIsAnimating(false);
    }, 500);
  }, [isAnimating, currentIndex, currentBatch.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSummary) return;
      if (e.key === "ArrowRight") {
        setActiveButton("right");
        handleRemember();
        setTimeout(() => setActiveButton(null), 150);
      } else if (e.key === "ArrowLeft") {
        setActiveButton("left");
        handleNotRemember();
        setTimeout(() => setActiveButton(null), 150);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleRemember, handleNotRemember]);

  const goBackWithAnimation = () => {
    setFadeOut(true);
    setTimeout(() => {
      router.back();
    }, 300);
  };

  const toggleMode = () => {
    setIsAnswerFirst(!isAnswerFirst);
  };

  const proceedToNextBatch = async () => {
    try {
      const scoresToUpdate = flashcards
        .filter((card) => card.remembered)
        .map(({ id, score }) => ({ id, score }));

      console.log("Scores to update:", scoresToUpdate);

      const result = await updateScores(deckId, scoresToUpdate);

      if (result.error) {
        console.error('Failed to update scores:', result.error);
      } else {
        console.log('Scores updated successfully');
      }
    } catch (error) {
      console.error('Error updating scores:', error);
    }

    // Re-sort the flashcards by updated scores
    const sortedFlashcards = [...flashcards].sort((a, b) => a.score - b.score);

    // Select the next 10 cards
    setCurrentBatch(sortedFlashcards.slice(0, 10));
    setCurrentIndex(0);
    setShowSummary(false);
    setCorrectCount(0); // Reset correctCount for the new batch
  };


  const handleMakePublicAndShare = async () => {
    try {
      await makeDeckPublic(deckId);

      const link = `${window.location.origin}/practice/${deckId}`;
      setShareLink(link);
      navigator.clipboard.writeText(link);
      console.log("Note is now public, and link copied to clipboard!");
      setIsPublic(true);
      toast({
        title: "Deck Shared Successfully",
        description: "Your deck is now public. The share link has been copied to your clipboard!",
      })
    } catch (error) {
      console.error("Error making note public:", error);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      console.log("Link copied to clipboard!");
      toast({
        title: "Link Copied",
        description: "The link to this deck has been copied to your clipboard.",
        // action: (
        //   <ToastAction altText="Close">Close</ToastAction>
        // ),
      })
    }
  };


  const handleExportToAnki = () => {
    // 1. Build CSV content, with proper quoting
    const csvLines = flashcards.map(card => {
      const q = card.question.replace(/"/g, '""')
      const a = card.answer.replace(/"/g, '""')
      return `"${q}","${a}"`
    })
    const csvContent = csvLines.join('\r\n')

    // 2. Create a downloadable blob
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    })
    const url = URL.createObjectURL(blob)

    // 3. Trigger the download
    const link = document.createElement('a')
    link.href = url
    link.download = `${deckTitle || 'flashcards'}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }


  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={"animate-spin stroke-[#6127FF]"}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    );
  }


  if (!isOwner && !isPublic) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="text-3xl mb-2">🔒</div>
        <div className="text-2xl font-bold mb-1 text-primary">Access Denied</div>
        <div className="text-primary/70">You do not have permission to view this deck.</div>
        <Button
          className="mt-5 h-12 font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white px-6 rounded-lg"
          onClick={() => router.push("/home")}
        >
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>

      <div
        className={`overflow-hidden w-full h-[100dvh] flex flex-col px-5 md:px-8 pb-12 transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"
          }`}
      >
        {/* Header */}
        <div className="flex flex-row items-center justify-between py-8 z-50 relative">
          <Link href="/home" className="flex items-center gap-3">
            {/* <div className="rounded-sm bg-[#6127FF] flex items-center justify-center size-7 mr-1">
            <div className="size-4 rounded-full bg-white dark:bg-black" />
          </div> */}
            <Image
              src="/logo.png"
              alt='logo'
              width={28}
              height={28}
            />
            <div className="text-base font-semibold text-primary">GStudy</div>
          </Link>

          <div className="hidden absolute left-1/2 transform -translate-x-1/2 md:flex flex-col items-center text-primary gap-2.5">
            <div className="text-sm font-semibold">{deckTitle}</div>
            <Progress value={progress} className="w-[300px] h-1.5" />
          </div>

          <div className="flex flex-row items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={`z-50 text-base h-auto px-2 border rounded-md transition 
                    ${isAnswerFirst 
                      ? 'bg-black text-white hover:bg-black/90' 
                      : 'bg-gray-50 text-black/70 dark:bg-accent dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900/80'
                    }`}
                  
                  onClick={toggleMode}
                >
                  <RedoDot size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Flip Mode</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleExportToAnki} className={`z-50 text-base h-auto px-2 bg-gray-50 dark:bg-accent border dark:border-themeGray text-black/70 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900/80 transition`}>
                  <ArrowDownToDot className='size-5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export to Anki</TooltipContent>
            </Tooltip>

            <Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button variant="outline" className='z-50 text-base h-auto size-[38px] p-0 bg-gray-50 dark:bg-accent border dark:border-themeGray text-black/70 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900/80 transition' onClick={() => { }}>
                      <Share size={16} />
                      {/* Share */}
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Share Deck</TooltipContent>
              </Tooltip>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isPublic ? "Share Deck" : "Make Deck Public"}
                  </DialogTitle>
                  <DialogDescription>
                    {isPublic
                      ? "This deck is public. Copy the link below to share it with others."
                      : "To enable sharing, this deck must be made public. Once public, anyone with the link can access it."}
                  </DialogDescription>
                </DialogHeader>
                {isPublic &&
                  <div className="flex items-center mb-1 space-x-2 relative">
                    <Input
                      value={shareLink || ""}
                      readOnly
                      className="flex-1 pr-10"
                    />
                    <div
                      onClick={handleCopyLink}
                      className="absolute right-3 cursor-pointer hover:text-black"
                      aria-label="Copy Link"
                    >
                      <Copy size={16} className="text-gray-600 hover:text-gray-800" />
                    </div>
                  </div>
                }
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                  {isPublic ? (
                    <DialogClose asChild>
                      <Button
                        onClick={handleCopyLink}
                        className="bg-[#6127FF] hover:bg-[#6127FF]/80 text-white"
                      >
                        Copy Link
                      </Button>
                    </DialogClose>
                  ) : (
                    <DialogClose asChild>
                      <Button
                        onClick={handleMakePublicAndShare}
                        className="bg-[#6127FF] hover:bg-[#6127FF]/80 text-white"
                      >
                        Make Public and Copy Link
                      </Button>
                    </DialogClose>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Link href={"/home"}>
              <Button
                className={`z-50 text-base h-auto px-2 bg-gray-50 dark:bg-accent border dark:border-themeGray text-black/70 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900/80 transition`}
              >
                <X size={20} />
              </Button></Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {showSummary ? (
            // Summary UI with smoother animation
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${showSummary ? "opacity-100" : "opacity-0"
                }`}
            >
              <div className="text-3xl mb-2"> ✅</div>
              <div className="text-2xl font-bold mb-1 text-primary">Batch Complete!</div>
              <div className="text-primary/70">
                You answered {correctCount} out of {currentBatch.length} cards
                correctly.
              </div>
              <Button className="mt-5 h-12 font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white px-6 rounded-lg" onClick={proceedToNextBatch}>
                Continue to Next Batch
              </Button>
            </div>
          ) : (
            // Flashcard UI
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${showSummary ? "opacity-0" : "opacity-100"
                }`}
            >
              <div
                className={`flex w-full h-full items-center justify-center transition-all duration-500 transform ${isAnimating
                  ? animationDirection === "right"
                    ? "translate-x-[100%] opacity-0"
                    : "-translate-x-[100%] opacity-0"
                  : "translate-x-0 opacity-100"
                  }`}
                key={currentIndex}
              >
                <Flashcard
                  question={currentCard.question}
                  answer={currentCard.answer}
                  startFlipped={isAnswerFirst}
                />
              </div>

              <div className="flex space-x-3 md:space-x-4 mt-14 md:mt-8 w-full md:w-auto">
                <Button
                  className={`z-50 w-full md:w-48 text-sm md:text-base px-2 md:px-6 py-6 bg-[#FBFBFB] dark:bg-accent border dark:border-themeGray text-black/70 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900/80 transition ${activeButton === "left"
                    ? "bg-gray-100 dark:bg-zinc-900/80"
                    : ""
                    }`}
                  onClick={handleNotRemember}
                >
                  <span className="mr-3 text-xl md:text-2xl">🤷</span>
                  Not sure
                </Button>
                <Button
                  className={`z-50 w-full md:w-48 text-sm md:text-base px-2 md:px-6 py-6 bg-[#FBFBFB] dark:bg-accent border dark:border-themeGray text-black/70 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900/80 transition ${activeButton === "right"
                    ? "bg-gray-100 dark:bg-zinc-900/80"
                    : ""
                    }`}
                  onClick={handleRemember}
                >
                  <span className="mr-3 text-xl md:text-2xl">🧠</span>
                  Remember
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DeckPracticePage;




// "use client";

// import { useEffect, useState, useCallback, useRef } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import Flashcard from "@/components/global/flash-card";
// import Link from "next/link";
// import { Progress } from "@/components/ui/progress";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogFooter,
//   DialogTitle,
//   DialogDescription,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { Input } from '@/components/ui/input';
// import { makeDeckPublic } from "@/app/actions/decks";
// import { useToast } from "@/hooks/use-toast";
// import { Copy, Share, RedoDot, X } from "lucide-react";
// import { updateScores } from "@/app/actions/updateScore";
// import Image from "next/image";

// interface FlashcardData {
//   id: string;
//   question: string;
//   answer: string;
//   remembered?: boolean;
//   score: number;
// }

// const DeckPracticePage = () => {
//   const params = useParams();
//   const deckId = params.id as string;

//   const { toast } = useToast();

//   const [deckTitle, setDeckTitle] = useState<string>("");
//   const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   const [isOwner, setIsOwner] = useState<boolean>(false);
//   const [isPublic, setIsPublic] = useState<boolean>(false);
//   const [shareLink, setShareLink] = useState<string | null>(null);

//   const [currentBatch, setCurrentBatch] = useState<FlashcardData[]>([]);
//   const [currentIndex, setCurrentIndex] = useState<number>(0);
//   const [showSummary, setShowSummary] = useState<boolean>(false);
//   const [correctCount, setCorrectCount] = useState<number>(0);

//   // Existing animation states
//   const [isAnimating, setIsAnimating] = useState<boolean>(false);
//   const [animationDirection, setAnimationDirection] = useState<"left" | "right">("right");
//   const [activeButton, setActiveButton] = useState<"left" | "right" | null>(null);
//   const [isAnswerFirst, setIsAnswerFirst] = useState<boolean>(false);
//   const [fadeOut, setFadeOut] = useState<boolean>(false);

//   // Mobile swipe states
//   const [swipeOffset, setSwipeOffset] = useState<number>(0);   // how far the user has swiped
//   const [isSwiping, setIsSwiping] = useState<boolean>(false);  // whether user is in the middle of a swipe
//   const touchStartX = useRef<number>(0);                       // store initial touch position

//   const router = useRouter();

//   const currentCard = currentBatch[currentIndex];
//   const progress = currentBatch.length
//     ? ((currentIndex + 1) / currentBatch.length) * 100
//     : 0;

//   useEffect(() => {
//     async function fetchDeckData() {
//       try {
//         const response = await fetch(`/api/decks/${deckId}`);
//         const data = await response.json();

//         if (response.ok && data.deck) {
//           setDeckTitle(data.deck.title);

//           const realFlashcards = data.deck.cards.map((card: FlashcardData) => ({
//             id: card.id,
//             question: card.question,
//             answer: card.answer,
//             remembered: false,
//             score: card.score,
//           }));

//           setFlashcards(realFlashcards);

//           setIsOwner(data.isOwner === true);
//           setIsPublic(data.deck.isPublic === true);

//           setLoading(false);

//           // Set the initial batch (first 10 cards with the lowest score)
//           const sortedFlashcards = [...realFlashcards].sort((a, b) => a.score - b.score);
//           setCurrentBatch(sortedFlashcards.slice(0, 10));
//         } else {
//           console.error("Error loading deck:", data.error);
//           setLoading(false);
//         }
//       } catch (error) {
//         console.error("Error fetching deck data:", error);
//         setLoading(false);
//       }
//     }

//     fetchDeckData();
//   }, [deckId]);

//   // Callback for "Remember" action
//   const handleRemember = useCallback(() => {
//     if (isAnimating || !currentCard) return;

//     setAnimationDirection("right");
//     // Increase the score of the remembered card
//     setFlashcards((prevFlashcards) =>
//       prevFlashcards.map((card) =>
//         card.id === currentCard.id
//           ? { ...card, remembered: true, score: card.score + 1 }
//           : card
//       )
//     );

//     setCorrectCount((prevCount) => prevCount + 1);

//     if (currentIndex === currentBatch.length - 1) {
//       setShowSummary(true);
//     } else {
//       handleNext();
//     }
//   }, [isAnimating, currentCard, currentIndex, currentBatch.length]);

//   // Callback for "Not Remember" action
//   const handleNotRemember = useCallback(() => {
//     if (isAnimating || !currentCard) return;

//     setAnimationDirection("left");
//     // Mark the card as not remembered; keep or lower the score if you want
//     setFlashcards((prevFlashcards) =>
//       prevFlashcards.map((card) =>
//         card.id === currentCard.id
//           ? { ...card, remembered: false }
//           : card
//       )
//     );

//     if (currentIndex === currentBatch.length - 1) {
//       setShowSummary(true);
//     } else {
//       handleNext();
//     }
//   }, [isAnimating, currentCard, currentIndex, currentBatch.length]);

//   const handleNext = useCallback(() => {
//     if (isAnimating || currentIndex >= currentBatch.length - 1) return;
//     setIsAnimating(true);
//     // Wait for the old card to animate out, then show the next
//     setTimeout(() => {
//       setCurrentIndex(currentIndex + 1);
//       setIsAnimating(false);
//       // Reset any swipe offsets
//       setSwipeOffset(0);
//     }, 500);
//   }, [isAnimating, currentIndex, currentBatch.length]);

//   // Keyboard arrow listeners
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (showSummary) return;
//       if (e.key === "ArrowRight") {
//         setActiveButton("right");
//         handleRemember();
//         setTimeout(() => setActiveButton(null), 150);
//       } else if (e.key === "ArrowLeft") {
//         setActiveButton("left");
//         handleNotRemember();
//         setTimeout(() => setActiveButton(null), 150);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [handleRemember, handleNotRemember, showSummary]);

//   // Mobile swipe handlers
//   const onTouchStart = (e: React.TouchEvent) => {
//     touchStartX.current = e.touches[0].clientX;
//     setIsSwiping(true);
//   };

//   const onTouchMove = (e: React.TouchEvent) => {
//     if (!isSwiping) return;
//     const currentX = e.touches[0].clientX;
//     const deltaX = currentX - touchStartX.current;
//     // Update swipeOffset with a small factor if you want a slower drag
//     setSwipeOffset(deltaX);
//   };

//   const onTouchEnd = () => {
//     setIsSwiping(false);
//     const threshold = 100; // Adjust threshold as you like
//     if (swipeOffset > threshold) {
//       // Swiped right
//       handleRemember();
//     } else if (swipeOffset < -threshold) {
//       // Swiped left
//       handleNotRemember();
//     } else {
//       // Not enough swipe → snap back
//       setSwipeOffset(0);
//     }
//   };

//   const goBackWithAnimation = () => {
//     setFadeOut(true);
//     setTimeout(() => {
//       router.back();
//     }, 300);
//   };

//   const toggleMode = () => {
//     setIsAnswerFirst(!isAnswerFirst);
//   };

//   const proceedToNextBatch = async () => {
//     try {
//       const scoresToUpdate = flashcards
//         .filter((card) => card.remembered)
//         .map(({ id, score }) => ({ id, score }));

//       const result = await updateScores(deckId, scoresToUpdate);
//       if (result.error) {
//         console.error('Failed to update scores:', result.error);
//       } else {
//         console.log('Scores updated successfully');
//       }
//     } catch (error) {
//       console.error('Error updating scores:', error);
//     }

//     // Re-sort and pick the next 10
//     const sortedFlashcards = [...flashcards].sort((a, b) => a.score - b.score);
//     setCurrentBatch(sortedFlashcards.slice(0, 10));
//     setCurrentIndex(0);
//     setShowSummary(false);
//     setCorrectCount(0);
//   };

//   const handleMakePublicAndShare = async () => {
//     try {
//       await makeDeckPublic(deckId);
//       const link = `${window.location.origin}/practice/${deckId}`;
//       setShareLink(link);
//       navigator.clipboard.writeText(link);
//       setIsPublic(true);
//       toast({
//         title: "Deck Shared Successfully",
//         description: "Your deck is now public. The share link has been copied!",
//       });
//     } catch (error) {
//       console.error("Error making note public:", error);
//     }
//   };

//   const handleCopyLink = () => {
//     if (shareLink) {
//       navigator.clipboard.writeText(shareLink);
//       toast({
//         title: "Link Copied",
//         description: "The link to this deck has been copied to your clipboard.",
//       });
//     }
//   };

//   if (loading) {
//     return (
//       <div className="w-full h-screen flex items-center justify-center">
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           width="28"
//           height="28"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           className={"animate-spin stroke-[#6127FF]"}
//         >
//           <path d="M21 12a9 9 0 1 1-6.219-8.56" />
//         </svg>
//       </div>
//     );
//   }

//   if (!isOwner && !isPublic) {
//     return (
//       <div className="w-full h-screen flex flex-col items-center justify-center">
//         <div className="text-3xl mb-2">🔒</div>
//         <div className="text-2xl font-bold mb-1 text-primary">Access Denied</div>
//         <div className="text-primary/70">You do not have permission to view this deck.</div>
//         <Button
//           className="mt-5 h-12 font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white px-6 rounded-lg"
//           onClick={() => router.push("/home")}
//         >
//           Go to Home
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div
//       className={`overflow-hidden w-full h-[100dvh] flex flex-col px-5 md:px-8 pb-12 transition-opacity duration-500 ${
//         fadeOut ? "opacity-0" : "opacity-100"
//       }`}
//     >
//       {/* Header */}
//       <div className="flex flex-row items-center justify-between py-8 z-50 relative">
//         <Link href="/home" className="flex items-center gap-3">
//           <Image
//             src="/logo.png"
//             alt="logo"
//             width={28}
//             height={28}
//           />
//           <div className="text-base font-semibold text-primary">GStudy</div>
//         </Link>

//         <div className="hidden absolute left-1/2 transform -translate-x-1/2 md:flex flex-col items-center text-primary gap-2.5">
//           <div className="text-sm font-semibold">{deckTitle}</div>
//           <Progress value={progress} className="w-[300px] h-1.5" />
//         </div>

//         <div className="flex flex-row items-center gap-4">
//           <Button
//             className={`z-50 text-base h-auto px-2 bg-gray-50 dark:bg-accent border dark:border-themeGray text-black/70 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900/80 transition`}
//             onClick={toggleMode}
//           >
//             <RedoDot size={20} />
//           </Button>

//           <Dialog>
//             <DialogTrigger asChild>
//               <Button
//                 variant="outline"
//                 className="z-50 text-base h-auto size-[38px] p-0 bg-gray-50 dark:bg-accent border dark:border-themeGray text-black/70 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900/80 transition"
//               >
//                 <Share size={16} />
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>
//                   {isPublic ? "Share Deck" : "Make Deck Public"}
//                 </DialogTitle>
//                 <DialogDescription>
//                   {isPublic
//                     ? "This deck is public. Copy the link below to share it with others."
//                     : "To enable sharing, this deck must be made public. Once public, anyone with the link can access it."}
//                 </DialogDescription>
//               </DialogHeader>
//               {isPublic && (
//                 <div className="flex items-center mb-1 space-x-2 relative">
//                   <Input
//                     value={shareLink || ""}
//                     readOnly
//                     className="flex-1 pr-10"
//                   />
//                   <div
//                     onClick={handleCopyLink}
//                     className="absolute right-3 cursor-pointer hover:text-black"
//                     aria-label="Copy Link"
//                   >
//                     <Copy
//                       size={16}
//                       className="text-gray-600 hover:text-gray-800"
//                     />
//                   </div>
//                 </div>
//               )}
//               <DialogFooter>
//                 <DialogClose asChild>
//                   <Button variant="outline">Close</Button>
//                 </DialogClose>
//                 {isPublic ? (
//                   <DialogClose asChild>
//                     <Button
//                       onClick={handleCopyLink}
//                       className="bg-[#6127FF] hover:bg-[#6127FF]/80 text-white"
//                     >
//                       Copy Link
//                     </Button>
//                   </DialogClose>
//                 ) : (
//                   <DialogClose asChild>
//                     <Button
//                       onClick={handleMakePublicAndShare}
//                       className="bg-[#6127FF] hover:bg-[#6127FF]/80 text-white"
//                     >
//                       Make Public and Copy Link
//                     </Button>
//                   </DialogClose>
//                 )}
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>

//           <Button
//             className={`z-50 text-base h-auto px-2 bg-gray-50 dark:bg-accent border dark:border-themeGray text-black/70 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900/80 transition`}
//             onClick={goBackWithAnimation}
//           >
//             <X size={20} />
//           </Button>
//         </div>
//       </div>

//       {/* Content Area */}
//       <div className="flex-1 flex flex-col items-center justify-center relative">
//         {showSummary ? (
//           // Summary UI
//           <div
//             className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
//               showSummary ? "opacity-100" : "opacity-0"
//             }`}
//           >
//             <div className="text-3xl mb-2">✅</div>
//             <div className="text-2xl font-bold mb-1 text-primary">Batch Complete!</div>
//             <div className="text-primary/70">
//               You answered {correctCount} out of {currentBatch.length} cards correctly.
//             </div>
//             <Button
//               className="mt-5 h-12 font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white px-6 rounded-lg"
//               onClick={proceedToNextBatch}
//             >
//               Continue to Next Batch
//             </Button>
//           </div>
//         ) : (
//           // Flashcard UI with swipe container
//           <div
//             className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
//               showSummary ? "opacity-0" : "opacity-100"
//             }`}
//           >
//             <div
//               className={`flex w-full h-full items-center justify-center transition-all duration-500 transform ${
//                 isAnimating
//                   ? animationDirection === "right"
//                     ? "translate-x-full opacity-0"
//                     : "-translate-x-full opacity-0"
//                   : "translate-x-0 opacity-100"
//               }`}
//               key={currentIndex}
//             >
//               {/* SWIPE WRAPPER */}
//               <div
//                 className="w-full h-full max-w-lg"
//                 onTouchStart={onTouchStart}
//                 onTouchMove={onTouchMove}
//                 onTouchEnd={onTouchEnd}
//                 style={{
//                   // Animate the card position while swiping
//                   transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.05}deg)`,
//                   transition: isSwiping
//                     ? "none"
//                     : "transform 0.3s ease-in-out", // snap-back transition if user didn't cross threshold
//                 }}
//               >
//                 <Flashcard
//                   question={currentCard.question}
//                   answer={currentCard.answer}
//                   startFlipped={isAnswerFirst}
//                 />
//               </div>
//             </div>

//             <div className="flex space-x-3 md:space-x-4 mt-14 md:mt-8 w-full md:w-auto">
//               <Button
//                 className={`z-50 w-full md:w-48 text-sm md:text-base px-2 md:px-6 py-6 bg-[#FBFBFB] dark:bg-accent border dark:border-themeGray text-black/70 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900/80 transition ${
//                   activeButton === "left" ? "bg-gray-100 dark:bg-zinc-900/80" : ""
//                 }`}
//                 onClick={handleNotRemember}
//               >
//                 <span className="mr-3 text-xl md:text-2xl">🤷</span>
//                 Not sure
//               </Button>
//               <Button
//                 className={`z-50 w-full md:w-48 text-sm md:text-base px-2 md:px-6 py-6 bg-[#FBFBFB] dark:bg-accent border dark:border-themeGray text-black/70 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900/80 transition ${
//                   activeButton === "right" ? "bg-gray-100 dark:bg-zinc-900/80" : ""
//                 }`}
//                 onClick={handleRemember}
//               >
//                 <span className="mr-3 text-xl md:text-2xl">🧠</span>
//                 Remember
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DeckPracticePage;
