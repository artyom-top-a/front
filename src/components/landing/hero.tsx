"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const announcement = "GStudy is now public!";

  return (
    <div className="w-full flex flex-col justify-center items-center text-center mx-auto px-5">
      {/* Announcement Banner */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto mb-4 mt-36 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-purple-100 bg-purple-50 px-3 py-1 backdrop-blur transition-all hover:border-gray-200 hover:bg-gray-100"
      >
        <div className="text-sm font-semibold text-purple-500">
          <span className="mr-1">🚀</span> {announcement}
        </div>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl pb-4 text-[34px] font-bold md:text-[60px] lg:text-[72px] !leading-[1.1] pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-800/80 bg-clip-text text-transparent dark:from-black dark:to-slate-100/10"
      >
        Transform how you approach learning forever
      </motion.div>

      {/* Subtext */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6 max-w-prose text-zinc-400 sm:text-xl"
      >
        Create flashcards, generate summaries, and chat with your materials.
        Study smarter, collaborate seamlessly, and ace your exams effortlessly.
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex flex-row items-center justify-center gap-3 sm:gap-4 mt-2"
      >
        <Link href="/sign-up">
          <Button className="h-11 sm:h-12 text-[13px] sm:text-sm mb-12 rounded-md font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white">
            <span className="mr-2 text-[15px] sm:text-base">🌟</span> Get started for free
          </Button>
        </Link>

        <a href="https://discord.gg/7rPhBMteaD" target="_blank" rel="noopener noreferrer">
          <Button className="h-11 sm:h-12 text-[13px] sm:text-sm mb-12 rounded-md font-bold border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800">
            Join Discord
          </Button>
        </a>
      </motion.div>
    </div>
  );
}
