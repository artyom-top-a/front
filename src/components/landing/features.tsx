"use client"

import { motion } from "framer-motion";
import { BentoCard, BentoGrid } from "../ui/bento-grid";


// const features = [
//   {
//     emoji: "📚",
//     name: "Generate Flashcards with AI",
//     description:
//       "Create flashcards effortlessly with AI to simplify learning and master complex topics.",
//     href: "#",
//     cta: "Learn more",
//     bgColor: "bg-blue-600",
//     className: "col-span-5 lg:col-span-2",
//   },
//   {
//     emoji: "✍️",
//     name: "Generate Concise Summaries",
//     description:
//       "Turn lengthy documents or notes into clear, concise summaries and focus on what matters most.",
//     href: "#",
//     cta: "Learn more",
//     bgColor: "bg-green-600",
//     className: "col-span-5 lg:col-span-3",
//   },
//   {
//     emoji: "🤖",
//     name: "Chat with Your Notes",
//     description:
//       "Ask questions and get AI-powered answers to better understand your notes. Interact naturally to clarify concepts and quickly find the information you need.",
//     href: "#",
//     cta: "Learn more",
//     bgColor: "bg-purple-600",
//     className: "col-span-5 lg:col-span-3",
//   },
//   {
//     emoji: "🔗",
//     name: "Share Notes Effortlessly",
//     description:
//       "Share your notes with a public link and collaborate effortlessly with others.",
//     href: "#",
//     cta: "Learn more",
//     bgColor: "bg-yellow-600",
//     className: "col-span-5 lg:col-span-2",
//   },
// ];

type Feature = {
  image: string;
  name: string;
  description: string;
  href: string;
  cta: string;
  bgColor: string;
  className: string;
  imagePlacement?: "center" | "bottom"; // Restrict to the expected values
  imageWidth?: number;
  imageHeight?: number;
};

const features: Feature[] = [
  {
    image: "/feature-flash-cards.png",
    name: "Generate Flashcards with AI",
    description:
      "Create flashcards effortlessly with AI to simplify learning and master complex topics.",
    href: "#",
    cta: "Learn more",
    // bgColor: "bg-blue-600",
    bgColor: "bg-[#FFF0F2]",
    className: "col-span-5 lg:col-span-2",
    imagePlacement: "center",
    imageWidth: 340,
    imageHeight: 180,
  },
  {
    image: "/feature-summary.png",
    name: "Generate Concise Summaries",
    description:
      "Turn lengthy documents or notes into clear, concise summaries and focus on what matters most.",
    href: "#",
    cta: "Learn more",
    bgColor: "bg-[#F0FFF6]",
    className: "col-span-5 lg:col-span-3",
    imagePlacement: "bottom",
    imageWidth: 495,
    imageHeight: 245,
  },
  {
    image: "/feature-ai-chat.png",
    name: "Chat with Your Notes",
    description:
      "Ask questions and get AI-powered answers to better understand your notes. Interact naturally to clarify concepts and quickly find the information you need.",
    href: "#",
    cta: "Learn more",
    bgColor: "bg-[#EDECFF]/80",
    className: "col-span-5 lg:col-span-3",
    imagePlacement: "bottom",
    imageWidth: 404,
    imageHeight: 246,
  },
  {
    image: "/feature-share.png",
    name: "Share Notes Effortlessly",
    description:
      "Share your notes with a public link and collaborate effortlessly with others.",
    href: "#",
    cta: "Learn more",
    bgColor: "bg-[#F0F7FF]",
    className: "col-span-5 lg:col-span-2",
    imagePlacement: "center",
    imageWidth: 364,
    imageHeight: 137,
  },
];



export function Features() {
  return (
    <div className='container mt-40 pb-20'>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true }}
        className="mx-auto mt-4 w-full !max-w-2xl text-2xl font-bold sm:max-w-none sm:text-3xl md:text-[34px] !leading-[1.3]"
      >
        Redefine Productivity with These{" "}
        <span className="text-[#6127FF] !m-0 !p-0 !leading-none">Smart</span>{" "}
        Features.
      </motion.h2>
      <BentoGrid>
        {features.map((feature, idx) => (
          <BentoCard key={idx} {...feature} />
        ))}
      </BentoGrid>
    </div>
  );
}
