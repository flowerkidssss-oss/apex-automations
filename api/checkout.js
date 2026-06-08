const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');
const { getOnboardingEmail } = require('./emails');

const resend = new Resend(process.env.RESEND_API_KEY);

// ─────────────────────────────────────────────
// Plan definitions — must match frontend
// ─────────────────────────────────────────────
const PLANS = {
  'starter': { name: 'Starter',  setupCents: 0, monthlyCents: 39700, yearlyMonthlyCents: 31800 },
  'growth':  { name: 'Growth',   setupCents: 0, monthlyCents: 59700, yearlyMonthlyCents: 47800 },
  'pro':     { name: 'Pro',      setupCents: 0, monthlyCents: 99700, yearlyMonthlyCents: 79800 },
};

// ─────────────────────────────────────────────
// Discount codes
// ─────────────────────────────────────────────
const CODES = {
  'HALFOFF':  { type: 'half_first', excludeOneTime: false },
  'YEARLY10': { type: 'yearly10',   requiresYearly: true },
};

// ─────────────────────────────────────────────
// Apply discount logic
// Returns { setupCents, firstChargeCents, recurringCents, discountApplied }
// ─────────────────────────────────────────────
function applyDiscount(plan, selectedPlan, billing, discountCode) {
  const isYearly = billing === 'yearly';
  const code = discountCode ? CODES[discountCode.toUpperCase()] : null;
  let discountApplied = null;

  if (code) {
    const { type, requiresYearly } = code;
    const yearlyRequired = requiresYearly && !isYearly;
    if (!yearlyRequired) {
      if (type === 'half_first' && !isYearly) discountApplied = 'half_first';
      if (type === 'yearly10' && isYearly) discountApplied = 'yearly10';
    }
  }

  if (isYearly) {
    let annualRecurring = selectedPlan.yearlyMonthlyCents * 12;
    if (discountApplied === 'yearly10') annualRecurring = Math.round(annualRecurring * 0.90);
    return { setup: 0, firstChargeCents: annualRecurring, recurringCents: annualRecurring, discountApplied };
  }

  let firstMonth = selectedPlan.monthlyCents;
  if (discountApplied === 'half_first') firstMonth = Math.round(firstMonth * 0.50);
  return { setup: 0, firstChargeCents: firstMonth, recurringCents: selectedPlan.monthlyCents, discountApplied };
}

// ─────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────
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

  const { paymentMethodId, plan, billing = 'monthly', email, name, phone, business, discountCode } = req.body;

  if (!paymentMethodId || !plan || !email || !name) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const selectedPlan = PLANS[plan];
  if (!selectedPlan) {
    return res.status(400).json({ error: 'Invalid plan selected.' });
  }

  const { setup, firstChargeCents, recurringCents, discountApplied } = applyDiscount(plan, selectedPlan, billing, discountCode);
  const isYearly = billing === 'yearly';

  try {
    // 1. Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
      metadata: { business, plan, billing },
    });

    // 2. Charge first period upfront
    const paymentIntent = await stripe.paymentIntents.create({
      amount: firstChargeCents,
      currency: 'usd',
      customer: customer.id,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      description: `${selectedPlan.name}${discountApplied ? ` (${discountApplied})` : ''}`,
      metadata: { plan, billing, business, email, discountApplied: discountApplied || '' },
      receipt_email: email,
    });

    if (paymentIntent.status !== 'succeeded') {
      return res.status(402).json({ error: 'Payment was not successful. Please try again.' });
    }

    // 3. Send onboarding emails (non-blocking — never fail the payment response)
    const firstName = name.split(' ')[0];
    try {
      const emailTemplate = getOnboardingEmail(plan, { name, firstName, email, phone, business, billing });

      // Onboarding email to customer
      await resend.emails.send({
        from: 'Roger Canales <contact@send.apexautomations.pro>',
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });

      // Notification to Roger
      await resend.emails.send({
        from: 'Apex Automations <contact@send.apexautomations.pro>',
        to: 'contact@apexautomations.pro',
        subject: `New client: ${business} — ${selectedPlan.name}`,
        html: `
          <p><strong>New purchase!</strong></p>
          <p><strong>Business:</strong> ${business}</p>
          <p><strong>Plan:</strong> ${selectedPlan.name}</p>
          <p><strong>Billing:</strong> ${billing}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Discount:</strong> ${discountApplied || 'None'}</p>
          <p><strong>Charged:</strong> $${(firstChargeCents / 100).toFixed(2)}</p>
        `,
      });
    } catch (emailErr) {
      console.error('Resend email error (non-fatal):', emailErr.message);
    }

    // 4. Create recurring subscription
    if (recurringCents > 0) {
      const interval = isYearly ? 'year' : 'month';
      const intervalLabel = isYearly ? 'Annual' : 'Monthly';

      const recurringPrice = await stripe.prices.create({
        unit_amount: recurringCents,
        currency: 'usd',
        recurring: { interval },
        product_data: { name: `${selectedPlan.name} — ${intervalLabel} Retainer` },
      });

      // Schedule subscription to start next billing cycle
      // (first period was charged upfront via paymentIntent)
      const nextCycle = isYearly
        ? Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
        : Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

      await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: recurringPrice.id }],
        billing_cycle_anchor: nextCycle,
        proration_behavior: 'none',
        default_payment_method: paymentMethodId,
        metadata: { plan, billing, business },
      });
    }

    return res.status(200).json({
      success: true,
      customerId: customer.id,
      paymentIntentId: paymentIntent.id,
      discountApplied: discountApplied || null,
      message: 'Payment successful. Welcome to Apex Automations!',
    });

  } catch (err) {
    console.error('Checkout error:', err.message);
    return res.status(402).json({ error: err.message || 'Payment failed. Please check your card details.' });
  }
};
