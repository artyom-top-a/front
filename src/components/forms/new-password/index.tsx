"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormGenerator } from "@/components/global/form-generator";
import { Loader } from "@/components/global/loader";
import { Button } from "@/components/ui/button";
import { CONSTANTS } from "@/constants";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { newPassword } from "@/app/actions/new-password"; // Import newPassword action
import { NewPasswordSchema } from "./schema";
import { z } from "zod";


type NewPasswordFormValues = z.infer<typeof NewPasswordSchema>;

const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  // const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const token = searchParams.get("token"); // Extract token from search params

  const router = useRouter();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isTransitioning, startTransition] = useTransition();

  const {
    handleSubmit,
    formState: { isSubmitted, errors },
    register,
    reset,
  } = useForm<NewPasswordFormValues>({
    resolver: zodResolver(NewPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = (values: NewPasswordFormValues) => {
    setError("");
    setSuccess("");

    if (!token) {
      setError("Token is missing or invalid!");
      return;
    }

    startTransition(async () => {
      try {
        const result = await newPassword(values, token); // Pass the token and values to the action
        if (result?.error) {
          setError(result.error);
          reset(); // Optionally reset the form
        } else {
          setSuccess(result.success || "Password updated successfully!");
          reset(); // Reset form fields on success
          router.push("/sign-in")
        }
      } catch (err) {
        console.error("Unexpected Error:", err);
        setError("Something went wrong! Please try again.");
        reset();
      }
    });
  };

  return (
    <form className="flex flex-col gap-4 mt-6" onSubmit={handleSubmit(onSubmit)}>
      {CONSTANTS.newPasswordForm.map((field) => (
        <FormGenerator
          {...field}
          key={field.id}
          register={register}
          errors={errors}
          isSubmitted={isSubmitted}
        />
      ))}
      <FormError message={error} />
      {success && <FormSuccess message={success} />}
      <Button type="submit" className="rounded-md font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white" disabled={isTransitioning}>
        <Loader loading={isTransitioning}>Confirm Password</Loader>
      </Button>
    </form>
  );
};

export default NewPasswordForm;
