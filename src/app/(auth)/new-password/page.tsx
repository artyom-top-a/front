import React from 'react';
import NewPasswordForm from '@/components/forms/new-password';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Password Recovery",
};

const NewPasswordPage = () => {
  return (
    <>
      <h5 className="font-bold text-xl text-primary">Set new password</h5>
      <div className="text-gray-500 leading-snug mt-1">
        Please enter your new password below to reset it and regain access to your account.
      </div>
      <NewPasswordForm />
    </>
  )
}

export default NewPasswordPage