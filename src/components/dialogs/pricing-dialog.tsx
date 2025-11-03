"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SwitchToggle from "@/components/landing/switch-toggle";
import PlanCard from "../global/pricing-card";

interface PricingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }


const PricingDialog: React.FC<PricingDialogProps> = ({ open, onOpenChange }) => {
  const [isAnnual, setIsAnnual] = useState(true);

//   const [userGenerations, setUserGenerations] = useState({
//     generations: 0,
//     generationsUsedThisMonth: 0,
//   });

  const pricingPlans = [
    {
      title: "Free",
      description: "An excellent plan for getting started",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "Basic AI tools",
        "Community support",
        "1 project limit",
      ],
      highlight: false,
      href: "/signup",
      paymentLinkMonthly: undefined,
      paymentLinkAnnual: undefined,
    },
    {
      title: "Pro",
      description: "Advanced features for professionals",
      monthlyPrice: 5,
      annualPrice: 50,
      features: [
        "Advanced AI insights",
        "Priority support",
        "Unlimited projects",
        "Access to all AI tools",
        "Custom integrations",
      ],
      highlight: true,
      href: "/api/auth/login",
      paymentLinkMonthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PLAN_LINK!,
      paymentLinkAnnual: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PLAN_LINK!,
    },
  ];

  return (

    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[100%] overflow-hidden z-50 w-full flex flex-col p-6 sm:p-6 max-w-full h-full items-center justify-center no-scrollbar">
      <div className="flex-1 overflow-y-auto w-full mx-auto flex max-w-screen-xl flex-col gap-8 px-4 pt-28 md:!pt-0 md:px-8 no-scrollbar md:justify-center">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-xl font-bold tracking-tight text-primary sm:text-3xl">
            Upgrade your plan
          </div>
          <div className="mt-3 text-xl leading-8 text-primary/60">
            Choose an <strong className="text-primary/60">affordable plan</strong> that&apos;s packed with the best features for engaging your audience, creating customer loyalty, and driving sales.
          </div>
        </div>

        {/* Switch for monthly/annual */}
        <div className="flex w-full items-center justify-center space-x-3">
          <span className="text-primary/60">Annual</span>
          <SwitchToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
          {/* <SwitchToggle
            checked={isAnnual}
            onChange={() => setIsAnnual(!isAnnual)}
            className={`${isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span className="sr-only">Toggle Billing Cycle</span>
            <span
              className={`${isAnnual ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform bg-white rounded-full transition-transform`}
            />
          </SwitchToggle> */}
        </div>

        {/* Pricing cards */}
        <div className="mx-auto max-w-3xl grid w-full justify-center grid-cols-1 md:grid-cols-2 gap-6 pb-6 md:!pb-0">
          {pricingPlans.map((plan, index) => (
            <PlanCard
              key={index}
              title={plan.title}
              description={plan.description}
              monthlyPrice={plan.monthlyPrice}
              annualPrice={plan.annualPrice}
              features={plan.features}
              highlight={plan.highlight}
              href={plan.href}
              paymentLink={isAnnual ? plan.paymentLinkAnnual : plan.paymentLinkMonthly}
              isAnnual={isAnnual}
            />
          ))}
        </div>
      </div>
    </DialogContent>
  </Dialog>
  );
};

export default PricingDialog;
