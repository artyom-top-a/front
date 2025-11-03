"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormGenerator } from "@/components/global/form-generator";
import { Loader } from "@/components/global/loader";
import { Button } from "@/components/ui/button";
import { CONSTANTS } from "@/constants";
import { SignInSchema } from "./schema";
import { FormError } from "../form-error";
import { z } from "zod";
import Link from "next/link";
import { login } from "@/app/actions/login";
import { FormSuccess } from "../form-success";
import { useRouter, useSearchParams } from "next/navigation";

// Form values based on Zod schema
type SignInFormValues = z.infer<typeof SignInSchema>;

const SignInForm = () => {
  const router = useRouter(); // Router for redirection

  // State variables
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isTransitioning, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error"); 

  useEffect(() => {
    if (oauthError === "OAuthAccountNotLinked") {
      setError(
        "You already have an account with this email."
      );
    }
  }, [oauthError]);

  const {
    handleSubmit,
    formState: { isSubmitted, errors },
    register,
    reset,
    watch,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    mode: "onBlur",
  });

  // Form submission handler
  const onSubmit = (values: SignInFormValues) => {
    setError("");
    setSuccess("");
    console.log("Starting login process with values:", values); // Debug log

    startTransition(async () => {
      try {
        // Perform login
        const result = await login(values);
        console.log("Login result:", result); // Debug log

        if (result?.error) {
          console.error("Login Error:", result.error);
          setError(result.error);
          reset();
        } else {
          // Login successful
          setSuccess("Login successful!");
          console.log("Login successful.");

          // **Check if a payment link exists in sessionStorage**
          const paymentLink = sessionStorage.getItem("pendingPaymentLink");

          if (paymentLink) {
            console.log("Redirecting to payment link:", paymentLink); // Debug log
            sessionStorage.removeItem("pendingPaymentLink"); // Clear stored link
            window.location.href = paymentLink; // Redirect to Stripe checkout
          } else {
            console.log("No payment link found. Redirecting to dashboard.");
            router.push("/dashboard"); // Redirect to dashboard if no link
          }
        }
      } catch (err) {
        console.error("Unexpected Error:", err);
        setError("Something went wrong! Please try again.");
        reset();
      }
    });
  };

  const emailValue = watch("email");

  return (
    <form className="flex flex-col gap-4 mt-6" onSubmit={handleSubmit(onSubmit)}>
      {CONSTANTS.signInForm.map((field) => (
        <FormGenerator
          {...field}
          key={field.id}
          register={register}
          errors={errors}
          isSubmitted={isSubmitted}
        />
      ))}
      <Link
        href={{
          pathname: "/forgot-password",
          query: { email: emailValue }, // Pass the email value as a query parameter
        }}
        className="text-sm text-themeTextWhite"
      >
        Forgot Password?
      </Link>
      <FormError message={error} />
      {success && <FormSuccess message={success} />}
      <Button
        type="submit"
        className="rounded-md font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white"
        disabled={isTransitioning}
      >
        <Loader loading={isTransitioning}>Sign In with Email</Loader>
      </Button>
    </form>
  );
};

export default SignInForm;