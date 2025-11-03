import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils"; // shadcn utility function for conditionally merging class names
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Trash2, Download } from "lucide-react"; // shadcn icons
import { Input } from "@/components/ui/input";

interface FileUploadProps {
  onFileChange: (files: File[]) => void;
  acceptedTypes?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, acceptedTypes = ".docx, .pdf, .pptx" }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file type
  const isValidFileType = (file: File) => {
    const validTypes = [
      "application/pdf",
      // "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      // "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    return validTypes.includes(file.type);
  };

  // const handleFileSelection = (selectedFiles: File[]) => {
  //   const validFiles = selectedFiles.filter(isValidFileType);
  //   const invalidFiles = selectedFiles.filter(file => !isValidFileType(file));

  //   if (invalidFiles.length > 0) {
  //     setError("Only PDF, PPT, and DOC files are allowed.");
  //   } else {
  //     setError(null);
  //   }

  //   const updatedFiles = [...files, ...validFiles];
  //   setFiles(updatedFiles);
  //   onFileChange(updatedFiles);
  // };

  const handleFileSelection = (selectedFiles: File[]) => {
    const validFile = selectedFiles.find(isValidFileType);
    if (validFile) {
      setFiles([validFile]); // Only one file allowed
      onFileChange([validFile]);
      setError(null);
    } else {
      setError("Only PDF, PPT, and DOC files are allowed.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFileSelection(selectedFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelection(droppedFiles);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleRemoveFile = (fileToRemove: File) => {
    const updatedFiles = files.filter((file) => file !== fileToRemove);
    setFiles(updatedFiles);
    onFileChange(updatedFiles);
  };

  const handleDownloadFile = (file: File) => {
    const fileURL = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(fileURL); // Clean up the URL after download
  };

  // Trigger file input click programmatically
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={cn(
          "cursor-pointer hover:bg-accent/50 w-full flex flex-col items-center justify-center px-4 py-6 border-2 rounded-lg transition-all duration-300 bg-white dark:bg-black",
          isDragOver ? "border-purple-500 bg-accent" : "border-dashed",
          error ? "border-red-500" : ""
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick} // Handle click to open file selection dialog
      >
        <div className="flex-shrink-0 flex items-center justify-center bg-accent rounded-md size-10">
          <UploadCloud className="size-6 text-primary/60" />
        </div>
        <label className="text-center text-primary text-sm font-semibold mt-2">
          {"Upload Files"}
        </label>
        <div className="text-primary/60 text-xs mt-2 text-center">
        {isDragOver ? "Release to upload" : "Drag or click to upload (PDF, max 10MB, 100 pages, 10k words)"}

        </div>

        {/* Hidden file input */}
        <Input
          ref={fileInputRef} // Reference to trigger file input programmatically
          type="file"
          accept={acceptedTypes}
          // multiple
          multiple={false}
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>

      {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}

      {/* Display selected files */}
      <div className="mt-4 space-y-4">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between bg-card rounded-md px-5 py-3 border">
            <div className="flex items-center space-x-2">
              <FileText className="size-5 text-primary mr-2" />
              <div>
                <div className="text-sm font-medium text-primary">{file.name}</div>
                <div className="text-xs text-primary/60">{(file.size / 1024).toFixed(2)} KB</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => handleDownloadFile(file)}>
                <Download className="h-4 w-4 text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUpload;


// "use client"

// import { useState, useRef, useCallback } from 'react';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { UploadCloud, FileText, Trash2, Download, Edit } from 'lucide-react';
// import RangeSlider from './range-slider';

// interface FileUploadProps {
//   onFileChange: (file: File | null, pages: number[]) => void;
//   acceptedTypes?: string;
// }

// export default function FileUpload({ onFileChange, acceptedTypes = '.pdf' }: FileUploadProps) {
//   const [file, setFile] = useState<File | null>(null);
//   const [numPages, setNumPages] = useState(0);
//   const [startPage, setStartPage] = useState(1);
//   const [endPage, setEndPage] = useState(1);
//   const [error, setError] = useState<string | null>(null);
//   const [isDragOver, setIsDragOver] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileSelection = async (f: File) => {
//     if (!f.type.includes('pdf')) {
//       setError('Only PDF files allowed');
//       return;
//     }
//     setError(null);
//     setFile(f);

//     const fd = new FormData();
//     fd.append('file', f);
//     try {
//       const res = await fetch('/api/pdf-info', { method: 'POST', body: fd });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Cannot read PDF');
//       const pages = data.numPages;
//       setNumPages(pages);
//       setStartPage(1);
//       setEndPage(Math.min(35, pages));
//       setDialogOpen(true);
//     } catch (e: any) {
//       setError(e.message);
//       setFile(null);
//     }
//   };

//   const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragOver(false);
//     const f = e.dataTransfer.files[0];
//     if (f) handleFileSelection(f);
//   }, []);

//   const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragOver(true);
//   }, []);

//   const handleDragLeave = useCallback(() => {
//     setIsDragOver(false);
//   }, []);

//   const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0];
//     if (f) handleFileSelection(f);
//   };

//   const confirm = () => {
//     const count = endPage - startPage + 1;
//     if (count < 1 || count > 35) {
//       setError('Select between 1 and 35 pages');
//       return;
//     }
//     setDialogOpen(false);
//     const pages = Array.from({ length: count }, (_, i) => startPage + i);
//     onFileChange(file, pages);
//   };

//   const handleRemove = () => {
//     setFile(null);
//     onFileChange(null, []);
//   };

//   const handleDownload = () => {
//     if (!file) return;
//     const url = URL.createObjectURL(file);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = file.name;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="w-full max-w-3xl mx-auto">
//       <div
//         className={cn(
//           'cursor-pointer hover:bg-accent/50 w-full flex flex-col items-center justify-center px-4 py-6 border-2 rounded-lg transition-all duration-300 bg-white dark:bg-black',
//           isDragOver ? 'border-purple-500 bg-accent' : 'border-dashed',
//           error ? 'border-red-500' : ''
//         )}
//         onClick={() => fileInputRef.current?.click()}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//       >
//         <div className="flex-shrink-0 flex items-center justify-center bg-accent rounded-md size-10">
//           <UploadCloud className="size-6 text-primary/60" />
//         </div>
//         <label className="text-center text-primary text-sm font-semibold mt-2">
//           Upload PDF
//         </label>
//         <div className="text-primary/60 text-xs mt-2 text-center">
//           {isDragOver ? 'Release to upload' : 'Drag or click to upload (PDF, max 35 pages)'}
//         </div>

//         <Input
//           ref={fileInputRef}
//           type="file"
//           accept={acceptedTypes}
//           className="absolute inset-0 opacity-0 cursor-pointer"
//           onChange={onInputChange}
//         />
//       </div>

//       {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}

//       {file && (
//         <div className="mt-4 space-y-4">
//           <div className="flex items-center justify-between bg-card rounded-md px-5 py-3 border">
//             <div className="flex items-center space-x-4">
//               <FileText className="size-5 text-primary" />
//               <div>
//                 <div className="text-sm font-medium text-primary">{file.name}</div>
//                 <div className="text-xs text-primary/60">
//                   Pages: {startPage}–{endPage}
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Button variant="ghost" size="icon" onClick={() => setDialogOpen(true)}>
//                 <Edit className="h-4 w-4 text-gray-500" />
//               </Button>
//               <Button variant="ghost" size="icon" onClick={handleDownload}>
//                 <Download className="h-4 w-4 text-gray-500" />
//               </Button>
//               <Button variant="ghost" size="icon" onClick={handleRemove}>
//                 <Trash2 className="h-4 w-4 text-red-500" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Select page range (max 35)</DialogTitle>
//             <DialogDescription>
//               Choose which pages you want to use from the PDF. Enter the first and last page number to define the range.
//             </DialogDescription>
//           </DialogHeader>
//           <RangeSlider
//             min={1}
//             max={numPages}
//             start={startPage}
//             end={endPage}
//             onChange={(s, e) => {
//               setStartPage(s);
//               setEndPage(e);
//             }}
//           />
//           <DialogFooter>
//             <Button className="w-full font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white" onClick={confirm}>
//               Confirm
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
