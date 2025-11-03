"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import Link from "next/link";

const CTA: React.FC = () => {
  return (
    <section id="cta" className="w-full mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-[#6127FF] rounded-xl py-16 shadow-2xl"
      >
        <div className="relative w-full mx-auto px-4 py-16">
          {/* Heading Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="text-center pb-6 mx-auto"
          >
            <div className="text-sm text-zinc-300 font-mono font-medium tracking-wider uppercase">
              Ready to get started?
            </div>
            <div className="text-white mx-auto mt-2 w-full !max-w-2xl text-3xl font-semibold sm:max-w-none sm:text-4xl md:text-5xl !leading-snug">
              Start Learning Smarter with Free Generations
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
            className="flex flex-col w-full sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link href={"/sign-up"}>
              <Button className="h-12 px-6 text-base rounded-md font-bold text-[#6127FF] hover:text-[#6127FF]/80 bg-white hover:bg-gray-50/95">
                Get started for free
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;
