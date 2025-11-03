"use client";

import { useState, useEffect } from 'react';

// Define the FlashcardProps type
interface FlashcardProps {
  question: string;
  answer: string;
  startFlipped?: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ question, answer, startFlipped = false }) => {
  const [flipped, setFlipped] = useState<boolean>(startFlipped);
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true); // Track if it's the first render
  const [isEntering, setIsEntering] = useState<boolean>(true); // Track if the card is appearing (opacity)

  // Handle opacity animation for card entry
  useEffect(() => {
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 100); // Card fades in after 100ms
    return () => clearTimeout(timer); // Clean up the timer when component unmounts
  }, [question, answer]);

  // Set flipped state based on startFlipped prop and handle initial render
  useEffect(() => {
    setFlipped(startFlipped);
    setIsInitialRender(false); // After the first render, set this flag to false
  }, [startFlipped]);

  // Handle spacebar flip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault(); // Prevent default behavior (like scrolling)
        setFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      className={`w-full lg:w-11/12 h-full transition-opacity duration-500 ease-out ${isEntering ? 'opacity-0' : 'opacity-100'
        }`} // Opacity transition
      style={{ perspective: '1000px' }} // Adds 3D perspective
      onClick={() => setFlipped(!flipped)} // Flip the card on click
    >
      <div
        className={`relative w-full h-full transform ${flipped ? '[transform:rotateY(180deg)]' : ''
          } [transform-style:preserve-3d] ${!isInitialRender ? 'transition-transform duration-500' : '' // Only apply flip transition after the first render
          }`}
      >

        {/* Front side (Question) */}
        <div
          className="absolute w-full h-full bg-[#FDFDFD] dark:bg-card rounded-xl border border-gray-200 dark:border-border p-8 flex items-center justify-center text-center text-lg md:text-xl font-semibold text-primary [backface-visibility:hidden] [transform:rotateY(0deg)]"
        >
          <div className='flex flex-col items-center justify-center'>
            <div>{question}</div>
            <span className='text-base font-normal text-primary/40 mt-3'>Flip to see the answer</span>
          </div>
        </div>

        {/* Back side (Answer) */}
        <div
          className="absolute w-full h-full bg-[#FDFDFD] dark:bg-card rounded-xl border p-8 flex items-center justify-center text-center text-lg md:text-xl font-semibold text-primary/90 [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          {answer}
        </div>
      </div>

    </div>
  );
};

export default Flashcard;
