# Onboarding Email System — Internal Documentation

## Overview

Onboarding emails now fire **automatically** the moment a payment succeeds in `api/checkout.js`. No manual sending required. The system uses [Resend](https://resend.com) for delivery.

---

## How It Works

1. Customer completes checkout → Stripe `paymentIntent.status === 'succeeded'`
2. `checkout.js` calls `getOnboardingEmail(plan, customerData)` from `api/emails.js`
3. Two emails are sent via Resend:
   - **Customer onboarding email** — plan-specific, from `Roger Canales <contact@apexautomations.pro>`
   - **Internal notification** — sent to `contact@apexautomations.pro` with full order details
4. If Resend throws an error, it is logged but **does not fail the payment response** — email delivery is non-blocking

---

## Required Environment Variable

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

**⚠️ Roger: Add `RESEND_API_KEY` to your Vercel project environment variables to activate email sending.**

- Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
- Add: `RESEND_API_KEY` = your Resend API key
- Redeploy to apply

Without this key, emails will silently fail (logged to Vercel function logs) but payments will still process normally.

---

## Email Templates

All templates live in `api/emails.js`. Each returns `{ subject, html }`.

### Plan: `automation`
**Subject:** `You're in — let's get your leads on autopilot 🚀`
- Timeline: 5–7 business days
- Focus: Missed call text-back, follow-up sequences, 24/7 automation
- Info needed: Business phone, tone, CRM, business hours

### Plan: `scheduling`
**Subject:** `Booking system incoming — let's get you set up ⚡`
- Timeline: 5–7 business days
- Focus: Booking page, calendar integration, 24/7 self-booking
- Info needed: Calendar access, service menu/pricing, availability, staff info

### Plan: `website`
**Subject:** `Your new website is in production — here's what's next 🌐`
- Timeline: 10–14 business days
- Focus: SEO-optimized site, mobile-ready, review round, 30 days post-launch support
- Info needed: Logo, brand colors, photos, business description, domain access

### Plan: `bundle-as` (Automation + Scheduling)
**Subject:** `Full lead & booking system incoming — let's build 🔧`
- Timeline: 5–7 business days
- Focus: Both systems built simultaneously, lead-to-booking pipeline fully automated
- Info needed: Everything from automation + scheduling lists

### Plan: `bundle-aw` (Automation + Website)
**Subject:** `Website + automation — your full digital presence starts now 🌐⚡`
- Timeline: 10–14 business days (website sets the pace)
- Focus: Site wired into automation, leads from site auto-followed-up
- Info needed: Everything from automation + website lists

### Plan: `bundle-full` (Full Stack Bundle)
**Subject:** `Full Stack activated — let's build your entire business engine 🚀🔧🌐`
- Timeline: 10–14 business days
- Focus: All three systems built and launched simultaneously, complete automation loop
- Info needed: Everything — phone, calendar, brand assets, service menu, domain

---

## Template Structure

Every email includes:
- Customer's first name in the greeting
- Plan-specific "What happens next" numbered steps
- Timeline callout block
- "What we'll need from you" bullet list
- CTA button linking to `https://apexautomations.pro/onboarding.html`
- P.S. nudge to fill out the onboarding form
- Roger's full professional signature

---

## Signature (used in every email)
```
Roger Canales
Founder, Apex Automations
📧 contact@apexautomations.pro
📱 Available via email — we respond within 2 hours
🌐 apexautomations.pro
```

---

## Internal Notification Email

Sent to `contact@apexautomations.pro` on every successful payment. Includes:
- Business name
- Plan purchased
- Billing type (monthly/yearly)
- Customer name, email, phone
- Discount code applied (if any)
- Total amount charged

---

## Files

| File | Purpose |
|---|---|
| `api/checkout.js` | Stripe checkout + Resend trigger |
| `api/emails.js` | All 6 email templates + `getOnboardingEmail()` |

---

## Adding/Editing Templates

Edit `api/emails.js`. Each plan has its own function (`automationTemplate`, `schedulingTemplate`, etc.). The `wrapEmail()` helper adds the outer HTML shell and header/footer. The `SIGNATURE` constant is shared across all templates.

To add a new plan, add a new template function and register it in the `templates` object inside `getOnboardingEmail()`.
