"use client";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const About: React.FC = () => {
  return (
    <section id="about" className="w-full mt-28 md:!pt-40 md:!pb-7">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mx-auto inline-flex items-center gap-2 text-sm font-semibold text-purple-500 bg-purple-50 rounded-full px-4 py-1 border border-purple-500"
        >
          <span className="text-lg">🧠</span>
          Study Smarter
        </motion.div>

        {/* Title and Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl text-center items-center mt-4"
        >
          <div className="max-w-5xl pb-4 text-[22px] font-bold md:text-[30px] lg:text-[42px] !leading-[1.4] md:!leading-[1.2] pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-800/80 bg-clip-text text-transparent dark:from-black dark:to-slate-100/10">
            Instantly transform videos, documents, and articles into AI-generated flashcards and summaries for{" "}
            <span className="text-[#6127FF] !m-0 !p-0 !leading-none">smarter</span> studying.
          </div>
        </motion.div>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.3 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <Link href="/sign-up">
            <Button className="mt-4 h-12 text-sm md:text-base mb-12 rounded-md font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white flex items-center">
              Try with free generations{" "}
              <ArrowUpRight strokeWidth={3} className="ml-2 size-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
