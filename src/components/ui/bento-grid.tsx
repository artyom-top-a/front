"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion"; // Import Framer Motion
import { cn } from "@/lib/utils";
import Image from "next/image";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        visible: {
          transition: { staggerChildren: 0.15 }, // Staggered animations for children
        },
      }}
      className={cn(
        "grid w-full grid-cols-5 gap-6 mt-12",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

const BentoCard = ({
  name,
  className,
  emoji,
  description,
  image,
  imageWidth = 200,
  imageHeight = 200,
  imagePlacement = "center",
  bgColor,
}: {
  name: string;
  className: string;
  emoji?: string;
  description: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imagePlacement?: "center" | "bottom";
  bgColor?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    viewport={{ once: true }}
    key={name}
    className={cn(
      "group relative col-span-5 lg:col-span-3 flex flex-col justify-start overflow-hidden rounded-xl border h-auto",
      "transform transition-all duration-300",
      className
    )}
  >
    {/* Image or Emoji Container */}
    {/* <div
      className={cn(
        "w-full flex-shrink-0 h-72 flex px-4",
        imagePlacement === "center"
          ? "items-center justify-center"
          : "items-end justify-center",
        "rounded-t-xl bg-[#EDECFF]/80"
      )}
    > */}
    <div
      className={cn(
        "w-full flex-shrink-0 h-72 flex px-4",
        imagePlacement === "center"
          ? "items-center justify-center"
          : "items-end justify-center",
        bgColor || "bg-[#EDECFF]/80", // Apply dynamic background color
        "rounded-t-xl"
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={name}
          width={imageWidth}
          height={imageHeight}
          quality={100}
          className="object-contain"
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-lg shadow-md text-3xl bg-[#5922ff]/25",
          )}
        >
          {emoji}
        </div>
      )}
    </div>

    {/* Title and Description */}
    <div className="justify-center z-10 flex flex-col px-7 items-start pb-6 pt-6">
      <div className="text-base md:text-[17px] font-medium text-start">{name}</div>
      <div className="text-sm md:text-[15px] text-gray-500 dark:text-gray-400 text-start font-normal leading-none">
        {description}
      </div>
    </div>
  </motion.div>
);

export { BentoCard, BentoGrid };
