"use client";

import { Copy, Ellipsis, Share, Star, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { useState } from 'react';
import { deleteNote, makeNotePublic } from '@/app/actions/notes';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';


// Define the DeckProps type
interface NoteProps {
  id: string;
  title: string;
  createdAt: Date;
  isPublic: boolean;
  onDelete: (noteId: string) => void;
}

const NoteCard: React.FC<NoteProps> = ({ id, title, createdAt, isPublic, onDelete }) => {

  const router = useRouter();
  const [shareLink, setShareLink] = useState<string | null>(
    isPublic ? `${window.location.origin}/notes/${id}` : null
  );

  const { toast } = useToast();

  const formattedDate = new Date(createdAt).toLocaleDateString('de-DE');

  const handleDelete = async () => {
    try {
      await deleteNote(id);

      onDelete(id);

      // Refresh or redirect to the decks list page
    // router.push("/summaries");
    
      toast({
        title: "Summary Deleted",
        description: "The summary has been successfully deleted and removed from your collection.",
        // action: (
        //   <ToastAction altText="Close">Close</ToastAction>
        // ),
      });
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };


  const handleMakePublicAndShare = async () => {
    try {
      await makeNotePublic(id);

      const link = `${window.location.origin}/notes/${id}`;
      setShareLink(link);
      navigator.clipboard.writeText(link);
      console.log('Note is now public, and link copied to clipboard!');

      toast({
        title: "Deck Shared Successfully",
        description: "Your deck is now public. The share link has been copied to your clipboard!",
        // action: (
        //   <ToastAction altText="Close">Close</ToastAction>
        // ),
      })
    } catch (error) {
      console.error('Error making note public:', error);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      console.log('Link copied to clipboard!');
      toast({
        title: "Link Copied",
        description: "The link to this deck has been copied to your clipboard.",
        // action: (
        //   <ToastAction altText="Close">Close</ToastAction>
        // ),
      })
    }
  };



  return (
    <div
      className="w-full h-52 bg-[#FDFDFD] dark:bg-card hover:bg-gray-100/70 dark:hover:bg-card/70 cursor-pointer rounded-xl p-6 border transition-colors ease-in duration-300"
      onClick={() => {
        router.push(`/notes/${id}`);
      }}
    >
      <div className='flex flex-row items-center justify-between text-gray-500'>
        <Star />
        <DropDown
          trigger={
            <div
              className="p-0 m-0"
              onClick={(e) => e.stopPropagation()} // Prevents parent click
            >
              <Ellipsis />
            </div>
          }
          title="Options"
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                onClick={(e) => e.stopPropagation()}
                className="w-full text-left flex justify-between px-4"
              >
                Share
                <Share className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>{isPublic ? "Share Note" : "Make Note Public"}</DialogTitle>
                <DialogDescription>
                  {isPublic
                    ? "This note is now public. Copy the link below to share it with others."
                    : "To enable sharing, this note must be made public. Once public, anyone with the link can access it."}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center mb-1 space-x-2 relative">
                <Input
                  value={shareLink || ''}
                  readOnly
                  className="flex-1 pr-10" // Add padding to accommodate the icon
                />
                <div
                  onClick={handleCopyLink}
                  className="absolute right-3 cursor-pointer hover:text-black"
                  aria-label="Copy Link"
                >
                  <Copy size={16} className="text-gray-600 hover:text-gray-800" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                {isPublic ? (
                  <DialogClose asChild>
                    <Button onClick={handleCopyLink} className='bg-[#6127FF] hover:bg-[#6127FF]/80 text-white'>
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" onClick={(e) => e.stopPropagation()} className="w-full text-left flex justify-between px-4 bg-transparent">
                Delete
                <Trash className='size-4' />
              </Button>

            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the note and all of its changes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDelete}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropDown>
      </div>
      <div className='text-[15px] font-medium text-primary mt-6 line-clamp-2 h-14'>{title}</div>


      <div className='flex flex-row items-center justify-between text-gray-500 mt-7'>
        <div className='text-base'>Generated:</div>
        <div className='text-base'>{formattedDate}</div>
      </div>
      {/* <div className='text-sm font-regular text-primary/60 leading-none line-clamp-2 mt-1'>{description}</div> */}

      {/* <div className='mt-4 text-xs p-2 rounded-md bg-purple-50 text-purple-500 font-semibold '>Wirtschaftsinformatik</div> */}
    </div>
  );
};

export default NoteCard;
