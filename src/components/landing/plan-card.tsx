// components/pricing-card.tsx

import Link from 'next/link';
import React from 'react';
import { ChevronsRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/app/hooks/user';

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
  href,
  paymentLink,
  isAnnual,
}) => {
  // Calculate monthly price for annual billing
  const monthlyEquivalent = (annualPrice / 12).toFixed(2);

  const isProPlan = title.toLowerCase().includes('pro');
  const isFreePlan = monthlyPrice === 0;

  const router = useRouter();

  const { session } = useCurrentUser();

  // Handle subscription click
  const handleSubscription = () => {
    if (!paymentLink) {
      alert('Payment link is unavailable. Please try again later.');
      return;
    }

    if (!session) {
      // Store the payment link for later use
      sessionStorage.setItem('pendingPaymentLink', paymentLink);
      // Redirect the user to the login page
      router.push('/sign-in');
    } else {
      // Clear the stored payment link and proceed to Stripe
      sessionStorage.removeItem('pendingPaymentLink');
      window.location.href = paymentLink; // Redirect to Stripe checkout
    }
  };

  return (
    <div
      className={`relative flex w-full max-w-[800px] flex-col gap-3.5 rounded-2xl border shadow-sm ${highlight ? 'border-[#6127FF] border-2' : 'border-gray-100 dark:border-gray-800'
        } p-5 text-primary overflow-hidden`}
    >
      <div className="flex items-start">
        <div>
          <div
            className={`text-start text-lg font-semibold leading-7 ${isProPlan ? 'text-[#6127FF] font-extrabold' : ''
              }`}
          >
            {title}
          </div>
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
      {/* {isFreePlan ? (
        <Link
          href={href}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md border bg-white hover:bg-gray-50 border-gray-200 text-black h-11 px-4 py-2 w-full gap-2 text-base font-medium tracking-tighter"
        >
          Get Started <ChevronsRight className='ml-0.5 size-5'/>
        </Link>
      ) : (
        <Link
          href={paymentLink || '#'}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md ${isProPlan
            ? 'bg-[#6127FF] text-white hover:bg-[#6127FF]/90'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-500'
            } h-11 px-4 py-2 w-full gap-2 text-base font-semibold tracking-tighter`}
          onClick={() => {
            if (paymentLink) {
              localStorage.setItem('stripePaymentLink', paymentLink);
            }
          }}
          // onClick={handleSubscription}
        >
          {isProPlan ? 'Subscribe' : 'Already Subscribed'}
        </Link>
      )} */}


      {isFreePlan ? (
        // Free Plan Button (No Payment Required)
        <Link
          href={href}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md border bg-white hover:bg-gray-50 border-gray-200 text-black h-11 px-4 py-2 w-full gap-2 text-base font-medium tracking-tighter"
        >
          Get Started <ChevronsRight className="ml-0.5 size-5" />
        </Link>
      ) : (
        // Paid Plan Button (Subscription Handling)
        <button
          onClick={handleSubscription}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md ${isProPlan
            ? 'bg-[#6127FF] text-white hover:bg-[#6127FF]/90'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-500'
            } h-11 px-4 py-2 w-full gap-2 text-base font-semibold tracking-tighter`}
        >
          {isProPlan ? 'Subscribe' : 'Already Subscribed'}
        </button>
      )}

      <hr className="mt-2 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0" />
      <ul className="flex flex-col gap-5 font-normal p-0 pb-3 mt-2">
        {features.map((feature, index) => (
          <React.Fragment key={index}>
            <li className="flex items-center gap-2.5 text-sm font-medium text-primary px-1 m-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 shrink-0 rounded-md ${isProPlan ? "bg-[#6127FF]" : "bg-gray-200"
                  } p-[2px] text-white dark:text-black`}
              >
                <path
                  d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  className={`${isProPlan ? "text-white" : "text-gray-700"
                    }`}
                />
              </svg>
              <span>{feature}</span>
            </li>

            {/* Only add a separator if this is not the last item */}
            {/* {index < features.length - 1 && <Separator className="my-2" />} */}
          </React.Fragment>
        ))}
      </ul>

    </div >
  );
};

export default PlanCard;
