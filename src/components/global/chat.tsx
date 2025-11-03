import React, { FC, useRef, useEffect, useState, KeyboardEvent } from "react";
import { Textarea } from "../ui/textarea";
import { ArrowUp, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatProps {
    noteContent: string; // Note content passed from the parent
    onClose: () => void;
  }
  
  const Chat: FC<ChatProps> = ({ noteContent, onClose }) => {
    const chatEndRef = useRef<HTMLDivElement | null>(null);
  
    const [messages, setMessages] = useState<{ id: string; role: string; content: string }[]>([]);
    const [input, setInput] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
  
    useEffect(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages]);
  
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    };
  
    const handleSubmit = async (e: React.FormEvent | KeyboardEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
  
      // Add user message to the chat
      const userMessage = { id: crypto.randomUUID(), role: "user", content: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
  
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(({ id, ...rest }) => rest),
            noteContent, // Include the note content in the request
          }),
        });
  
        if (!response.body) {
          console.error("No response body from the API");
          return;
        }
  
        // Stream assistant's response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const assistantMessage = { id: crypto.randomUUID(), role: "assistant", content: "" };
  
        setMessages((prev) => [...prev, assistantMessage]);
  
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
  
          const chunk = decoder.decode(value);
          assistantMessage.content += chunk;
  
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id ? { ...msg, content: assistantMessage.content } : msg
            )
          );
        }
      } catch (error) {
        console.error("Error in handleSubmit:", error);
      } finally {
        setIsLoading(false);
      }
    };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white transition-all duration-500 ease-in-out">
      {/* Fixed Chat Header */}
      <div className="flex items-center justify-between px-5 md:px-8 py-1.5 bg-white border-b">
        <h2 className="text-sm md:text-base text-primary font-semibold">Chat with Note</h2>
        <div
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="w-full flex-1 overflow-y-auto pt-5 pb-3 px-5 md:px-8 ">
        {messages.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">Hello! 👋</div>
              <div className="text-sm text-gray-600">
                I&apos;m here to help you with your notes. Ask me anything or share your thoughts!
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-xl font-medium text-sm fade-in mb-[18px] ${
                  msg.role === "assistant"
                    ? "bg-gray-50 border text-primary/80"
                    : "bg-[#F4F0FF] text-[#661EDA] border-[#661EDA]/30"
                }`}
              >
                {/* <ReactMarkdown remarkPlugins={[remarkGfm]}> */}
                  {msg.content}
                {/* </ReactMarkdown> */}
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white px-5 md:px-8 pb-5 flex items-center">
        <Textarea
          className="relative border rounded-lg shadow-sm p-3.5 text-primary resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
          rows={3}
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button
          className="absolute bottom-8 right-9 md:right-12 flex items-center justify-center bg-[#6127FF] text-white size-7 rounded-full hover:bg-[#6127FF]/80"
          onClick={handleSubmit}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
