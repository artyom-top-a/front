"use client"

import React from 'react';
import PasswordResetForm from '@/components/forms/password-reset';
import { useSearchParams } from 'next/navigation';



const ForgotPasswordPage = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";


  return (
    <>
      <h5 className="font-bold text-xl text-primary">Forgot password?</h5>
      <div className="text-gray-500 leading-snug mt-1">
      Please enter your email address and we&apos;ll send you instructions on how to reset your password.
      </div>
      <PasswordResetForm initialEmail={email}/>
    </>
  )
}

export default ForgotPasswordPage