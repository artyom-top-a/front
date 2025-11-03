import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface NavbarProps {
  removeTransparency?: boolean; // Prop to toggle transparency
}

const Navbar: React.FC<NavbarProps> = ({ removeTransparency = true }) => {
  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full animate-fade-in border-b border-black/5 opacity-0 ${removeTransparency ? 'bg-white dark:bg-black' : 'backdrop-blur-[12px]'
        } [--animation-delay:600ms]`}
    >
      <div className="container max-w-7xl mx-auto flex h-[3.5rem] items-center justify-between px-5">
        {/* Brand Section */}
        <Link href={"/"}>
          {/* <div className="flex items-center gap-2">
            <div className="rounded-sm bg-[#6127FF] flex items-center justify-center size-7 mr-1">
              <div className="size-4 rounded-full bg-white dark:bg-black" />
            </div>
            <div className="text-base font-semibold whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300">
              GStudy
            </div>
          </div> */}
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt='logo'
              width={28}
              height={28}
            />
            <div className="text-base font-semibold whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300">
              GStudy
            </div>
          </div>
        </Link>

        {/* Buttons Section */}
        <div className="ml-auto flex h-full items-center">
          {/* Log in Button */}
          <Link
            className="mr-2 sm:mr-4 text-[13px] sm:text-sm flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-white border border-100 text-black/80 hover:bg-gray-50 h-9 px-4 py-2"
            href="/sign-in"
          >
            Log in
          </Link>

          {/* Start for Free Button */}
          <Link
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#6127FF] hover:bg-[#6127FF]/80 text-white shadow-sm h-9 px-4 py-2 text-[13px] sm:text-sm"
            href="/sign-up"
          >
            Sign Up <ArrowRight className="size-4 sm:size-[18px] ml-2" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
