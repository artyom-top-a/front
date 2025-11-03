"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import SwitchToggle from "./switch-toggle";
import PlanCard from "./plan-card";

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const pricingPlans = [
    {
      title: "Free",
      description: "An excellent plan for getting started",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "10 free generations",
        "Practice with flashcards",
        "Share decks and summaries",
      ],
      highlight: false,
      href: "/signup",
      paymentLinkMonthly: undefined,
      paymentLinkAnnual: undefined,
    },
    {
      title: "Pro",
      description: "Boost your studies with premium tools.",
      monthlyPrice: 5,
      annualPrice: 50,
      features: [
        "100 generations per month",
        "Chat with documents",
        "High-priority support",
      ],
      highlight: true,
      href: "/api/auth/login",
      paymentLinkMonthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PLAN_LINK!,
      paymentLinkAnnual: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PLAN_LINK!,
    },
  ];

  return (
    <section id="pricing" className="relative">
      <div className="mx-auto flex max-w-screen-md flex-col gap-8 px-4 py-28 md:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Pricing
          </div>
          <div className="mt-3 text-xl leading-8 text-primary/60">
            Choose the plan that fits your needs — start for free or unlock{" "} 
            <strong className="text-[#6127FF]">advanced features</strong> for smarter studying and productivity.
          </div>
        </motion.div>

        {/* Switch for monthly/annual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="flex w-full items-center justify-center space-x-3"
        >
          <span className="text-primary/60">Annual</span>
          <SwitchToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          className="mx-auto max-w-3xl grid w-full justify-center grid-cols-1 md:grid-cols-2 gap-6 pb-6 md:!pb-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
          }}
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <PlanCard
                title={plan.title}
                description={plan.description}
                monthlyPrice={plan.monthlyPrice}
                annualPrice={plan.annualPrice}
                features={plan.features}
                highlight={plan.highlight}
                href={plan.href}
                paymentLink={
                  isAnnual ? plan.paymentLinkAnnual : plan.paymentLinkMonthly
                }
                isAnnual={isAnnual}
              />
            </motion.div>
          ))}
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mt-3 text-md underline leading-8 text-primary/60">
            Pro plan comes with a 14-day money-back guarantee for your peace of mind.
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
