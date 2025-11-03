import React from 'react';
import Link from "next/link"
import { NewVerificationForm } from '@/components/forms/new-verification';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Email Verification",
};

const NewVerificationPage = () => {
  return (
    <>
      <h5 className="font-bold text-xl text-primary">Email Verification</h5>
      <div className="text-gray-500 leading-snug mt-1">
        Please wait while we verify your email. This process will only take a moment.
      </div>
      <NewVerificationForm/>
      <Link href="/sign-in" className="text-sm flex flex-row gap-2 items-center justify-center mt-5 text-primary">Back to login</Link>
    </>
  )
}

export default NewVerificationPage