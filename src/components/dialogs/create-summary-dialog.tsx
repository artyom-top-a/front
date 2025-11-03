import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/global/file-upload";
import { Loader } from "@/components/global/loader";
import { Compass, File, Type, Youtube } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { getUserGenerations } from "@/app/actions/getUserGenerations";
import { FormError } from "../forms/form-error";
import PricingDialog from "./pricing-dialog";

const GenerateSummaryDialog = () => {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("pdf");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const router = useRouter();

  const handleFileChange = (selectedFiles: File[]) => {
    setFile(selectedFiles[0] || null);
  };


  const validateInputs = () => {
    switch (selectedType) {
      case "pdf":
        if (!file) return "Please upload a file.";
        break;
      case "youtube":
        if (!youtubeUrl) return "Please enter a valid YouTube URL.";
        break;
      case "web":
        if (!webUrl) return "Please enter a valid web link.";
        break;
      case "text":
        if (!textInput || textInput.trim() === "") return "Please enter some text.";
        break;
      default:
        return "Invalid input type.";
    }
    return undefined;
  };

  const handleGenerate = async () => {

    const error = validateInputs();
    if (error) {
      setErrorMessage(error);
      return;
    }

    setErrorMessage(undefined);

    setLoading(true);
    const route = `/api/generate-summary/${selectedType}`;
    let payload: Record<string, unknown> = {};
    let response: Response | undefined;

    try {

      const generationCheck = await getUserGenerations();

      if (!generationCheck.success) {
        alert("Error fetching user data. Please try again.");
        return;
      }

      const remainingGenerations =
        generationCheck.generations - generationCheck.generationsUsedThisMonth;

      if (remainingGenerations <= 0) {
        // If no generations are available, close the current modal and open the upgrade modal
        setShowGenerateModal(false);
        setShowUpgradeModal(true);
        return;
      }



      if (selectedType === "pdf" && file) {
        const formData = new FormData();
        formData.append("file", file);

        response = await fetch(route, {
          method: "POST",
          body: formData,
        });
      } else if (selectedType === "youtube" && youtubeUrl) {
        payload = { url: youtubeUrl };
        response = await fetch(route, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (selectedType === "web" && webUrl) {
        payload = { url: webUrl };
        response = await fetch(route, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (selectedType === "text" && textInput) {
        payload = { text: textInput };
        response = await fetch(route, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        alert("Please provide the required input for the selected type.");
        return;
      }

      if (!response) {
        throw new Error("No response from server.");
      }

      const data = await response.json();

      if (response.ok) {
        if (data.notes && data.notes.id) {
          router.push(`/notes/${data.notes.id}`);
        } else {
          alert('No valid data returned from the server.');
        }
      } else {
        alert(`Error: ${data.error || 'Something went wrong!'}`);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      alert("An error occurred while generating the content.");
    } finally {
      setLoading(false);
    }
  };


  const buttonData = [
    { title: 'PDF File', icon: <File />, color: '#63C98F', type: 'pdf' },
    { title: 'YouTube', icon: <Youtube />, color: '#ED524A', type: 'youtube' },
    { title: 'Web Link', icon: <Compass />, color: '#AC4AED', type: 'web' },
    { title: 'Text', icon: <Type />, color: '#63C2C9', type: 'text' },
  ];

  const handleSelection = (type: string) => {
    setSelectedType(type);
  };

  return (
    <>
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogTrigger>
          <Button className="h-12 font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white px-6 rounded-lg w-44 md:w-auto max-w-xs shadow-xl shadow-black/20 md:shadow-none">
            <span className="mr-2 text-lg">✨</span>
            Generate
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Content</DialogTitle>
            <DialogDescription>
              Select the type of content and provide necessary details to start generation.
            </DialogDescription>
          </DialogHeader>

          {/* Selection Buttons */}
          {/* Selection Buttons */}
          <div className="grid grid-cols-2 gap-3.5 md:gap-4 w-full max-w-3xl">
            {buttonData.map((button) => (
              <div
                key={button.type}
                onClick={() => handleSelection(button.type)}
                className={`flex flex-row items-center justify-start text-sm md:text-[15px] p-4 text-black font-semibold rounded-md cursor-pointer transition-all duration-300 ${selectedType === button.type
                    ? 'bg-white border-2 border-[#6127FF]'
                    : 'bg-[#FCFCFC] border border-gray-100'
                  }`}
              >
                <div
                  style={{ backgroundColor: button.color }}
                  className="size-7 md:size-8 rounded-md flex items-center justify-center text-white mr-3"
                >
                  <div className="flex items-center justify-center size-4 md:size-[18px]">{button.icon}</div>
                </div>
                {button.title}
              </div>
            ))}
          </div>

          {/* Input Fields */}
          <div className="mt-2">
            {selectedType === "pdf" && <FileUpload onFileChange={handleFileChange} />}
            {selectedType === "youtube" && (
              <Input
                placeholder="https://youtube.com/your-video-url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            )}
            {selectedType === "web" && (
              <Input
                placeholder="Enter a web link (e.g., https://example.com)"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
              />
            )}
            {selectedType === "text" && (
              <Textarea
                placeholder="Paste your text here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={4}
              />
            )}
          </div>

          <div className={`w-full max-w-3xl ${errorMessage ? 'mt-0' : ''
            }`}>
            <FormError message={errorMessage} />
          </div>

          <DialogFooter>
            <Button onClick={handleGenerate} disabled={loading} className="w-full h-12 font-bold bg-[#6127FF] text-white">
              <Loader loading={loading}>Generate</Loader>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <PricingDialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
      )}
    </>
  );
};

export default GenerateSummaryDialog;