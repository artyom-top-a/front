// components/pricing-card.tsx

import Link from 'next/link';
import React from 'react';

interface PlanCardProps {
  title: string;
  description: string;
  monthlyPrice: number; // Monthly price
  annualPrice: number; // Total annual price
  features: string[];
  highlight?: boolean;
  href: string;
  paymentLink?: string;
  isAnnual: boolean; // Whether the user selected the annual plan
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  description,
  monthlyPrice,
  annualPrice,
  features,
  highlight,
  paymentLink,
  isAnnual,
}) => {
  // Calculate monthly price for annual billing
  const monthlyEquivalent = (annualPrice / 12).toFixed(2);

  return (
    <div
      className={`relative flex w-full max-w-[800px] flex-col gap-3.5 rounded-2xl border shadow-sm ${highlight ? 'border-[#6127FF] border-2' : 'border-gray-100 dark:border-gray-800'
        } p-5 text-primary overflow-hidden`}
    >
      <div className="flex items-start">
        <div>
          <div className="text-start text-base font-semibold leading-7">{title}</div>
          <div className="text-start h-4 text-sm leading-5">{description}</div>
        </div>
      </div>
      <div className="flex flex-row gap-1">
        <div className="text-4xl font-bold text-primary">
          ${isAnnual ? monthlyEquivalent : monthlyPrice.toFixed(2)}
          <span className="text-lg font-normal">/month</span>
        </div>
      </div>
      {/* {isAnnual && (
        <div className="mt-1 text-sm text-green-500">
          Billed annually (${annualPrice}/year)
        </div>
      )} */}
      {monthlyPrice === 0 ? (
        // Gray disabled button for free plan
        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-gray-200 text-gray-500 cursor-not-allowed h-9 px-4 py-2 w-full gap-2 text-base font-semibold tracking-tighter"
          disabled
        >
          Already Subscribed
        </button>
      ) : (
        // Active button for other plans
        <Link
          href={paymentLink || '#'}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow text-white bg-[#562ae6] hover:bg-[#562ae6]/90 dark:bg-[#734df1] dark:hover:bg-[#734df1]/90 h-9 px-4 py-2 group relative w-full gap-2 overflow-hidden text-base font-semibold tracking-tighter transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
          onClick={() => {
            if (paymentLink) {
              localStorage.setItem('stripePaymentLink', paymentLink);
            }
          }}
        >
          Subscribe
        </Link>
      )}
      <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
      <ul className="flex flex-col gap-3.5 font-normal">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-sm font-medium text-primary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 shrink-0 rounded-full bg-green-400 p-[2px] text-white dark:text-black"
            >
              <path
                d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanCard;
