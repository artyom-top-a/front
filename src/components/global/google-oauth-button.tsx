"use client"

import { Button } from "@/components/ui/button"
import { Loader } from "./loader"
import { Google } from "@/icons/google"
import { signIn } from "next-auth/react"
// import { handleGoogleSignin } from "@/app/actions/google-auth"
// import { useGoogleAuth } from "@/app/hooks/authentication"

type GoogleAuthButtonProps = {
  method: "signup" | "signin"
}

export const GoogleAuthButton = ({ method }: GoogleAuthButtonProps) => {

//   export async function handleGoogleSignin() {
//     await signIn("google", { redirectTo: "/home" });
// }


const handleGoogleSignin = () => {
  console.log("method: ", method);
  
  try {
      signIn("google", { redirectTo: "/home" });
  } catch (error) {
      console.log("An unknown error occurred. Please try again.");
  }
}

  // const { signUpWith, signInWith } = useGoogleAuth()
  return (
    <Button
      onClick={handleGoogleSignin}
      
      className="w-full rounded-md flex gap-3 bg-themeBlack border-themeGray"
      variant="outline"
    >
      <Loader loading={false}>
        <Google />
        Google
      </Loader>
    </Button>
  )
}