"use client";

import { useEffect, useState } from 'react';
import Flashcard from './flash-card';
import { Button } from '../ui/button';
import { Check, X } from 'lucide-react';

interface FlashcardData {
  id: number;
  question: string;
  answer: string;
  remembered?: boolean;
  answered?: boolean;
}

const initialFlashcards: FlashcardData[] = [
  {
    id: 0,
    question: 'What is React?',
    answer: 'A JavaScript library for building user interfaces',
  },
  {
    id: 1,
    question: 'What is Next.js?',
    answer: 'A React framework for production',
  },
  {
    id: 2,
    question: 'What is Tailwind CSS?',
    answer: 'A utility-first CSS framework',
  },
];

const FlashCards: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [flashcards, setFlashcards] = useState<FlashcardData[]>(initialFlashcards);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('right');
  const [activeButton, setActiveButton] = useState<'left' | 'right' | null>(null);

  const currentCard = flashcards[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActiveButton('right');
        handleRemember();
        setTimeout(() => setActiveButton(null), 350);
      } else if (e.key === 'ArrowLeft') {
        setActiveButton('left');
        handleNotRemember();
        setTimeout(() => setActiveButton(null), 350);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, isAnimating]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimationDirection('right'); // Animation will move to the right
    setTimeout(() => {
      // setCurrentIndex((currentIndex - 1 + flashcards.length) % flashcards.length);
      setCurrentIndex((currentIndex + 1) % flashcards.length);
      setIsAnimating(false);
    }, 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimationDirection('left'); // Animation will move to the left
    // setTimeout(() => {
    //   setCurrentIndex((currentIndex - 1 + flashcards.length) % flashcards.length);
    //   setIsAnimating(false);
    // }, 500);
    setTimeout(() => {
      setCurrentIndex((currentIndex - 1 + flashcards.length) % flashcards.length);
      setIsAnimating(false);
    }, 500);
  };

  const triggerAnimation = () => {
    setIsAnimating(true);
    // Start the animation for transitioning the current card out
    setTimeout(() => {
      setCurrentIndex((currentIndex + (animationDirection === 'right' ? 1 : -1) + flashcards.length) % flashcards.length);
      // After the card transitions out, we change the index and reset the animation state
      setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Time for the new card to animate in
    }, 500); // Time for the old card to animate out
  };


  const handleRemember = () => {
    if (isAnimating) return;
    // setFlashcards((prevFlashcards) =>
    //   prevFlashcards.map((card, index) =>
    //     index === currentIndex ? { ...card, remembered: true, answered: true } : card
    //   )
    // );
    // setIsAnimating(true);
    // setAnimationDirection('right'); // Animation will move to the left
    // setTimeout(() => {
    //   setCurrentIndex((currentIndex - 1 + flashcards.length) % flashcards.length);
    //   setIsAnimating(false);
    // }, 500);
    setFlashcards((prevFlashcards) =>
      prevFlashcards.map((card, index) =>
        index === currentIndex ? { ...card, remembered: true, answered: true } : card
      )
    );
    handleNext();
  };

  const handleNotRemember = () => {
    if (isAnimating) return;
    setFlashcards((prevFlashcards) =>
      prevFlashcards.map((card, index) =>
        index === currentIndex ? { ...card, remembered: false, answered: true } : card
      )
    );
    // setIsAnimating(true);
    // setAnimationDirection('left'); // Animation will move to the left
    // setTimeout(() => {
    //   setCurrentIndex((currentIndex - 1 + flashcards.length) % flashcards.length);
    //   setIsAnimating(false);
    // }, 500);
    handlePrev();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center flex-1">
      {/* Display the current flashcard */}
      <div
        className={`flex w-full items-center justify-center transition-all duration-700 transform ${
            isAnimating
              ? animationDirection === 'right'
                ? 'translate-x-[100%] opacity-0'
                : '-translate-x-[100%] opacity-0'
              : 'translate-x-0 opacity-100'
          }`}
          key={currentIndex}
      >
        <Flashcard question={currentCard.question} answer={currentCard.answer} />
      </div>
      

      {/* Navigation buttons */}
      <div className="flex space-x-4 mt-10">
      <Button
          className={`z-50 text-base px-4 py-5 bg-[#F3F3F3] dark:bg-themeBlack border dark:border-themeGray text-black/70 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-zinc-900/80 transition ${
            activeButton === 'left' ? 'bg-gray-300 dark:bg-zinc-900/80' : ''
          }`}
          onClick={handleNotRemember}
        >
          <X />
        </Button>
        <Button
          className={`z-50 text-base px-4 py-5 bg-[#F3F3F3] dark:bg-themeBlack border dark:border-themeGray text-black/70 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-zinc-900/80 transition ${
            activeButton === 'right' ? 'bg-gray-300 dark:bg-zinc-900/80' : ''
          }`}
          onClick={handleRemember}
        >
          <Check />
        </Button>
      </div>
    </div>
  );
};

export default FlashCards;
