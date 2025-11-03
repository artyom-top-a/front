"use client";

import { useRouter } from 'next/navigation';
import { Ellipsis, PenLine, Star, Trash } from 'lucide-react';
import { DropDown } from '../ui/dropdown';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

// Define the DeckProps type
interface DeckProps {
  id: string;
  title: string;
  cardsCount: number;
  onDelete: (deckId: string) => void;
}

const Deck: React.FC<DeckProps> = ({ id, title, cardsCount, onDelete }) => {
  const { toast } = useToast();
  const router = useRouter();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents parent click
    router.push(`/edit-deck/${id}`);
  };

  // const handleDelete = (e: React.MouseEvent) => {
  //   e.stopPropagation(); // Prevents parent click
  //   console.log(`Deleting deck with ID: ${id}`);
  //   toast({
  //     title: "Deck Deleted",
  //     description: "The deck has been successfully deleted and removed from your collection.",
  //     // action: (
  //     //   <ToastAction altText="Close">Close</ToastAction>
  //     // ),
  //   });
  //   // Optionally redirect or refresh after deletion
  // };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/decks/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        onDelete(id);
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

  return (
    <div
      className="w-full h-52 bg-[#FDFDFD] dark:bg-card hover:bg-gray-100/70 dark:hover:bg-card/70 cursor-pointer rounded-xl p-6 border transition-colors ease-in duration-300"
      onClick={() => {
        router.push(`/practice/${id}`); // Change to the desired route with deck ID if needed
      }}
    >
      <div className="flex flex-row items-center justify-between text-gray-500">
        <Star />
        <DropDown
          trigger={
            <div
              onClick={(e) => e.stopPropagation()} // Prevents parent click
            >
              <Ellipsis />
            </div>
          }
          title="Options"
        >
          <Button variant="ghost" onClick={handleEdit} className="w-full text-left flex justify-between px-4">
            Edit
            <PenLine className='size-4'/>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
          <Button variant="destructive" onClick={(e) => e.stopPropagation()} className="w-full text-left flex justify-between px-4 bg-transparent">
            Delete
            <Trash className='size-4'/>
          </Button>

          </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the deck and all of its flashcards.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDelete}
                >
                  Delete Deck
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropDown>
      </div>
      {/* <div className="text-[15px] font-medium text-primary mt-6 line-clamp-2">{title}</div> */}
      <div className='text-[15px] font-medium text-primary mt-6 line-clamp-2 h-14'>{title}</div>

      <div className="flex flex-row items-center justify-between text-gray-500 mt-7">
        <div className="text-base">Cards:</div>
        <div className="text-base">{cardsCount}</div>
      </div>
    </div>
  );
};

export default Deck;
