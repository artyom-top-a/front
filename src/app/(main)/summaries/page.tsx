'use client';

import { useState, useEffect } from 'react';
import { ContentLayout } from '@/components/global/content-layout';
import { PackageOpen, Search } from 'lucide-react';
import { useCurrentUser } from '@/app/hooks/user';
import { Note } from '@prisma/client';
import { Input } from '@/components/ui/input';
import NoteCard from '@/components/global/note-card';
import ShimmerCard from '@/components/shimmer/shimmer-card';
import GenerateSummaryDialog from '@/components/dialogs/create-summary-dialog';

const NotesPage = () => {
  const { session } = useCurrentUser();
  const [notes, setNotes] = useState<Note[]>([]); // Specify the type of notes
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Function to filter notes based on the search query
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    async function fetchNotes() {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userEmail: session.user.email }),
          });

          const data = await response.json();
          if (response.ok && data.notes) {
            setNotes(data.notes);
          } else {
            console.error(data.error || 'Failed to fetch notes');
          }
        } catch (error) {
          console.error('Error fetching notes:', error);
        } finally {
          setLoading(false); // Stop loading when data is fetched
        }
      }
    }

    fetchNotes();
  }, [session?.user?.email]);

  // const handleCreateNote = async () => {
  //   if (session?.user?.email) {
  //     try {
  //       const response = await fetch('/api/create-note', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({
  //           userEmail: session.user.email,
  //           title: 'New Note',
  //           content: 'Content of the note',
  //           isPublic: false,
  //         }),
  //       });

  //       const data = await response.json();
  //       if (response.ok && data.note) {
  //         setNotes((prevNotes) => [...prevNotes, data.note]);
  //       } else {
  //         console.error(data.error || 'Failed to create note');
  //       }
  //     } catch (error) {
  //       console.error('Error creating note:', error);
  //     }
  //   }
  // };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
  };

  return (
    <ContentLayout title="Summaries" className="!py-0">
      <div className="w-full flex flex-row items-center justify-between pt-8">
        <div className="flex flex-row items-center space-x-2.5">
          <div className="text-lg md:text-xl font-bold text-primary">Your Summaries</div>
          <span className="text-sm md:text-base font-medium bg-[#F4F0FF] size-6 md:size-7 rounded-md text-primary flex items-center justify-center">
            {notes.length}
          </span>
        </div>
        {/* <Button onClick={handleCreateNote} variant="default" className="hidden md:flex h-12 font-bold bg-[#6127FF] text-white px-6 rounded-lg">
          <span className="mr-2 text-lg">
            ✨
          </span>
          Generate
        </Button> */}
        <div className='hidden md:flex'>
          <GenerateSummaryDialog />
        </div>
      </div>

      {/* Sticky Search Input */}
      <div className="sticky top-0 z-10 w-full py-3 bg-white dark:bg-black">
        <div className="flex flex-row items-center w-full">
          <Search strokeWidth={2} className="size-6 text-primary/60" />
          <Input
            className="ml-2 p-0 text-base font-medium border-none w-full text-primary placeholder:text-primary/40"
            placeholder="Search summaries by title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query on input change
          />
        </div>
      </div>


      {/* {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <PackageOpen className="size-7 text-stone-300 dark:text-stone-600" />
            <p className="mt-4 text-primary/50 text-base">You have no notes yet.</p>
          </div>
        ) : (
          <div className="mt-2 bg-white dark:bg-black grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 pb-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                id={note.id}
                title={note.title}
                createdAt={note.createdAt}
              // onClick={() => router.push(`/notes/${note.id}`)}
              />
            ))}
          </div>
        )} */}

      {loading ? (
        <div className="mt-2 bg-white dark:bg-black grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 pb-28">
          {Array.from({ length: 6 }).map((_, index) => (
            <ShimmerCard key={index} />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <PackageOpen className="size-7 text-stone-300 dark:text-stone-600" />
          <p className="mt-4 text-primary/50 text-base">You have no notes yet.</p>
        </div>
      ) : (
        <div className="mt-2 bg-white dark:bg-black grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 pb-28">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              title={note.title}
              createdAt={note.createdAt}
              isPublic={note.isPublic} // Pass the isPublic property to NoteCard
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      )}

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 md:hidden">
        {/* <Button
          onClick={handleCreateNote}
          variant="default"
          className="h-12 w-44 max-w-xs font-bold bg-[#6127FF] text-white rounded-lg shadow-xl shadow-black/20"
        >
          <span className="mr-2 text-lg">✨</span> Generate
        </Button> */}
        <GenerateSummaryDialog />
      </div>

    </ContentLayout>
  );
};

export default NotesPage;
