import { InkressSDK } from '../src';

async function subscriptionExample() {
  const inkress = new InkressSDK({
    bearerToken: 'your-jwt-token-here',
    clientId: 'm-your-merchant-username',
  });

  try {
    // Create a billing plan first
    console.log('Creating billing plan...');
    const plan = await inkress.billingPlans.create({
      name: 'Monthly Subscription',
      description: 'Monthly subscription plan',
      flat_rate: 25.00,
      transaction_fee: 0.30,
      transaction_percentage: 2.5,
      duration: 1,
      billing_cycle: 3, // monthly
      currency_id: 1,
      features: ['Feature 1', 'Feature 2', 'Feature 3']
    });
    console.log('Billing plan created:', plan.data);

    // Create a subscription link
    console.log('Creating subscription link...');
    const subscriptionLink = await inkress.subscriptions.createLink({
      reference_id: 'sub_' + Date.now(),
      title: 'Monthly Subscription',
      plan_id: plan.data?.id?.toString() || 'plan_id_here',
      customer: {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com'
      }
    });
    console.log('Subscription link created:', subscriptionLink.data);

    // List subscriptions
    console.log('Listing subscriptions...');
    const subscriptions = await inkress.subscriptions.list({
      page: 1,
      limit: 10,
      status: 2 // active
    });
    console.log('Subscriptions:', subscriptions.data);

    // If we have an active subscription, charge it
    if (subscriptions.data?.entries && subscriptions.data.entries.length > 0) {
      const subscription = subscriptions.data.entries[0];
      console.log('Charging subscription...');
      
      const charge = await inkress.subscriptions.charge(subscription.uid, {
        reference_id: 'charge_' + Date.now(),
        total: 10.00,
        title: 'Additional service charge'
      });
      console.log('Subscription charged:', charge.data);

      // Get subscription periods
      console.log('Getting subscription periods...');
      const periods = await inkress.subscriptions.getPeriods(subscription.uid, {
        page: 1,
        limit: 5
      });
      console.log('Subscription periods:', periods.data);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

export { subscriptionExample };
