import React from 'react';
import SignInForm from "@/components/forms/sign-in";
import { GoogleAuthButton } from "@/components/global/google-oauth-button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Metadata } from 'next';
// import { useSearchParams } from 'next/navigation';

export const metadata: Metadata = {
  title: "Sign In",
  metadataBase: new URL("https://gstudy.pro"),
};

const SignInPage = () => {
  // const searchParams = useSearchParams();
  // const urlError = searchParams.get("error") || "";

  return (
    <>
      <h5 className="font-bold text-xl text-primary">Login</h5>
      <div className="text-gray-500 leading-snug mt-1 text-md">
      Welcome back! Sign in to your account and continue where you left off.
      </div>
      <SignInForm />
      <div className="my-10 w-full relative">
        <div className="bg-gray-50 dark:bg-black rounded-md p-3 absolute text-gray-500 text-xs top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          OR CONTINUE WITH
        </div>
        <Separator orientation="horizontal" className="bg-themeGray" />
      </div>
      <GoogleAuthButton method="signin"/>

      <div className="text-sm flex flex-row gap-2 items-center justify-center mt-5">
        <div className="text-gray-500">Haven&apos;t signed up yet?</div>
        <Link href="/sign-up" className="text-[#6127FF] hover:text-[#6127FF]/80">Sign Up</Link>
      </div>
    </>
  );
}

export default SignInPage;
