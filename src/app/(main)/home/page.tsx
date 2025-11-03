'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation'; // For client-side navigation
import { ContentLayout } from '@/components/global/content-layout';
import { Compass, File, Type, Youtube } from 'lucide-react';
import FileUpload from '@/components/global/file-upload';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from '@/components/global/loader';
import { FormError } from '@/components/forms/form-error';
import { getUserGenerations } from '@/app/actions/getUserGenerations';
import { useToast } from '@/hooks/use-toast';
import PricingDialog from '@/components/dialogs/pricing-dialog';

type Payload =
  | { url: string } // For YouTube and Web Link
  | { content: string } // For Text
  | FormData;

export default function HomePage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // const [pending, setPending] = useState(false);
  // const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'summary'>('flashcards');
  const [selectedType, setSelectedType] = useState<string>('pdf');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const router = useRouter();

  const { toast } = useToast();

  const htmlToPlainText = (htmlString: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString; // Parse HTML
    return tempDiv.textContent || tempDiv.innerText || ''; // Extract plain text
  };

  const buttonData = [
    { title: 'PDF File', icon: <File />, color: '#63C98F', type: 'pdf' },
    { title: 'YouTube', icon: <Youtube />, color: '#ED524A', type: 'youtube' },
    { title: 'Web Link', icon: <Compass />, color: '#AC4AED', type: 'web' },
    { title: 'Text', icon: <Type />, color: '#63C2C9', type: 'text' },
  ];

  const validateInputs = () => {
    switch (selectedType) {
      case 'pdf':
        if (!file) return 'Please upload a file first!';
        break;
      case 'youtube':
        if (!youtubeUrl) return 'Please enter a valid YouTube URL!';
        break;
      case 'web':
        if (!webUrl) return 'Please enter a valid web URL!';
        break;
      case 'text':
        if (!textInput || textInput.trim() === '') return 'Please enter some text!';
        const textWordCount = textInput.trim().split(/\s+/).length;
        if (textWordCount > 2000) return `Text exceeds the limit of 2,000 words (${textWordCount} words).`;
        break;
      default:
        return 'Invalid selection.';
    }
    return null;
  };

  const handleTabSwitch = (tab: 'flashcards' | 'summary') => {
    setActiveTab(tab);
  };

  const handleSelection = (type: string) => {
    setSelectedType(type);
  };

  const handleFileChange = (selectedFiles: File[]) => {
    setFile(selectedFiles[0] || null); // Take the first file
  };

  const handleGenerate = async () => {

    const error = validateInputs();
    if (error) {
      setErrorMessage(error);
      return;
    }

    setErrorMessage(undefined);



    const isSummary = activeTab === 'summary'; // Determine if it's summary mode
    const route = `/api/${isSummary ? 'generate-summary' : 'flashcards'}/${selectedType}`;

    let payload: Payload; // Initialize the payload based on selected type
    let response: Response | undefined; // Ensure response is properly typed

    try {

      const generationCheck = await getUserGenerations();

      if (!generationCheck.success) {
        toast({
          title: "Error",
          description: "Error fetching user data. Please try again.",
        });
        return;
      }

      const remainingGenerations =
        generationCheck.generations - generationCheck.generationsUsedThisMonth;

      if (remainingGenerations <= 0) {
        setShowUpgradeModal(true); // Show upgrade modal
        return;
      }

      setLoading(true);
      // Handle different types of input
      if (selectedType === 'pdf') {
        if (!file) {
          toast({
            title: "Error",
            description: "Please upload a file first!",
          });
          return;
        }

        const formData = new FormData();
        formData.append('file', file);

        response = await fetch(route, {
          method: 'POST',
          body: formData,
        });
      }


      else if (selectedType === 'youtube') {
        if (!youtubeUrl) {
          toast({
            title: "Error",
            description: "Please enter a valid YouTube URL!",
          });
          return;
        }

        payload = { url: youtubeUrl };
        response = await fetch(route, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }


      else if (selectedType === 'web') {
        if (!webUrl) {
          toast({
            title: "Error",
            description: "Please enter a valid web URL!",
          });
          return;
        }

        payload = { url: webUrl };
        response = await fetch(route, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }


      else if (selectedType === 'text') {
        if (!textInput) {
          toast({
            title: "Error",
            description: "Please enter valid text!",
          });
          return;
        }

        if (!textInput || textInput.trim() === '') {
          toast({
            title: "Error",
            description: "Please enter valid text!",
          });
          return;
        }

        // Convert HTML to plain text
        const plainText = htmlToPlainText(textInput);

        console.log('Converted Plain Text:', plainText);

        payload = { content: plainText };

        // payload = { text: textInput };
        response = await fetch(route, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      // Ensure response exists
      if (!response) {
        throw new Error('No response from server.');
      }

      // Handle the response
      const data = await response.json();

      if (response.ok) {
        if (isSummary && data.notes && data.notes.id) {
          router.push(`/notes/${data.notes.id}`);
        } else if (!isSummary && data.deckId) {
          router.push(`/edit-deck/${data.deckId}`);
        } else {
          toast({
            title: "Error",
            description: "No valid data returned from the server.",
          });
        }
      } else {
        toast({
          title: "Error",
          description: `Error: ${data.error || 'Something went wrong!'}`,
        });
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "An error occurred while generating the content.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentLayout title="Home" className='pt-0'>
      {/* <div className="h-full w-full flex flex-col items-center justify-center pb-24 overflow-y-auto scrollbar-hide"> */}
      <div className="h-full w-full flex flex-col items-center justify-start pt-[48px] md:pt-[104px] pb-24 overflow-y-auto scrollbar-hide">
        <div className="text-primary font-black text-xl md:text-2xl">Start generating Content</div>

        <div className="text-[15px] md:text-base text-center w-full max-w-3xl text-primary/60 mb-1">
          Quickly turn YouTube videos, PDFs, web links, or text into tailored insights for your study.
        </div>

        {/* Tabs */}
        <div className="flex mb-8 mt-4 bg-gray-50 rounded-md border">
          <Button
            onClick={() => handleTabSwitch('flashcards')}
            className={`px-6 md:px-8 py-2 rounded-lg transition-all duration-300 ${activeTab === 'flashcards'
              ? 'bg-[#6127FF] text-white hover:bg-[#6127FF]/80'
              : 'bg-gray-50 text-black hover:bg-gray-100'
              }`}
          >
            Flash Cards
          </Button>
          <Button
            onClick={() => handleTabSwitch('summary')}
            className={`px-6 md:px-8 py-2 rounded-lg transition-all duration-300 ${activeTab === 'summary'
              ? 'bg-[#6127FF] text-white hover:bg-[#6127FF]/80'
              : 'bg-gray-50 text-black hover:bg-gray-100'
              }`}
          >
            Summary
          </Button>
        </div>

        {/* Grid of Buttons */}
        <div className="grid grid-cols-2 gap-3.5 md:gap-4 w-full max-w-3xl mb-6">
          {buttonData.map((button) => (
            <div
              key={button.type}
              onClick={() => handleSelection(button.type)}
              className={`flex flex-row items-center justify-start text-sm md:text-base p-4 md:p-5 text-black font-semibold rounded-md cursor-pointer transition-all duration-300 ${selectedType === button.type
                ? 'bg-white border-2 border-[#6127FF]'
                : 'bg-[#FCFCFC] border border-gray-100'
                }`}
            >
              <div
                style={{ backgroundColor: button.color }}
                className="size-7 md:size-9 rounded-md flex items-center justify-center  text-white mr-3 md:mr-4"
              >
                <div className="flex items-center justify-center size-4 md:size-5">{button.icon}</div>
              </div>
              {button.title}
            </div>
          ))}
        </div>

        {/* Dynamic Content */}
        {selectedType === 'pdf' && (
          <div className="w-full max-w-3xl transition-opacity duration-500">
            <FileUpload onFileChange={handleFileChange} />
          </div>
        )}

        {selectedType === 'youtube' && (
          <div className="w-full max-w-3xl transition-opacity duration-1000">
            <Input
              placeholder="Enter a YouTube URL (max: 2 hours)"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>
        )}

        {selectedType === 'web' && (
          <div className="w-full max-w-3xl transition-opacity duration-500">
            <Input
              placeholder="Enter a web link (max 5k words)"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
            />
          </div>
        )}

        {selectedType === 'text' && (
          <div className="w-full max-w-3xl transition-opacity duration-500">
            <Textarea
              placeholder="Paste your text here (max 2k words)"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="text-primary w-full p-4 border rounded-md focus:ring focus:ring-[#6127FF]"
              rows={6}
            ></Textarea>
          </div>
        )}


        <div className={`w-full max-w-3xl ${errorMessage ? 'mt-4' : ''
          }`}>
          <FormError message={errorMessage} />
        </div>

        <Button
          onClick={handleGenerate}
          className="w-full max-w-3xl mt-4 h-11 font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white rounded-lg"
        >
          <Loader loading={loading}>{activeTab === 'summary' ? 'Generate Summary' : 'Generate Flashcards'}</Loader>
        </Button>
      </div>
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        // <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        //   <DialogContent>
        //     <DialogHeader>
        //       <DialogTitle>Upgrade Your Plan</DialogTitle>
        //       <DialogDescription>
        //         You have reached your generation limit. Upgrade your plan to access more features.
        //       </DialogDescription>
        //     </DialogHeader>
        //     <DialogFooter>
        //       <DialogClose asChild>
        //         <Button variant="outline">Close</Button>
        //       </DialogClose>
        //       <Button
        //         onClick={() => {
        //           setShowUpgradeModal(false);
        //           router.push('/pricing'); // Redirect to pricing page
        //         }}
        //         className="bg-[#6127FF] hover:bg-[#6127FF]/80 text-white"
        //       >
        //         Upgrade Now
        //       </Button>
        //     </DialogFooter>
        //   </DialogContent>
        // </Dialog>


        <PricingDialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
      )}
    </ContentLayout>
  );
}




// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { useRouter } from 'next/navigation'; // For client-side navigation
// import { ContentLayout } from '@/components/global/content-layout';
// import { Compass, File, Type, Youtube } from 'lucide-react';
// import FileUpload from '@/components/global/file-upload';
// import { Textarea } from '@/components/ui/textarea';
// import { Loader } from '@/components/global/loader';
// import { FormError } from '@/components/forms/form-error';
// import { getUserGenerations } from '@/app/actions/getUserGenerations';
// import { useToast } from '@/hooks/use-toast';
// import PricingDialog from '@/components/dialogs/pricing-dialog';

// type Payload =
//   | { url: string } // For YouTube and Web Link
//   | { content: string } // For Text
//   | FormData;

// export default function HomePage() {
//   const [youtubeUrl, setYoutubeUrl] = useState('');
//   const [webUrl, setWebUrl] = useState('');
//   const [textInput, setTextInput] = useState('');
//   const [file, setFile] = useState<File | null>(null);
//   const [pages, setPages] = useState<number[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState<'flashcards' | 'summary'>('flashcards');
//   const [selectedType, setSelectedType] = useState<string>('pdf');
//   const [errorMessage, setErrorMessage] = useState<string>();
//   const [showUpgradeModal, setShowUpgradeModal] = useState(false);

//   const router = useRouter();
//   const { toast } = useToast();

//   const htmlToPlainText = (htmlString: string) => {
//     const tempDiv = document.createElement('div');
//     tempDiv.innerHTML = htmlString;
//     return tempDiv.textContent || tempDiv.innerText || '';
//   };

//   const buttonData = [
//     { title: 'PDF File', icon: <File />, color: '#63C98F', type: 'pdf' },
//     { title: 'YouTube', icon: <Youtube />, color: '#ED524A', type: 'youtube' },
//     { title: 'Web Link', icon: <Compass />, color: '#AC4AED', type: 'web' },
//     { title: 'Text', icon: <Type />, color: '#63C2C9', type: 'text' },
//   ];

//   const validateInputs = () => {
//     switch (selectedType) {
//       case 'pdf':
//         if (!file) return 'Please upload a file first!';
//         if (pages.length === 0) return 'Please select at least one page!';
//         break;
//       case 'youtube':
//         if (!youtubeUrl) return 'Please enter a valid YouTube URL!';
//         break;
//       case 'web':
//         if (!webUrl) return 'Please enter a valid web URL!';
//         break;
//       case 'text':
//         if (!textInput.trim()) return 'Please enter some text!';
//         const textWordCount = textInput.trim().split(/\s+/).length;
//         if (textWordCount > 2000) return `Text exceeds the limit of 2,000 words (${textWordCount} words).`;
//         break;
//       default:
//         return 'Invalid selection.';
//     }
//     return null;
//   };

//   const handleTabSwitch = (tab: 'flashcards' | 'summary') => setActiveTab(tab);
//   const handleSelection = (type: string) => setSelectedType(type);
//   const handleFileChange = (f: File | null, p: number[]) => {
//     setFile(f);
//     setPages(p);
//   };

//   const handleGenerate = async () => {
//     const error = validateInputs();
//     if (error) {
//       setErrorMessage(error);
//       return;
//     }
//     setErrorMessage(undefined);

//     const isSummary = activeTab === 'summary';
//     const route = `/api/${isSummary ? 'generate-summary' : 'flashcards'}/${selectedType}`;

//     let response: Response | undefined;

//     try {
//       const generationCheck = await getUserGenerations();
//       if (!generationCheck.success) {
//         toast({ title: 'Error', description: 'Error fetching user data. Please try again.' });
//         return;
//       }
//       const remaining = generationCheck.generations - generationCheck.generationsUsedThisMonth;
//       if (remaining <= 0) {
//         setShowUpgradeModal(true);
//         return;
//       }

//       setLoading(true);
//       if (selectedType === 'pdf') {
//         const formData = new FormData();
//         formData.append('file', file!);
//         formData.append('pages', JSON.stringify(pages));
//         response = await fetch(route, { method: 'POST', body: formData });
//       } else if (selectedType === 'youtube') {
//         response = await fetch(route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: youtubeUrl }) });
//       } else if (selectedType === 'web') {
//         response = await fetch(route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: webUrl }) });
//       } else if (selectedType === 'text') {
//         const plain = htmlToPlainText(textInput);
//         response = await fetch(route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: plain }) });
//       }

//       if (!response) throw new Error('No response from server.');
//       const data = await response.json();

//       if (response.ok) {
//         if (isSummary && data.notes?.id) router.push(`/notes/${data.notes.id}`);
//         else if (!isSummary && data.deckId) router.push(`/edit-deck/${data.deckId}`);
//         else toast({ title: 'Error', description: 'No valid data returned from the server.' });
//       } else {
//         toast({ title: 'Error', description: `Error: ${data.error || 'Something went wrong!'}` });
//       }
//     } catch (err) {
//       console.error('Error generating content:', err);
//       toast({ title: 'Error', description: 'An error occurred while generating the content.' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ContentLayout title="Home" className="pt-0">
//       <div className="h-full w-full flex flex-col items-center justify-start pt-[48px] md:pt-[104px] pb-24 overflow-y-auto scrollbar-hide">
//         <div className="text-primary font-black text-xl md:text-2xl">Start generating Content</div>
//         <div className="text-[15px] md:text-base text-center w-full max-w-3xl text-primary/60 mb-1">
//           Quickly turn YouTube videos, PDFs, web links, or text into tailored insights for your study.
//         </div>

//         <div className="flex mb-8 mt-4 bg-gray-50 rounded-md border">
//           <Button onClick={() => handleTabSwitch('flashcards')} className={`px-6 md:px-8 py-2 rounded-lg transition-all duration-300 ${activeTab === 'flashcards' ? 'bg-[#6127FF] text-white hover:bg-[#6127FF]/80' : 'bg-gray-50 text-black hover:bg-gray-100'}`}>Flash Cards</Button>
//           <Button onClick={() => handleTabSwitch('summary')} className={`px-6 md:px-8 py-2 rounded-lg transition-all duration-300 ${activeTab === 'summary' ? 'bg-[#6127FF] text-white hover:bg-[#6127FF]/80' : 'bg-gray-50 text-black hover:bg-gray-100'}`}>Summary</Button>
//         </div>

//         <div className="grid grid-cols-2 gap-3.5 md:gap-4 w-full max-w-3xl mb-6">
//           {buttonData.map(button => (
//             <div key={button.type} onClick={() => handleSelection(button.type)} className={`flex flex-row items-center justify-start text-sm md:text-base p-4 md:p-5 text-black font-semibold rounded-md cursor-pointer transition-all duration-300 ${selectedType === button.type ? 'bg-white border-2 border-[#6127FF]' : 'bg-[#FCFCFC] border border-gray-100'}`}>              <div style={{ backgroundColor: button.color }} className="size-7 md:size-9 rounded-md flex items-center justify-center text-white mr-3 md:mr-4">{button.icon}</div>
//               {button.title}
//             </div>
//           ))}
//         </div>

//         {selectedType === 'pdf' && <div className="w-full max-w-3xl transition-opacity duration-500"><FileUpload onFileChange={handleFileChange} /></div>}
//         {selectedType === 'youtube' && <div className="w-full max-w-3xl transition-opacity duration-1000"><Input placeholder="Enter a YouTube URL (max: 1 hour or 12k words)" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} /></div>}
//         {selectedType === 'web' && <div className="w-full max-w-3xl transition-opacity duration-500"><Input placeholder="Enter a web link (max 5k words)" value={webUrl} onChange={e => setWebUrl(e.target.value)} /></div>}
//         {selectedType === 'text' && <div className="w-full max-w-3xl transition-opacity duration-500"><Textarea placeholder="Paste your text here (max 2k words)" value={textInput} onChange={e => setTextInput(e.target.value)} className="text-primary w-full p-4 border rounded-md focus:ring focus:ring-[#6127FF]" rows={6} /></div>}

//         {errorMessage && <div className="w-full max-w-3xl mt-4"><FormError message={errorMessage} /></div>}

//         <Button onClick={handleGenerate} className="w-full max-w-3xl mt-4 h-11 font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white rounded-lg">
//           <Loader loading={loading}>{activeTab === 'summary' ? 'Generate Summary' : 'Generate Flashcards'}</Loader>
//         </Button>
//       </div>

//       {showUpgradeModal && <PricingDialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />}
//     </ContentLayout>
//   );
// }
