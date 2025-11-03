"use server";

import { client } from "@/lib/prisma";
// import { useCurrentUser } from "../hooks/user";
import { auth } from "../../../auth";


export async function isUserSubscribed() {
	// const session = await useCurrentUser();

	const session = await auth();

	const user = await session?.user;

	
	if (!user) return { success: false };

	const existingUser = await client.user.findUnique({
		where: { id: user.id },
		include: { Subscription: true },
	});

	const isSubscribed = existingUser?.plan === "PRO";
	const subscriptionEndDate = existingUser?.Subscription?.endDate || null;

	return {
		success: true,
		subscribed: isSubscribed,
		subscriptionEnd: subscriptionEndDate,
	};
}