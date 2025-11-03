"use server"

import { signIn } from "../../../auth";


export async function handleGoogleSignin() {
    // await signIn("google", { redirectTo: "/home" });
    try {
        await signIn("google", { redirectTo: "/new-application" });

    } catch (err: any) {
        if (err.type === "AuthError") {
            return { 
                error: { message: err.message }
            }
        }
        return { error: { message: 'Failed to login', error: err } }
    }
}