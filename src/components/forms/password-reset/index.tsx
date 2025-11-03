"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormGenerator } from "@/components/global/form-generator";
import { Loader } from "@/components/global/loader";
import { Button } from "@/components/ui/button";
import { CONSTANTS } from "@/constants";
import { FormError } from "../form-error";
import { z } from "zod";
import { PasswordResetSchema } from "./schema";
import { reset as resetPasswordAction } from "@/app/actions/reset";
import { FormSuccess } from "../form-success";

type Props = {
  initialEmail?: string;  // Accept initial email as a prop
};

type PasswordResetFormValues = z.infer<typeof PasswordResetSchema>;

const PasswordResetForm = ({ initialEmail = "" }: Props) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isTransitioning, startTransition] = useTransition();

  const {
    handleSubmit,
    formState: { isSubmitted, errors },
    register,
    reset: formReset, // Renamed to avoid conflict
    setValue,
  } = useForm<PasswordResetFormValues>({
    resolver: zodResolver(PasswordResetSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (initialEmail) {
      setValue("email", initialEmail);
    }
  }, [initialEmail, setValue]);

  const onSubmit = (values: z.infer<typeof PasswordResetSchema>) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const result = await resetPasswordAction(values);
        if (result?.error) {
          setError(result.error);
          formReset();
        } else {
          setSuccess("Password reset email sent successfully!");
          formReset(); // Clear the form after success
        }
      } catch {
        setError("Something went wrong! Please try again.");
        formReset();
      }
    });
  };

  return (
    <form className="flex flex-col gap-4 mt-6" onSubmit={handleSubmit(onSubmit)}>
      {CONSTANTS.passwordResetForm.map((field) => (
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
        <Loader loading={isTransitioning}>Reset Password</Loader>
      </Button>
    </form>
  );
};

export default PasswordResetForm;
