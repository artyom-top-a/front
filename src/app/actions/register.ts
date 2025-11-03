"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import { SignUpSchema } from "@/components/forms/sign-up/schema";
import { client } from "@/lib/prisma";

export const register = async (values: z.infer<typeof SignUpSchema>) => {
  try {
    // Validate input
    const validatedFields = SignUpSchema.safeParse(values);

    if (!validatedFields.success) {
      console.error("Invalid fields!", { values, error: validatedFields.error });
      return { error: "Invalid fields!" };
    }

    const { email, password, name } = validatedFields.data;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.warn("Email already in use", { email });
      return { error: "Email already in use!" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password successfully hashed", { email });

    // Create user
    await client.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    console.log("User created successfully", { email });

    // Generate and send verification email
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(name, verificationToken.email, verificationToken.token);
    console.log("Verification email sent", { email });

    return { success: "Confirmation email sent!" };

  } catch (error) {
    console.error("Error during user registration", { error });
    return { error: "An error occurred during registration." };
  }
};
