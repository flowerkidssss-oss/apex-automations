const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { getBuildBriefEmail, getClientConfirmationEmail } = require('./emails');

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    firstName, lastName, businessEmail, businessName, businessPhone,
    businessAddress, bookingLink, googleProfile, currentCRM,
    messageTone, additionalInfo, plan,
    // hours: sent as JSON string of { mon: { open: bool, openTime, closeTime }, ... }
    hours,
    // scheduling-specific
    services, calendarType,
    // website-specific
    brandColors, logoStatus, existingPhotos, domainStatus, websiteGoals,
    // bundle fields come through combined
  } = req.body;

  if (!firstName || !businessEmail || !businessName) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const clientData = {
    first_name: firstName,
    last_name: lastName || '',
    email: businessEmail,
    business_name: businessName,
    business_phone: businessPhone || '',
    business_address: businessAddress || '',
    booking_link: bookingLink || '',
    google_profile: googleProfile || '',
    current_crm: currentCRM || '',
    message_tone: messageTone || '',
    additional_info: additionalInfo || '',
    plan: plan || 'unknown',
    hours: hours || '',
    services: services || '',
    calendar_type: calendarType || '',
    brand_colors: brandColors || '',
    logo_status: logoStatus || '',
    existing_photos: existingPhotos || '',
    domain_status: domainStatus || '',
    website_goals: websiteGoals || '',
    created_at: new Date().toISOString(),
    status: 'pending_build',
  };

  // 1. Save to Supabase
  try {
    const { error: dbError } = await supabase
      .from('onboarding_submissions')
      .insert([clientData]);
    if (dbError) {
      console.error('Supabase error:', dbError.message);
      // Don't fail the whole request — still send emails
    }
  } catch (dbErr) {
    console.error('Supabase exception:', dbErr.message);
  }

  // 2. Send build brief to Roger
  try {
    const briefEmail = getBuildBriefEmail(clientData);
    await resend.emails.send({
      from: 'Apex Automations System <contact@apexautomations.pro>',
      to: 'contact@apexautomations.pro',
      subject: briefEmail.subject,
      html: briefEmail.html,
    });
  } catch (emailErr) {
    console.error('Brief email error:', emailErr.message);
  }

  // 3. Send confirmation to client
  try {
    const confirmEmail = getClientConfirmationEmail(clientData);
    await resend.emails.send({
      from: 'Roger Canales <contact@apexautomations.pro>',
      to: businessEmail,
      subject: confirmEmail.subject,
      html: confirmEmail.html,
    });
  } catch (emailErr) {
    console.error('Confirmation email error:', emailErr.message);
  }

  return res.status(200).json({ success: true, message: 'Onboarding received.' });
};
