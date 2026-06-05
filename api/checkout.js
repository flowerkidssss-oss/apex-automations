const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Plan definitions — must match frontend
const PLANS = {
  starter: {
    name: 'The Apex System',
    amountCents: 34700, // $347 ($50 setup + first month $297)
    monthlyAmountCents: 29700,
    description: '$50 setup + $297/mo',
  },
  growth: {
    name: 'The Apex System',
    amountCents: 34700,
    monthlyAmountCents: 29700,
    description: '$50 setup + $297/mo',
  },
  dfy: {
    name: 'The Apex System',
    amountCents: 34700,
    monthlyAmountCents: 29700,
    description: '$50 setup + $297/mo',
  },
};

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentMethodId, plan, email, name, phone, business } = req.body;

  if (!paymentMethodId || !plan || !email || !name) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const selectedPlan = PLANS[plan];
  if (!selectedPlan) {
    return res.status(400).json({ error: 'Invalid plan selected.' });
  }

  try {
    // 1. Create or retrieve Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
      metadata: { business, plan },
    });

    // 2. Charge the one-time setup fee + first month upfront
    const paymentIntent = await stripe.paymentIntents.create({
      amount: selectedPlan.amountCents,
      currency: 'usd',
      customer: customer.id,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      description: selectedPlan.name,
      metadata: { plan, business, email },
      receipt_email: email,
    });

    if (paymentIntent.status !== 'succeeded') {
      return res.status(402).json({ error: 'Payment was not successful. Please try again.' });
    }

    // 3. Create a recurring subscription for ongoing monthly retainer
    // First create the price dynamically
    const monthlyPrice = await stripe.prices.create({
      unit_amount: selectedPlan.monthlyAmountCents,
      currency: 'usd',
      recurring: { interval: 'month' },
      product_data: { name: `${selectedPlan.name} — Monthly Retainer` },
    });

    // Schedule subscription to start next month (since first month was charged upfront)
    const nextMonth = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: monthlyPrice.id }],
      billing_cycle_anchor: nextMonth,
      proration_behavior: 'none',
      default_payment_method: paymentMethodId,
      metadata: { plan, business },
    });

    return res.status(200).json({
      success: true,
      customerId: customer.id,
      paymentIntentId: paymentIntent.id,
      message: 'Payment successful. Welcome to Apex Automations!',
    });

  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(402).json({ error: err.message || 'Payment failed. Please check your card details.' });
  }
};
