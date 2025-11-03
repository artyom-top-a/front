"use client"

import React, { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Trash, Plus, Play } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface Flashcard {
  question: string;
  answer: string;
}

const CreateDeckPage = () => {
  const { toast } = useToast();

  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);
  const [deckTitle, setDeckTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const [isMobile, setIsMobile] = useState(false);


  const questionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const answerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Fetch deck data on component mount
    async function fetchDeckData() {
      try {
        const response = await fetch(`/api/decks/${deckId}`);
        const data = await response.json();

        if (response.ok && data.deck) {
          setDeckTitle(data.deck.title);
          setFlashcards(data.deck.cards.map((card: Flashcard) => ({
            question: card.question,
            answer: card.answer,
          })));
          setIsOwner(data.isOwner);
        } else {
          console.error('Error loading deck:', data.error);
        }
      } catch (error) {
        console.error('Error fetching deck data:', error);
      } finally {
        setIsLoading(false); // Set loading to false once data is fetched
      }
    }

    fetchDeckData();


    // Detect screen size for mobile view
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedCard = flashcards[selectedCardIndex] || { question: '', answer: '' };

  const resizeTextarea = (textareaRef: React.RefObject<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scroll height
    }
  };

  // Resize the textareas whenever the selectedCard changes (e.g., on load or when switching cards)
  useEffect(() => {
    resizeTextarea(questionTextareaRef);
    resizeTextarea(answerTextareaRef);
  }, [selectedCard]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setSelectedCardIndex((prevIndex) => Math.min(prevIndex + 1, flashcards.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setSelectedCardIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flashcards]);

  const handleQuestionChange = (newQuestion: string) => {
    setFlashcards(
      flashcards.map((card, index) =>
        index === selectedCardIndex ? { ...card, question: newQuestion } : card
      )
    );
    resizeTextarea(questionTextareaRef); // Adjust height as the user types
  };

  const handleAnswerChange = (newAnswer: string) => {
    setFlashcards(
      flashcards.map((card, index) =>
        index === selectedCardIndex ? { ...card, answer: newAnswer } : card
      )
    );
    resizeTextarea(answerTextareaRef); // Adjust height as the user types
  };

  const handleAddFlashcard = () => {
    const newCard = { question: '', answer: '' };
    setFlashcards([...flashcards, newCard]);
    setSelectedCardIndex(flashcards.length);

    setTimeout(() => {
      cardRefs.current[flashcards.length]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const handleDeleteFlashcard = () => {
    if (flashcards.length > 0) {
      const updatedFlashcards = flashcards.filter((_, index) => index !== selectedCardIndex);
      setFlashcards(updatedFlashcards);
      setSelectedCardIndex((prevIndex) => Math.max(0, prevIndex - 1));
    }
  };

  const handleSaveFlashcards = async () => {
    const updatedDeck = {
      title: deckTitle,
      flashcards: flashcards.map((card) => ({
        question: card.question,
        answer: card.answer,
      })),
    };

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDeck),
      });

      if (response.ok) {
        console.log('Deck updated successfully');
        router.push('/flash-cards'); // Redirect to the flash-cards page
      } else {
        console.error('Failed to update deck:', await response.json());
      }
    } catch (error) {
      console.error('An error occurred while updating the deck:', error);
    }
  };


  const handleDeleteDeck = async () => {
    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        // Redirect after successful deletion
        router.push('/flash-cards')
        toast({
          title: "Deck Deleted",
          description: "The deck has been successfully deleted and removed from your collection.",
          // action: (
          //   <ToastAction altText="Close">Close</ToastAction>
          // ),
        });
      } else {
        console.error('Failed to delete deck:', await response.json())
      }
    } catch (error) {
      console.error('Error deleting deck:', error)
    }
  }


  const handleExportToAnki = () => {
    // 1. Build CSV content, with proper quoting
  const csvLines = flashcards.map(card => {
    const q = card.question.replace(/"/g, '""')
    const a = card.answer  .replace(/"/g, '""')
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

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        {/* <Loader loading={true} children /> */}
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
        {/* <div>Loading...</div> */}
      </div>
    );
  }

  if (!isOwner) {
    // If the current user is not the owner, show an "Access Denied" message
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl mb-2">🔒</div>
        <div className="text-2xl font-bold mb-1 text-primary">Access Denied</div>
        <div className="text-primary/70">
          You do not have permission to edit this deck.
        </div>
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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-row items-center justify-between py-6 px-5 md:px-8">
        <Button
          className="z-50 text-base h-10 w-10 bg-gray-50 dark:bg-accent px-2 border dark:border-themeGray text-black/70 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900/80 transition"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
        </Button>

        <Input
          placeholder="Deck Title"
          value={deckTitle}
          onChange={(e) => setDeckTitle(e.target.value)}
          className='text-primary border-none text-[15px] font-semibold ml-2'
        />

        {/* <Button
          className="z-50 text-sm h-10 px-5 bg-[#F3F3F3] dark:bg-accent border text-black/70 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-zinc-900/80 transition"
          onClick={handleDeleteFlashcard}
        >


          Cancel

        </Button> */}

        <Button
          className="z-50 text-sm h-10 font-semibold px-5 bg-gray-50 dark:bg-accent border text-black/70 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-zinc-900/80 transition"
          onClick={() => router.push(`/practice/${deckId}`)}
        >
          <Play className='size-5 mr-2' />
          Practice
        </Button>
        <Button
          className="ml-3 z-50 text-sm transition h-10 font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white px-6 rounded-lg"
          onClick={handleSaveFlashcards}
        >
          Save
        </Button>

        <Button onClick={handleExportToAnki} className="ml-3 z-50 text-sm transition h-10 font-bold text-[#6127FF] bg-[#6127FF]/10 hover:bg-[#6127FF]/20 border border-[#6127FF]/15 px-6 rounded-lg">
          {/* <Play className='size-5 mr-2' /> */}
          Export to Anki
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className='flex-shrink-0 size-10 p-0 ml-3'>
              <Trash strokeWidth="2.5" className="mr-0 size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this deck?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the deck and remove all associated flashcards.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteDeck} className="bg-red-500 text-white hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Main Content */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        {!isMobile ? (
          <div className="w-full md:w-72 lg:w-96 flex-shrink-0 pb-4 pl-8 overflow-y-auto scrollbar-hide">
            <div className="sticky top-0 bg-white dark:bg-black  pt-8">
              <Button className="w-full font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white px-6 rounded-lg" onClick={handleAddFlashcard}>
                <Plus size={20} className="mr-2" /> New Flashcard
              </Button>
            </div>

            <div className="space-y-4 mt-5">
              {flashcards.map((card, index) => (
                <Card
                  key={index}
                  ref={(el) => { cardRefs.current[index] = el; }}
                  className={`w-full shadow-none h-28 md:h-40 flex flex-col items-center justify-center cursor-pointer ${index === selectedCardIndex ? 'border-purple-600 border-2' : ''}`}
                  onClick={() => setSelectedCardIndex(index)}
                >
                  <div className="text-sm font-medium px-4 line-clamp-2 text-center overflow-hidden text-primary/70">
                    {card.question || 'Untitled Question'}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        {/* Flashcard Editor */}
        <div className="w-full h-full flex flex-col px-4 md:p-12 py-8">
          <Card className="bg-card w-full h-4/5 md:h-full flex flex-col items-center justify-center px-4 py-6">
            <div className="w-full flex flex-col items-center">
              <Textarea
                ref={questionTextareaRef}
                value={selectedCard.question}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleQuestionChange(e.target.value)}
                placeholder="Question"
                className="h-auto text-primary w-full border-none text-base md:text-lg font-medium text-center resize-none px-4 my-4"
                style={{ overflow: 'hidden' }}
              />
              <Separator className="my-4 flex-shrink-0" />
              <Textarea
                ref={answerTextareaRef}
                value={selectedCard.answer}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleAnswerChange(e.target.value)}
                placeholder="Answer"
                className="h-auto text-primary w-full border-none text-base md:text-lg font-medium text-center resize-none px-4 my-4"
                style={{ overflow: 'hidden' }}
              />
            </div>
          </Card>

          <Button onClick={handleDeleteFlashcard} variant={"destructive"} className='mt-8 font-semibold'>Delete Card </Button>
          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant={"outline"} className="flex w-full z-50 mt-5">Select Card</Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[90vh] overflow-hidden rounded-t-lg">
                <DrawerHeader>
                  <DrawerTitle>Select a Flashcard</DrawerTitle>
                </DrawerHeader>
                <div className="space-y-4 px-5 overflow-y-auto mb-5">
                  {flashcards.map((card, index) => (
                    <DrawerClose asChild key={index}>
                      <Card
                        key={index}
                        className={`w-full shadow-none h-28 md:h-36 flex flex-col items-center justify-center cursor-pointer ${index === selectedCardIndex ? 'border-purple-600 border-2' : ''}`}
                        onClick={() => {
                          setSelectedCardIndex(index);
                          // document.querySelector('button[aria-label="Close"]').click();
                        }}
                      >
                        <div className="text-sm font-medium px-4 line-clamp-2 text-center overflow-hidden text-primary/70">
                          {card.question || 'Untitled Question'}
                        </div>
                      </Card>
                    </DrawerClose>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          ) : null}
        </div>

      </div>
    </div>
  )
}

export default CreateDeckPage;
