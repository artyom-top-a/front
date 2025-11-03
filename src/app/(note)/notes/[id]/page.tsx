// app/notes/generated/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Copy, Ellipsis, MessagesSquare, Pencil, Share, Trash } from 'lucide-react';
import Editor from '@/components/global/editor/editor';
import { JSONContent } from 'novel';
import { parseHTMLToJSONContent } from '@/utils/parse-html-to-json-content';
import { Textarea } from '@/components/ui/textarea';
import { deleteNote, makeNotePublic } from '@/app/actions/notes';
import { useCurrentUser } from '@/app/hooks/user';
import Link from 'next/link';
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
} from "@/components/ui/alert-dialog";
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
import { useToast } from '@/hooks/use-toast';
import Chat from '@/components/global/chat';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import PricingDialog from '@/components/dialogs/pricing-dialog';
import { isUserSubscribed } from '@/app/actions/premium';
import { saveNoteToDB } from '@/app/actions/save-note';
import Image from 'next/image';

// export const defaultValue: JSONContent = {
//   type: 'doc',
//   content: [
//     {
//       type: 'paragraph',
//       content: [],
//     },
//   ],
// };

const defaultValue: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
};

const NotesPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const noteId = id as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<JSONContent>(defaultValue);

  const [loading, setLoading] = useState(true);
  // const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  // const [isSaving, setIsSaving] = useState(false);
  // const [generatingFlashcards, setGeneratingFlashcards] = useState(false);

  const [isEditable, setIsEditable] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const [shareLink, setShareLink] = useState<string | null>(null);

  const [noteContent, setNoteContent] = useState<string | null>(null);

  const { session } = useCurrentUser();

  const { toast } = useToast();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust breakpoint as needed
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${noteId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch note');
        }
        const data = await response.json();

        console.log("API response:", data.isOwner);

        setIsPublic(data.isPublic === true);
        setIsOwner(data.isOwner === true);

        setTitle(data.title);
        // const parsed = parseHTMLToJSONContent(data.content);
        // console.log("Parsed content:", parsed);
        // setContent(parsed);
        // setContent(data.content);

        setNoteContent(data.source);

        let finalContent: JSONContent = defaultValue;

        if (typeof data.content === 'string') {
          // data.content might be HTML or JSON in string form
          try {
            const parsedJson = JSON.parse(data.content);
            // Check if parsedJson looks like a JSONContent doc
            if (parsedJson && parsedJson.type === 'doc') {
              finalContent = parsedJson;
            } else {
              // If it doesn't match the expected structure, assume it's HTML
              finalContent = parseHTMLToJSONContent(data.content);
            }
          } catch (e) {
            // JSON.parse failed, treat it as HTML
            finalContent = parseHTMLToJSONContent(data.content);
          }
        } else {
          // data.content is likely already a JSON object
          finalContent = data.content as JSONContent;
        }

        setContent(finalContent);

        if (data.isPublic) {
          setShareLink(`${window.location.origin}/notes/${noteId}`);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message); // Access `message` safely
        } else {
          console.log('An unknown error occurred:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [noteId]);

  // const handleSaveAsPDF = () => {
  //   if (!contentRef.current) {
  //     console.error('Content reference not found');
  //     return;
  //   }

  //   setIsGeneratingPDF(true);

  //   const options = {
  //     margin: 10,
  //     filename: `${title || 'note'}.pdf`,
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 2 },
  //     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  //   };

  //   // Use a timeout to allow the DOM to update before saving the PDF
  //   setTimeout(() => {
  //     html2pdf()
  //       .set(options)
  //       .from(contentRef.current)
  //       .save()
  //       .finally(() => {
  //         setIsGeneratingPDF(false);
  //       });
  //   }, 0);
  // };


  // const handleSaveNote = async () => {
  //   if (!session?.user?.email) {
  //     toast({
  //       title: "Authentication Required",
  //       description: "You need to be logged in to save a note.",
  //     });
  //     return;
  //   }
  //   // setIsSaving(true);
  //   try {
  //     // await createNote(session.user.email, title, content);
  //     await saveNoteToDB(noteId, title, content, session.user.id!);
  //     toast({
  //       title: "Note Saved",
  //       description: "Your note has been successfully saved.",
  //     });
  //   } catch (error) {
  //     console.error("Failed to save note:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to save the note. Please try again later.",
  //     });
  //   } finally {
  //     // setIsSaving(false);
  //   }
  // };

  const handleSaveNote = async () => {

    try {
      const response = await fetch('/api/save-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, title, content, userId: session!.user.id }),
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Note Saved",
          description: "Your note has been successfully saved.",
        });
      } else {
        throw new Error(result.error || 'Failed to save the note.');
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({
        title: "Error",
        description: "Failed to save the note. Please try again later.",
      });
    }
  };





  // const handleGenerateFlashcards = async () => {
  //   setGeneratingFlashcards(true);
  //   try {
  //     const plainTextContent = getPlainTextFromJSONContent(content);

  //     const response = await fetch('/api/flashcards/notes', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ content: plainTextContent }),
  //     });

  //     const data = await response.json();
  //     if (response.ok && data.flashcards) {
  //       router.push(
  //         `/create-deck?flashcards=${encodeURIComponent(
  //           JSON.stringify(data.flashcards)
  //         )}`
  //       );
  //       toast({
  //         title: "Flashcards Generated",
  //         description: "Your flashcards have been successfully created.",
  //       });
  //     } else {
  //       console.error(data.error || 'Failed to generate flashcards');
  //       toast({
  //         title: "Error",
  //         description: data.error || "Failed to generate flashcards.",
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error generating flashcards:', error);
  //     toast({
  //       title: "Error",
  //       description: "An error occurred while generating flashcards.",
  //     });

  //   } finally {
  //     setGeneratingFlashcards(false);
  //   }
  // };

  const handleMakePublicAndShare = async () => {
    try {
      await makeNotePublic(noteId);

      const link = `${window.location.origin}/notes/${noteId}`;
      setShareLink(link);
      navigator.clipboard.writeText(link);
      console.log("Note is now public, and link copied to clipboard!");
      setIsPublic(true);
      toast({
        title: "Note Made Public",
        description: "Your note is now public, and the link has been copied to your clipboard.",
        // action: (
        //   <ToastAction altText="Close">Close</ToastAction>
        // ),
      });
    } catch (error) {
      console.error("Error making note public:", error);
      toast({
        title: "Error",
        description: "Failed to make the note public. Please try again later.",
        // action: (
        //   <ToastAction altText="Close">Close</ToastAction>
        // ),
      });
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      console.log("Link copied to clipboard!");
      toast({
        title: "Link Copied",
        description: "The public link to your note has been copied to your clipboard.",
        // action: (
        //   <ToastAction altText="Close">Close</ToastAction>
        // ),
      });
    }
  };

  const handleDeleteNote = async () => {
    try {
      await deleteNote(noteId);
      router.push("/summaries");
      toast({
        title: "Summary Deleted",
        description: "The summary has been successfully deleted and removed from your collection.",
        // action: (
        //   <ToastAction altText="Close">Close</ToastAction>
        // ),
      });
    } catch {
      // console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete the note. Please try again later.",
        // action: (
        //   <ToastAction altText="Close">Close</ToastAction>
        // ),
      });
    }
  };

  // const getPlainTextFromJSONContent = (jsonContent: JSONContent): string => {
  //   const { content } = jsonContent;
  //   let text = '';

  //   const traverse = (nodes: any[]) => {
  //     nodes.forEach((node) => {
  //       if (node.type === 'text') {
  //         text += node.text + ' ';
  //       } else if (node.content) {
  //         traverse(node.content);
  //       }
  //     });
  //   };

  //   if (content) {
  //     traverse(content);
  //   }

  //   return text.trim();
  // };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    if (titleRef.current) {
      titleRef.current.style.height = 'auto'; // Reset height
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`; // Set height based on scroll height
    }
  };


  const handleChatClick = async () => {
    try {
      const subscriptionCheck = await isUserSubscribed();

      if (!subscriptionCheck.success) {
        toast({
          title: "Error",
          description: "Error fetching user subscription. Please try again.",
        });
        return;
      }

      const { subscribed, subscriptionEnd } = subscriptionCheck;

      if (!subscribed || (subscriptionEnd && new Date(subscriptionEnd) < new Date())) {
        setShowUpgradeModal(true); // Show upgrade modal
        return;
      }

      setIsChatOpen(true); // Open chat if user is subscribed
    } catch {
      toast({
        title: "Error",
        description: "An error occurred while checking subscription status.",
      });
    }
  };
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto'; // Reset height
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`; // Set height based on scroll height
    }
  }, [title]);


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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl mb-2">🔒</div>
        <div className="text-2xl font-bold mb-1 text-primary">Access Denied</div>
        <div className="text-primary/70">
          You do not have permission to view this note.
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
    <div className="w-full h-[100vh] flex flex-col">
      {/* Navbar */}
      <div className="fixed top-0 w-full bg-white z-50 px-8 py-5 border-b">
        <div className="flex flex-row items-center justify-between">
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

          {isMobile ? (
            // Mobile-specific drawer trigger
            <Drawer>
              <DrawerTrigger asChild>
                {/* <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.75a.75.75 0 110 1.5.75.75 0 010-1.5zm0 5.25a.75.75 0 110 1.5.75.75 0 010-1.5zm0 5.25a.75.75 0 110 1.5.75.75 0 010-1.5z"
                    />
                  </svg>
                </button> */}

                <Button variant="outline" className='size-10 p-0' onClick={() => { }}>
                  <Ellipsis className='size-5' />
                </Button>
              </DrawerTrigger>

              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className='justify-start text-start text-black'>Actions</DrawerTitle>
                  <DrawerDescription className="justify-start text-start text-black/70">
                    Quickly manage your note: edit, share, chat with source, or delete.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
                  <DrawerClose className='w-full'>
                    <Button
                      className="w-full h-10 font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white px-6 rounded-lg"
                      onClick={handleChatClick}
                    >
                      <MessagesSquare className="mr-2 size-4" /> Chat with Source
                    </Button>
                  </DrawerClose>
                  {isOwner && (
                    <DrawerClose className='w-full'>
                      <Button
                        className="w-full"
                        variant={"outline"}
                        onClick={() => {
                          if (isEditable) handleSaveNote();
                          setIsEditable((prev) => !prev);
                        }}
                      >
                        {isEditable ? "Save Note" : "Edit Note"}
                      </Button>
                    </DrawerClose>
                  )}
                  <DrawerClose className='w-full'>
                    {isPublic ? (
                      <Button className="w-full" onClick={handleCopyLink} variant={"outline"}>
                        Copy Share Link
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={handleMakePublicAndShare} variant={"outline"}>
                        Make Public and Share
                      </Button>
                    )}
                  </DrawerClose>

                  {isOwner && (
                    <DrawerClose className='w-full'>
                      {/* <Button
                      variant={"outline"}
                      // className="w-full bg-red-600 text-white hover:bg-red-700"
                      className='w-full'
                      onClick={handleDeleteNote}
                    >
                      Delete Note
                    </Button> */}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant={"outline"}
                            // className="w-full bg-red-600 text-white hover:bg-red-700"
                            className='w-full'
                          >
                            Delete Note
                          </Button>

                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the note and all of its content.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 text-white hover:bg-red-700"
                              onClick={handleDeleteNote}
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DrawerClose>
                  )}
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ) : (
            // Desktop buttons
            <div className="flex flex-row items-center space-x-4">
              {/* Desktop-specific buttons */}
              <Button
                className="h-10 font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white px-6 rounded-lg"
                onClick={handleChatClick}
              >
                <MessagesSquare className="mr-2 size-4" /> Chat with Source
              </Button>
              {isOwner && (
                <Button
                  onClick={() => {
                    if (isEditable) handleSaveNote();
                    setIsEditable((prev) => !prev);
                  }}
                  variant="outline"
                  className={`${isEditable ? "" : "size-10 p-0"}`}
                >
                  {isEditable ? "Save" : <Pencil strokeWidth="2.5" className="size-4" />}
                </Button>

              )}


              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className='size-10 p-0' onClick={() => { }}>
                    <Share strokeWidth="2.5" className="mr-0 size-4" />
                    {/* Share */}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {isPublic ? "Share Note" : "Make Note Public"}
                    </DialogTitle>
                    <DialogDescription>
                      {isPublic
                        ? "This note is public. Copy the link below to share it with others."
                        : "To enable sharing, this note must be made public. Once public, anyone with the link can access it."}
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
                      <Button
                        onClick={handleCopyLink}
                        className="bg-[#6127FF] hover:bg-[#6127FF]/80 text-white"
                      >
                        Copy Link
                      </Button>
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


              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className='size-10 p-0' onClick={() => { }}>
                      <Trash strokeWidth="2.5" className="mr-0 size-4" />
                      {/* Share */}
                    </Button>

                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the note and all of its content.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={handleDeleteNote}
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {/* Other desktop-specific buttons here */}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className='w-full h-full flex flex-row overflow-hidden'>
        <div className="flex flex-col w-full max-w-4xl mx-auto pt-[72px] overflow-y-auto pb-6 scrollbar-hide">
          {/* Content Ref */}
          <div ref={contentRef} className="mx-5 md:px-8">
            {/* Inline Styles for PDF Rendering */}

            <Textarea
              ref={titleRef}
              className={`
                w-full
                resize-none
                border-none
                bg-transparent
                p-0
                text-2xl md:text-3xl lg:text-4xl
                font-bold
                !leading-tight
                text-primary
                placeholder:text-muted-foreground/40
                dark:placeholder:text-muted-foreground
                focus:outline-none
                focus:ring-0
                break-words
                whitespace-pre-wrap
                mb-1 mt-6 lg:mt-16
                ${isEditable ? '' : 'cursor-default'}
              `}
              placeholder="Note Title"
              value={title}
              onChange={handleTitleChange}
              rows={1}
              readOnly={!isEditable}
            />


            {/* Editor Component */}
            <Editor
              initialValue={content}
              onChange={(newContent) => setContent(newContent)}
              noteId="generated"
              userId="some-user-id"
              isEditable={isEditable}
            />
          </div>



        </div>

        {/* {isChatOpen && !isMobile && (
        <div className="w-[480px] flex-shrink-0 flex flex-col border-l bg-white pt-[80px]">
          <Chat onClose={() => setIsChatOpen(false)} />
        </div>
        )} */}


        {isChatOpen && (
          isMobile ? (
            // Full-width chat for mobile
            <div className="fixed inset-0 z-50 bg-white flex flex-col">
              <Chat onClose={() => setIsChatOpen(false)} noteContent={noteContent!} />
            </div>
          ) : (
            // Sidebar chat for larger screens
            <div className="w-[480px] flex-shrink-0 flex flex-col border-l bg-white pt-[80px]">
              <Chat onClose={() => setIsChatOpen(false)} noteContent={noteContent!} />
            </div>
          )
        )}


      </div>


      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <PricingDialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
      )}
    </div>
  );
};

export default NotesPage;
