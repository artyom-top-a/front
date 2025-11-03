"use client";
import { BorderBeam } from "../ui/border-beam";
import Image from "next/image";
import { motion } from "framer-motion"; // Import Framer Motion

export function SaasDemo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true }}
      className="relative w-full overflow-hidden rounded-lg shadow-md"
    >
      {/* Full-Width Image with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true }}
      >
        <Image
          // src="/hero-image.jpeg" // Replace with the correct image path
          src="/hero-image.jpg" // Replace with the correct image path
          alt="SaaS Demo"
          width={1920}
          height={1080}
          className="w-full h-auto object-cover border-[4px] border-gray-100"
        />
      </motion.div>

      {/* Border Beam with Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        viewport={{ once: true }}
      >
        <BorderBeam size={250} duration={12} delay={9} />
      </motion.div>
    </motion.div>
  );
}
