/**
 * emails.js — Plan-specific onboarding email templates
 * Used by checkout.js to send auto-triggered emails on payment success.
 */

const SIGNATURE = `
  <table style="margin-top:32px;border-top:1px solid #e5e7eb;padding-top:20px;width:100%;">
    <tr>
      <td>
        <p style="margin:0;font-size:15px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">Roger Canales</p>
        <p style="margin:2px 0 0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;">Founder, Apex Automations</p>
        <p style="margin:8px 0 0;font-size:13px;color:#374151;font-family:Arial,sans-serif;">📧 contact@apexautomations.pro</p>
        <p style="margin:2px 0 0;font-size:13px;color:#374151;font-family:Arial,sans-serif;">📱 Available via email — we respond within 2 hours</p>
        <p style="margin:2px 0 0;font-size:13px;color:#374151;font-family:Arial,sans-serif;">🌐 apexautomations.pro</p>
      </td>
    </tr>
  </table>
`;

const ONBOARDING_LINK = 'https://apexautomations.pro/onboarding.html';

function wrapEmail(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Apex Automations</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#111827;padding:28px 32px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;letter-spacing:-0.3px;">Apex Automations</p>
              <p style="margin:4px 0 0;font-size:13px;color:#9ca3af;font-family:Arial,sans-serif;">apexautomations.pro</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
              ${SIGNATURE}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif;text-align:center;">
                You're receiving this because you purchased a plan from Apex Automations.<br>
                Questions? Reply directly to this email or reach us at contact@apexautomations.pro
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function stepsList(steps) {
  return steps.map((step, i) => `
    <tr>
      <td style="padding:10px 0;vertical-align:top;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;padding-right:14px;">
              <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background-color:#111827;color:#ffffff;font-weight:700;font-size:13px;text-align:center;line-height:28px;font-family:Arial,sans-serif;">${i + 1}</span>
            </td>
            <td style="vertical-align:middle;">
              <p style="margin:0;font-size:14px;color:#374151;font-family:Arial,sans-serif;line-height:1.5;">${step}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');
}

function infoList(items) {
  return items.map(item => `<li style="margin-bottom:6px;font-size:14px;color:#374151;font-family:Arial,sans-serif;">${item}</li>`).join('');
}

function ctaButton(text, url) {
  return `
  <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:8px;background-color:#111827;">
        <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;border-radius:8px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

// ─────────────────────────────────────────────
// Template: automation
// ─────────────────────────────────────────────
function automationTemplate({ firstName }) {
  const body = `
    <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">Hey ${firstName}, welcome aboard! 🚀</p>
    <p style="margin:0 0 20px;font-size:15px;color:#6b7280;font-family:Arial,sans-serif;">Your payment is confirmed. Your Automation System is being built.</p>

    <p style="margin:0 0 12px;font-size:15px;color:#374151;font-family:Arial,sans-serif;">
      You just made the move most businesses never do — setting up 24/7 automated follow-up so leads stop falling through the cracks. Here's what happens from here:
    </p>

    <p style="margin:20px 0 12px;font-size:16px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">What happens next</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${stepsList([
        'Fill out your onboarding form — takes about 5 minutes. We\'ll need your business hours, preferred response tone, and the phone number you want leads forwarded to.',
        'We build your missed call text-back + follow-up sequences, customized for your business voice and schedule.',
        'You review and approve the messages before anything goes live. You\'re in control.',
        'We flip the switch — every missed call gets an instant text, and your follow-up sequences start working 24/7.',
      ])}
    </table>

    ${ctaButton('Fill Out Your Onboarding Form →', ONBOARDING_LINK)}

    <div style="background-color:#f9fafb;border-left:4px solid #111827;border-radius:4px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:14px;color:#374151;font-family:Arial,sans-serif;font-weight:700;">⚡ Timeline: 5–7 business days from form submission to live.</p>
    </div>

    <p style="margin:16px 0 8px;font-size:15px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">What we'll need from you</p>
    <ul style="margin:0 0 16px;padding-left:20px;">
      ${infoList([
        'Your business phone number (for missed call routing)',
        'Preferred response tone (professional, casual, friendly, etc.)',
        'CRM login — or we\'ll set one up for you at no extra cost',
        'Your business hours so follow-ups send at the right times',
      ])}
    </ul>

    <p style="margin:16px 0;font-size:15px;color:#374151;font-family:Arial,sans-serif;">
      The moment we go live, your automation runs around the clock. A lead calls at 11pm on a Sunday — they get a text back instantly. That's the difference between a business that loses leads and one that captures every one.
    </p>

    <p style="margin:24px 0 0;font-size:14px;color:#6b7280;font-family:Arial,sans-serif;font-style:italic;">
      <strong>P.S.</strong> — The faster you fill out the onboarding form, the faster we build. Clients who submit within 24 hours go live first. 
      <a href="${ONBOARDING_LINK}" style="color:#111827;font-weight:700;">Fill it out now →</a>
    </p>
  `;
  return wrapEmail(body);
}

// ─────────────────────────────────────────────
// Template: scheduling
// ─────────────────────────────────────────────
function schedulingTemplate({ firstName }) {
  const body = `
    <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">Hey ${firstName}, your booking system is incoming ⚡</p>
    <p style="margin:0 0 20px;font-size:15px;color:#6b7280;font-family:Arial,sans-serif;">Payment confirmed. Your Scheduling System build starts now.</p>

    <p style="margin:0 0 12px;font-size:15px;color:#374151;font-family:Arial,sans-serif;">
      You're about to have a booking system that works even when you're not. Customers will schedule themselves, no-shows will drop, and your calendar will start filling on autopilot.
    </p>

    <p style="margin:20px 0 12px;font-size:16px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">What happens next</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${stepsList([
        'Fill out your onboarding form — we\'ll ask about your services, pricing, and availability so we can build the right booking flow.',
        'We build your booking page and connect it to your calendar with real-time availability.',
        'You review the full booking flow from the customer\'s perspective and give feedback.',
        'We go live — customers can book 24/7 without you lifting a finger.',
      ])}
    </table>

    ${ctaButton('Fill Out Your Onboarding Form →', ONBOARDING_LINK)}

    <div style="background-color:#f9fafb;border-left:4px solid #111827;border-radius:4px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:14px;color:#374151;font-family:Arial,sans-serif;font-weight:700;">⚡ Timeline: 5–7 business days from form submission to live.</p>
    </div>

    <p style="margin:16px 0 8px;font-size:15px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">What we'll need from you</p>
    <ul style="margin:0 0 16px;padding-left:20px;">
      ${infoList([
        'Google Calendar or Outlook calendar access (view + edit)',
        'Your service menu with pricing for each service',
        'Your availability and hours of operation',
        'Staff info if you have multiple team members taking bookings',
      ])}
    </ul>

    <p style="margin:16px 0;font-size:15px;color:#374151;font-family:Arial,sans-serif;">
      Once we're live, your calendar fills itself. No more phone tag, no more back-and-forth texts to schedule. Customers pick a time, it shows up on your calendar, and you show up ready.
    </p>

    <p style="margin:24px 0 0;font-size:14px;color:#6b7280;font-family:Arial,sans-serif;font-style:italic;">
      <strong>P.S.</strong> — Fill out the onboarding form ASAP and we'll start building immediately. 
      <a href="${ONBOARDING_LINK}" style="color:#111827;font-weight:700;">Get started →</a>
    </p>
  `;
  return wrapEmail(body);
}

// ─────────────────────────────────────────────
// Template: website
// ─────────────────────────────────────────────
function websiteTemplate({ firstName }) {
  const body = `
    <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">Hey ${firstName}, your new website is in production 🌐</p>
    <p style="margin:0 0 20px;font-size:15px;color:#6b7280;font-family:Arial,sans-serif;">Payment confirmed. Your Website Build has officially started.</p>

    <p style="margin:0 0 12px;font-size:15px;color:#374151;font-family:Arial,sans-serif;">
      You're getting a professional, SEO-optimized, mobile-ready website built to convert visitors into paying customers. Here's exactly how the process works:
    </p>

    <p style="margin:20px 0 12px;font-size:16px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">What happens next</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${stepsList([
        'Fill out your onboarding form — we\'ll ask about your brand assets, business goals, and the content you want on the site.',
        'We design your website and send you a preview. This is where your vision starts coming to life.',
        'Review round — you give us feedback and we refine. We want you to love it.',
        'Final approval + launch. Your site goes live with full SEO setup and 30 days of post-launch support.',
      ])}
    </table>

    ${ctaButton('Fill Out Your Onboarding Form →', ONBOARDING_LINK)}

    <div style="background-color:#f9fafb;border-left:4px solid #111827;border-radius:4px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:14px;color:#374151;font-family:Arial,sans-serif;font-weight:700;">🌐 Timeline: 10–14 business days from form submission to launch.</p>
    </div>

    <p style="margin:16px 0 8px;font-size:15px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">What we'll need from you</p>
    <ul style="margin:0 0 16px;padding-left:20px;">
      ${infoList([
        'Your logo (if you have one — if not, we can help)',
        'Brand colors or any color preferences',
        'Any existing photos of your business, team, or work',
        '2–3 sentences describing what your business does and who you serve',
        'Domain access — or we\'ll walk you through setup step by step',
      ])}
    </ul>

    <p style="margin:16px 0;font-size:15px;color:#374151;font-family:Arial,sans-serif;">
      Your site will be SEO-optimized from day one so Google can find you, mobile-ready so every customer gets a perfect experience, and backed by 30 days of post-launch support so you're never left hanging.
    </p>

    <p style="margin:24px 0 0;font-size:14px;color:#6b7280;font-family:Arial,sans-serif;font-style:italic;">
      <strong>P.S.</strong> — The sooner you send us your brand assets and onboarding form, the sooner we can get into design. Don't let this sit! 
      <a href="${ONBOARDING_LINK}" style="color:#111827;font-weight:700;">Submit your form →</a>
    </p>
  `;
  return wrapEmail(body);
}

// ─────────────────────────────────────────────
// Template: bundle-as (Automation + Scheduling)
// ─────────────────────────────────────────────
function bundleAsTemplate({ firstName }) {
  const body = `
    <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">Hey ${firstName}, your full lead & booking system is incoming 🔧</p>
    <p style="margin:0 0 20px;font-size:15px;color:#6b7280;font-family:Arial,sans-serif;">Payment confirmed. Your Automation + Scheduling Bundle build starts now.</p>

    <p style="margin:0 0 12px;font-size:15px;color:#374151;font-family:Arial,sans-serif;">
      You made a power move. You're getting both the automation system and the booking system — and here's the best part: they're wired together. A lead comes in, gets followed up automatically, and books directly into your calendar. That's the full loop, automated.
    </p>

    <p style="margin:20px 0 12px;font-size:16px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">What happens next</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${stepsList([
        'Fill out your onboarding form — covers both systems in one pass. Business hours, services, pricing, calendar access, tone, phone number.',
        'We build both systems simultaneously so you\'re not waiting twice.',
        'You review and approve everything — automation messages, booking flow, calendar integration.',
        'We go live with the full stack. Both systems are connected and running.',
      ])}
    </table>

    ${ctaButton('Fill Out Your Onboarding Form →', ONBOARDING_LINK)}

    <div style="background-color:#f9fafb;border-left:4px solid #111827;border-radius:4px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:14px;color:#374151;font-family:Arial,sans-serif;font-weight:700;">⚡ Timeline: 5–7 business days from form submission to live.</p>
    </div>

    <p style="margin:16px 0 8px;font-size:15px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">What we'll need from you</p>
    <ul style="margin:0 0 16px;padding-left:20px;">
      ${infoList([
        'Business phone number for missed call routing',
        'Preferred response tone (professional, casual, friendly, etc.)',
        'CRM login — or we set one up free',
        'Business hours',
        'Google Calendar or Outlook calendar access',
        'Service menu with pricing',
        'Your availability and staff info if applicable',
      ])}
    </ul>

    <p style="margin:16px 0;font-size:15px;color:#374151;font-family:Arial,sans-serif;">
      Once live, your entire lead-to-booking pipeline runs without you. A missed call triggers a follow-up. That follow-up books an appointment. That appointment lands in your calendar. All automated.
    </p>

    <p style="margin:24px 0 0;font-size:14px;color:#6b7280;font-family:Arial,sans-serif;font-style:italic;">
      <strong>P.S.</strong> — Fill out the onboarding form and we'll get both systems moving at the same time. No delays. 
      <a href="${ONBOARDING_LINK}" style="color:#111827;font-weight:700;">Fill it out now →</a>
    </p>
  `;
  return wrapEmail(body);
}

// ─────────────────────────────────────────────
// Template: bundle-aw (Automation + Website)
// ─────────────────────────────────────────────
function bundleAwTemplate({ firstName }) {
  const body = `
    <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">Hey ${firstName}, your full digital presence starts now 🌐⚡</p>
    <p style="margin:0 0 20px;font-size:15px;color:#6b7280;font-family:Arial,sans-serif;">Payment confirmed. Your Automation + Website Bundle is in production.</p>

    <p style="margin:0 0 12px;font-size:15px;color:#374151;font-family:Arial,sans-serif;">
      This is the combination that closes the loop: a professional website that gets you found, wired directly into automation that follows up every single lead. Someone finds you online, fills out a form, and gets an instant response — even at 2am.
    </p>

    <p style="margin:20px 0 12px;font-size:16px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">What happens next</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${stepsList([
        'Fill out your onboarding form — covers your brand assets, business goals, and automation setup all at once.',
        'Website design and automation build happen simultaneously — we don\'t make you wait on one to start the other.',
        'You review the website design and approve the automation messages. One comprehensive review session.',
        'We launch your site and flip on the automation at the same time. Full stack, live.',
      ])}
    </table>

    ${ctaButton('Fill Out Your Onboarding Form →', ONBOARDING_LINK)}

    <div style="background-color:#f9fafb;border-left:4px solid #111827;border-radius:4px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:14px;color:#374151;font-family:Arial,sans-serif;font-weight:700;">🌐 Timeline: 10–14 business days (website sets the pace, automation builds in parallel).</p>
    </div>

    <p style="margin:16px 0 8px;font-size:15px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">What we'll need from you</p>
    <ul style="margin:0 0 16px;padding-left:20px;">
      ${infoList([
        'Business phone number for missed call routing',
        'Preferred response tone for automated messages',
        'CRM login — or we set one up free',
        'Business hours',
        'Logo (or we help create one)',
        'Brand colors and any existing photos',
        '2–3 sentences about your business',
        'Domain access or we\'ll walk you through setup',
      ])}
    </ul>

    <p style="margin:16px 0;font-size:15px;color:#374151;font-family:Arial,sans-serif;">
      Your new site is built with automation baked in from day one. Every lead form on the website connects directly to your follow-up sequences. Leads from the site get followed up automatically — nothing slips through.
    </p>

    <p style="margin:24px 0 0;font-size:14px;color:#6b7280;font-family:Arial,sans-serif;font-style:italic;">
      <strong>P.S.</strong> — Your brand assets are the thing that'll speed this up the most. Get those in the onboarding form and we'll start designing immediately. 
      <a href="${ONBOARDING_LINK}" style="color:#111827;font-weight:700;">Submit your form →</a>
    </p>
  `;
  return wrapEmail(body);
}

// ─────────────────────────────────────────────
// Template: bundle-full (Full Stack)
// ─────────────────────────────────────────────
function bundleFullTemplate({ firstName }) {
  const body = `
    <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">Hey ${firstName}, Full Stack activated 🚀🔧🌐</p>
    <p style="margin:0 0 20px;font-size:15px;color:#6b7280;font-family:Arial,sans-serif;">Payment confirmed. Your entire business engine is being built.</p>

    <p style="margin:0 0 12px;font-size:15px;color:#374151;font-family:Arial,sans-serif;">
      You made the best decision on the menu. This is the complete package — website that gets you found, automation that captures every lead, scheduling that converts them into bookings. All three systems. All automated. All talking to each other.
    </p>

    <p style="margin:20px 0 12px;font-size:16px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">What happens next</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${stepsList([
        'Fill out your onboarding form — it\'s comprehensive because it covers all three systems. Budget about 10 minutes. This one form kickstarts everything.',
        'All three systems are built simultaneously. Website design, automation sequences, and booking system — all in parallel.',
        'Full review session: you see the website, approve the automation messages, and test the booking flow in one go.',
        'We launch everything at once. Site goes live, automation turns on, booking system opens. Your entire business engine fires up.',
      ])}
    </table>

    ${ctaButton('Fill Out Your Onboarding Form →', ONBOARDING_LINK)}

    <div style="background-color:#111827;border-radius:8px;padding:20px 24px;margin:20px 0;">
      <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">🏆 Timeline: 10–14 business days to full launch.</p>
      <p style="margin:0;font-size:13px;color:#9ca3af;font-family:Arial,sans-serif;">All three systems built and launched simultaneously.</p>
    </div>

    <p style="margin:16px 0 8px;font-size:15px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">What we'll need from you</p>
    <ul style="margin:0 0 16px;padding-left:20px;">
      ${infoList([
        'Business phone number for missed call routing',
        'Preferred response tone for automated messages',
        'CRM login — or we set one up free',
        'Business hours',
        'Google Calendar or Outlook calendar access',
        'Service menu with pricing',
        'Logo, brand colors, and any existing photos',
        '2–3 sentences about your business',
        'Domain access (or we\'ll guide setup)',
        'Staff info if you have multiple team members',
      ])}
    </ul>

    <p style="margin:16px 0;font-size:15px;color:#374151;font-family:Arial,sans-serif;">
      Here's how the full stack works together: your website gets traffic and captures leads. Your automation follows up every single one instantly, 24/7. Your scheduling system converts those leads into booked appointments that land directly on your calendar. Nothing manual. Nothing missed.
    </p>

    <p style="margin:16px 0;font-size:15px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">
      This is the complete package. Let's build it right.
    </p>

    <p style="margin:24px 0 0;font-size:14px;color:#6b7280;font-family:Arial,sans-serif;font-style:italic;">
      <strong>P.S.</strong> — The onboarding form is the only thing standing between you and launch. Fill it out now and we'll start building all three systems today. 
      <a href="${ONBOARDING_LINK}" style="color:#111827;font-weight:700;">Let's go →</a>
    </p>
  `;
  return wrapEmail(body);
}

// ─────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────
function getOnboardingEmail(plan, customerData) {
  const { firstName } = customerData;

  const templates = {
    'automation':  {
      subject: "You're in — let's get your leads on autopilot 🚀",
      html: automationTemplate({ firstName }),
    },
    'scheduling': {
      subject: "Booking system incoming — let's get you set up ⚡",
      html: schedulingTemplate({ firstName }),
    },
    'website': {
      subject: "Your new website is in production — here's what's next 🌐",
      html: websiteTemplate({ firstName }),
    },
    'bundle-as': {
      subject: "Full lead & booking system incoming — let's build 🔧",
      html: bundleAsTemplate({ firstName }),
    },
    'bundle-aw': {
      subject: "Website + automation — your full digital presence starts now 🌐⚡",
      html: bundleAwTemplate({ firstName }),
    },
    'bundle-full': {
      subject: "Full Stack activated — let's build your entire business engine 🚀🔧🌐",
      html: bundleFullTemplate({ firstName }),
    },
  };

  const template = templates[plan];
  if (!template) {
    return {
      subject: "Welcome to Apex Automations",
      html: wrapEmail(`<p style="font-size:15px;color:#374151;font-family:Arial,sans-serif;">Hi ${firstName}, your payment is confirmed and we'll be in touch shortly to get started.</p>${SIGNATURE}`),
    };
  }

  return template;
}

module.exports = { getOnboardingEmail };
