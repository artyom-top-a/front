"use client"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { faqs } from '@/data/faqs';
import { ChevronRight } from 'lucide-react';
import { motion } from "framer-motion";

export function FAQ() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="container pt-10 pb-20 px-4 md:!px-0"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        className="text-sm text-zinc-400 font-mono font-medium tracking-wider uppercase"
      >
        FAQ
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="mx-auto mt-4 max-w-xs text-2xl font-semibold sm:max-w-none sm:text-4xl md:text-5xl !leading-[1.4] md:!leading-[1.2]"
      >
        Frequently asked questions
      </motion.div>
      <Accordion
        className="flex w-full max-w-4xl mx-auto flex-col mt-16 divide-y divide-zinc-100"
        type="multiple"
      >
        {faqs.map((item, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          >
            <AccordionItem value={`item-${index}`} className="py-3">
              <AccordionTrigger className="w-full py-0.5 text-xl text-left text-zinc-800">
                <div className="flex items-center">
                  <ChevronRight className="flex-shrink-0 size-4 md:size-5 transition-transform duration-200 group-data-[state=open]:rotate-90 text-zinc-800" />
                  <div className="text-[17px] md:text-xl ml-2 text-zinc-800 pr-5">
                    {item.question}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                  className="text-[15px] md:text-base text-left pl-7 pr-2 text-zinc-500"
                >
                  {item.answer}
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </motion.div>
  );
}
