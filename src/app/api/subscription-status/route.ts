// app/api/subscription-status/route.ts
import { isUserSubscribed } from "@/app/actions/premium";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const subscriptionStatus = await isUserSubscribed();

    console.log("status: ", subscriptionStatus)
    return NextResponse.json(subscriptionStatus, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json({ error: "Failed to fetch subscription status" }, { status: 500 });
  }
}
