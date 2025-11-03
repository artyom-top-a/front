// import { NextRequest, NextResponse } from 'next/server';
// import { headers } from 'next/headers';
// import Stripe from 'stripe';
// import { stripe } from '../../../../lib/stripe';
// import { client } from '../../../../lib/prisma';

// // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

// export async function POST(req: NextRequest) {
// 	const body = await req.text();
// 	const signature = headers().get('stripe-signature') as string;

// 	let event: Stripe.Event;

// 	try {
// 		if (!signature || !webhookSecret)
// 			return new Response('Webhook secret not found.', { status: 400 });

// 		event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET! as string);

// 		console.log(`🔔  Webhook received: ${event.type}`);
// 	} catch (err: unknown) {
// 		if (err instanceof Error) {
// 		  console.log(`❌ Error message: ${err.message}`);
// 		  return NextResponse.json({ error: err.message }, { status: 400 });
// 		} else {
// 		  console.log('❌ Unknown error:', err);
// 		  return NextResponse.json({ error: 'An unknown error occurred' }, { status: 400 });
// 		}
// 	  }

// 	// const session = event.data.object as Stripe.Checkout.Session;

// 	// console.log('Session retrieved', session.id);

// 	// if (event.type === 'checkout.session.completed') {;
// 	//     console.log('Checkout session completed', session.id);

// 	//     const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
// 	//     console.log('Subscription retrieved', subscription.id);
// 	// }



// 	// Handle the event
// 	try {
// 		switch (event.type) {
// 			case "checkout.session.completed":
// 				const session = await stripe.checkout.sessions.retrieve(
// 					(event.data.object as Stripe.Checkout.Session).id,
// 					{
// 						expand: ["line_items"],
// 					}
// 				);

// 				const subscriptionId = session.subscription as string;
// 				const customerId = session.customer as string;
// 				console.log("customer Id: ", customerId)

// 				const customerDetails = session.customer_details;
// 				console.log("customer details: ", customerDetails)

// 				if (customerDetails?.email) {
// 					const user = await client.user.findUnique({ where: { email: customerDetails.email } });
// 					console.log("user: ", user)

// 					if (!user) throw new Error("User not found");

// 					if (!user.customerId) {
// 						await client.user.update({
// 							where: { id: user.id },
// 							data: { customerId },
// 						});
// 					}

// 					const lineItems = session.line_items?.data || [];

// 					console.log("line items: ", lineItems)


// 					for (const item of lineItems) {
// 						const priceId = item.price?.id;
// 						const isSubscription = item.price?.type === "recurring";

// 						if (isSubscription) {
// 							const endDate = new Date();
// 							if (priceId === process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!) {
// 								endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from now
// 							} else if (priceId === process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!) {
// 								endDate.setMonth(endDate.getMonth() + 1); // 1 month from now
// 							} else {
// 								throw new Error("Invalid priceId");
// 							}
// 							// it is gonna create the subscription if it does not exist already, but if it exists it will update it
// 							await client.subscription.upsert({
// 								where: { userId: user.id! },
// 								create: {
// 									userId: user.id,
// 									stripeSubscriptionId: subscriptionId,
// 									startDate: new Date(),
// 									endDate: endDate,
// 									plan: "PRO",
// 									period: priceId === process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID! ? "Yearly" : "Monthly",
// 								},
// 								update: {
// 									stripeSubscriptionId: subscriptionId,
// 									plan: "PRO",
// 									period: priceId === process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID! ? "Yearly" : "Monthly",
// 									startDate: new Date(),
// 									endDate: endDate,
// 								},
// 							});

// 							await client.user.update({
// 								where: { id: user.id },
// 								data: { plan: "PRO", generations: 100 },
// 							});
// 						} else {
// 							// one_time_purchase
// 						}
// 					}
// 				}
// 				break;

// 			case "invoice.payment_succeeded": {
// 				const invoice = event.data.object as Stripe.Invoice;
// 				const subscriptionId = invoice.subscription as string;

// 				if (subscriptionId) {
// 					const subscription = await stripe.subscriptions.retrieve(subscriptionId);
// 					const user = await client.user.findUnique({
// 						where: { customerId: subscription.customer as string },
// 					});

// 					if (user && user.plan === "PRO") {
// 						// Reset the generations count for the new billing period
// 						await client.user.update({
// 							where: { id: user.id },
// 							data: { generations: 100, generationsUsedThisMonth: 0 },
// 						});
// 					}
// 				}
// 				break;
// 			}

// 			case "customer.subscription.deleted": {
// 				const subscription = await stripe.subscriptions.retrieve((event.data.object as Stripe.Subscription).id);
// 				const user = await client.user.findUnique({
// 					where: { customerId: subscription.customer as string },
// 				});
// 				if (user) {
// 					await client.user.update({
// 						where: { id: user.id },
// 						data: { plan: "FREE", generations: 10 },
// 					});
// 				} else {
// 					console.error("User not found for the subscription deleted event.");
// 					throw new Error("User not found for the subscription deleted event.");
// 				}

// 				break;
// 			}


// 			default:
// 				console.log(`Unhandled event type ${event.type}`);
// 		}
// 	} catch (error) {
// 		console.error("Error handling event", error);
// 		return new Response("Webhook Error", { status: 400 });
// 	}

// 	return NextResponse.json({ received: true }, { status: 200 });
// }

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '../../../../lib/stripe';
import { client } from '../../../../lib/prisma';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // const session = await stripe.checkout.sessions.retrieve(
        //   (event.data.object as Stripe.Checkout.Session).id,
        //   { expand: ['line_items'] }
        // );

		const sessionId = (event.data.object as Stripe.Checkout.Session).id;
        if (!sessionId) throw new Error('Session ID missing');
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['line_items'],
        });

        // const user = await client.user.findUnique({
        //   where: { email: session.customer_details?.email! },
        // });
        // if (!user) throw new Error('User not found on checkout.session.completed');

		const email = session.customer_details?.email;
        if (!email) throw new Error('Customer email missing');
        const user = await client.user.findUnique({ where: { email } });
        if (!user) throw new Error('User not found on checkout.session.completed');

        // Always store/update the Stripe Customer ID
        await client.user.update({
          where: { id: user.id },
          data: { customerId: session.customer as string },
        });

        // Upsert your Subscription record
        // const subscriptionId = session.subscription as string;
        // const priceId = session.line_items?.data[0]?.price?.id!;
        // const period = priceId === process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID
        //   ? 'Yearly'
        //   : 'Monthly';
        // const endDate = new Date();
        // period === 'Yearly'
        //   ? endDate.setFullYear(endDate.getFullYear() + 1)
        //   : endDate.setMonth(endDate.getMonth() + 1);

		const subscriptionId = session.subscription as string;
        if (!subscriptionId) throw new Error('Subscription ID missing');

        const firstItem = session.line_items?.data[0];
        const priceId = firstItem?.price?.id;
        if (!priceId) throw new Error('Price ID missing in line_items');

        const period =
          priceId === process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID
            ? 'Yearly'
            : 'Monthly';

        const endDate = new Date();
        if (period === 'Yearly') {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        await client.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            stripeSubscriptionId: subscriptionId,
            plan: 'PRO',
            period,
            startDate: new Date(),
            endDate,
          },
          update: {
            stripeSubscriptionId: subscriptionId,
            plan: 'PRO',
            period,
            startDate: new Date(),
            endDate,
          },
        });

        // Make them PRO right away
        await client.user.update({
          where: { id: user.id },
          data: { plan: 'PRO', generations: 100, generationsUsedThisMonth: 0 },
        });

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subRecord = await client.subscription.findUnique({
          where: { stripeSubscriptionId: invoice.subscription as string },
        });
        if (!subRecord) {
          console.warn('No subscription record for', invoice.subscription);
          break;
        }

        // Every time Stripe bills successfully, reinforce their PRO status & reset counters
        await client.user.update({
          where: { id: subRecord.userId },
          data: {
            plan: 'PRO',
            generations: 100,
            generationsUsedThisMonth: 0,
          },
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subRecord = await client.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });
        if (!subRecord) {
          console.error('No subscription record on deletion for', subscription.id);
          break;
        }

        // Downgrade them
        await client.user.update({
          where: { id: subRecord.userId },
          data: { plan: 'FREE', generations: 10, generationsUsedThisMonth: 0 },
        });

        // Optionally: delete your subscription row
        await client.subscription.delete({
          where: { stripeSubscriptionId: subscription.id },
        });

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.error('Error handling webhook', err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
