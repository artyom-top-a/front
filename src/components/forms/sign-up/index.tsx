"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";

import { FormGenerator } from "@/components/global/form-generator"
import { Loader } from "@/components/global/loader"
import { Button } from "@/components/ui/button"
import { CONSTANTS } from "@/constants"
import { useForm } from "react-hook-form"
import { FormError } from "../form-error";
import { SignUpSchema } from "./schema";
import { register } from "@/app/actions/register";

import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/login";
import { FormSuccess } from "../form-success";
import { z } from "zod";


// const OtpInput = dynamic(
//   () =>
//     import("@/components/global/otp-input").then(
//       (component) => component.default,
//     ),
//   { ssr: false },
// )
type SignUpFormValues = z.infer<typeof SignUpSchema>;

const SignUpForm = () => {
  // const {
  //   register,
  //   errors,
  //   verifying,
  //   creating,
  //   onGenerateCode,
  //   onInitiateUserRegistration,
  //   code,
  //   setCode,
  //   getValues,
  // } = useAuthSignUp()

  // const { handleSubmit, formState } = useForm();

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";


  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitted },
    reset,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    mode: "onBlur",
  });

  const onSubmit = (values: SignUpFormValues) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const data = await register(values);

      if (data.error) {
        setError(data.error);
        reset();
      } else if (data.success) {
        setSuccess(data.success);

        // Optionally auto-login the user after registration
        const res = await login(values, callbackUrl);

        if (res?.error) {
          setError("Registration successful, but failed to log in");
        } else {
          console.error("Login Error:", res.error);
        }
      }
    });
  };

  return (

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 mt-6"
    >
      {CONSTANTS.signUpForm.map((field) => (
        <FormGenerator
          {...field}
          key={field.id}
          register={formRegister}
          errors={errors}
          isSubmitted={isSubmitted}
        />
      ))}
      <FormError message={error} />
      {success && <FormSuccess message={success} />}
      <Button
        type="submit"
        className="rounded-md font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white"
        disabled={isPending}
      >
        <Loader loading={isPending}>Create an account</Loader>
      </Button>
    </form>
  )
}

export default SignUpForm