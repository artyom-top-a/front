'use server';

import { stripe } from '@/lib/stripe';
import { auth } from '../../../auth';
import { client } from '@/lib/prisma';

export async function cancelSubscription() {
  try {
    console.log('cancelSubscription function called');

    // Retrieve the session and log it
    const session = await auth();
    console.log('Session:', session);

    // Check if the user is authenticated
    if (!session || !session.user || !session.user.id) {
      console.log('User is not authenticated');
      return { error: 'User is not authenticated' };
    }

    // Fetch the subscription from the database using the user's ID
    const subscription = await client.subscription.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    console.log('Subscription from database:', subscription);

    // Check if the subscription exists and has a stripeSubscriptionId
    if (!subscription || !subscription.stripeSubscriptionId) {
      console.log('Subscription not found or missing stripeSubscriptionId');
      return { error: 'Subscription not found' };
    }

    // Log the Stripe subscription ID
    console.log('Stripe Subscription ID:', subscription.stripeSubscriptionId);

    // Retrieve the subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

    // Check if subscription is already canceled or set to cancel at period end
    if (stripeSubscription.cancel_at_period_end || stripeSubscription.status === 'canceled') {
      console.log('Subscription is already canceled or set to cancel at period end');
      return { error: 'Subscription is already canceled' };
    }


    // Cancel the subscription at the end of the billing period using the Stripe subscription ID
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    console.log('Subscription cancellation successful');
    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { error: 'Failed to cancel subscription' };
  }
}
