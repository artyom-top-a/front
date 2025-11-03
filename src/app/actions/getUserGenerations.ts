"use server";

import { client } from "@/lib/prisma";
import { auth } from "../../../auth";

export async function getUserGenerations() {
    const session = await auth();
    const user = await session?.user;
  
    if (!user) return { success: false, generations: 0, generationsUsedThisMonth: 0 };
  
    const existingUser = await client.user.findUnique({
      where: { id: user.id },
      select: { generations: true, generationsUsedThisMonth: true },
    });
  
    if (!existingUser) return { success: false, generations: 0, generationsUsedThisMonth: 0 };
  
    return {
      success: true,
      generations: existingUser.generations,
      generationsUsedThisMonth: existingUser.generationsUsedThisMonth,
    };
  }
  