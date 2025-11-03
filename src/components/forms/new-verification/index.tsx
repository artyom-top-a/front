"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { newVerification } from "@/app/actions/new-verification";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Loader } from "@/components/global/loader";

export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (!token) {
      setError("Missing token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        if (data.success) {
          setSuccess(data.success);
          setError(undefined);  // Clear error if success occurs
          router.push("/dashboard");
        } else {
          setError(data.error);
        }
      })
      .catch(() => {
        setError("Something went wrong!");
      });
  }, [token]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="flex items-center w-full justify-center mt-5">
      {!success && !error && <Loader loading={true}>Verification</Loader>}
      {success && <FormSuccess message={success} />}
      {success ? null : error && <FormError message={error} />} {/* Ensure error is not shown if success */}
    </div>
  );
};
