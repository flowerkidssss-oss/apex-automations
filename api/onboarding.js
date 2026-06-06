const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const { getBuildBriefEmail, getClientConfirmationEmail } = require('./emails');

// Disable default body parser so formidable can handle multipart
module.exports.config = { api: { bodyParser: false } };

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Action items per plan ──
const ACTION_ITEMS = {
  automation: [
    'Set up CRM sub-account',
    'Configure missed call text-back',
    'Build 7-day follow-up sequences',
    'Set up review request automation',
    'Test all flows',
    'Schedule go-live call with client',
  ],
  scheduling: [
    'Build booking page',
    'Connect calendar integration',
    'Configure services and availability',
    'Set up appointment reminders',
    'Test full booking flow',
    'Schedule go-live call with client',
  ],
  website: [
    'Create staging environment',
    'Design based on brief and brand assets',
    'Send preview link to client',
    'Apply feedback round',
    'Final approval',
    'Launch with SSL + SEO setup',
  ],
};

function getActionItems(plan) {
  switch (plan) {
    case 'automation':  return ACTION_ITEMS.automation;
    case 'scheduling':  return ACTION_ITEMS.scheduling;
    case 'website':     return ACTION_ITEMS.website;
    case 'bundle-as':   return [...ACTION_ITEMS.automation, ...ACTION_ITEMS.scheduling];
    case 'bundle-aw':   return [...ACTION_ITEMS.automation, ...ACTION_ITEMS.website];
    case 'bundle-full': return [...ACTION_ITEMS.automation, ...ACTION_ITEMS.scheduling, ...ACTION_ITEMS.website];
    default:            return ACTION_ITEMS.automation;
  }
}

// ── Parse multipart form with formidable ──
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB per file
      multiples: true,
    });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      // formidable v3 returns arrays for all field values — unwrap singles
      const unwrapped = {};
      for (const [k, v] of Object.entries(fields)) {
        unwrapped[k] = Array.isArray(v) ? v[0] : v;
      }
      resolve({ fields: unwrapped, files });
    });
  });
}

// ── Upload a single file buffer to Supabase Storage ──
async function uploadFileToSupabase(filePath, storagePath, mimeType) {
  const buffer = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage
    .from('client-assets')
    .upload(storagePath, buffer, {
      contentType: mimeType || 'application/octet-stream',
      upsert: false,
    });
  if (error) throw error;
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('client-assets')
    .getPublicUrl(storagePath);
  return urlData.publicUrl;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Parse multipart form
  let fields, files;
  try {
    ({ fields, files } = await parseForm(req));
  } catch (parseErr) {
    console.error('Form parse error:', parseErr.message);
    return res.status(400).json({ error: 'Failed to parse form data.' });
  }

  const {
    firstName, lastName, businessEmail, businessName, businessPhone,
    businessAddress, bookingLink, googleProfile, currentCRM,
    messageTone, additionalInfo, plan,
    hours,
    socials,
    services,
    calendarType,
    calendarLink,
    brandColors,
    logoStatus,
    existingPhotos,
    domainStatus,
    websiteGoals,
  } = fields;

  if (!firstName || !businessEmail || !businessName) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // ── Build folder name for this client's assets ──
  const safeName = (businessName || 'client').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const timestamp = Date.now();
  const folder = `${safeName}-${timestamp}`;

  // ── Upload logo file ──
  let logoFileUrl = '';
  try {
    const logoFile = files.logoFile;
    if (logoFile) {
      const f = Array.isArray(logoFile) ? logoFile[0] : logoFile;
      if (f && f.filepath) {
        const ext = path.extname(f.originalFilename || f.newFilename || 'logo');
        logoFileUrl = await uploadFileToSupabase(
          f.filepath,
          `${folder}/logo${ext}`,
          f.mimetype
        );
      }
    }
  } catch (uploadErr) {
    console.error('Logo upload error:', uploadErr.message);
  }

  // ── Upload photo files ──
  const photoFileUrls = [];
  try {
    // Photos can come as photosFiles (multiple) or photoFile_0, photoFile_1, etc.
    const photoKeys = Object.keys(files).filter(k => k === 'photosFiles' || k.startsWith('photoFile_'));
    for (const key of photoKeys) {
      const fileOrFiles = files[key];
      const fileList = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList[i];
        if (f && f.filepath) {
          const ext = path.extname(f.originalFilename || f.newFilename || 'photo.jpg');
          const url = await uploadFileToSupabase(
            f.filepath,
            `${folder}/photo-${photoFileUrls.length}${ext}`,
            f.mimetype
          );
          photoFileUrls.push(url);
        }
      }
    }
  } catch (uploadErr) {
    console.error('Photo upload error:', uploadErr.message);
  }

  // ── Parse JSON fields ──
  let hoursObj = {};
  try { hoursObj = hours ? JSON.parse(hours) : {}; } catch (_) {}

  let socialsArr = [];
  try { socialsArr = socials ? JSON.parse(socials) : []; } catch (_) {}

  let servicesArr = [];
  try { servicesArr = services ? JSON.parse(services) : []; } catch (_) {}

  let colorsArr = [];
  try { colorsArr = brandColors ? JSON.parse(brandColors) : []; } catch (_) {}

  // ── Build the brief JSON ──
  const brief = {
    generated: new Date().toISOString(),
    client: {
      name: `${firstName || ''} ${lastName || ''}`.trim(),
      email: businessEmail || '',
      phone: businessPhone || '',
      business: businessName || '',
      address: businessAddress || '',
      plan: plan || '',
    },
    automation: {
      phone: businessPhone || '',
      tone: messageTone || '',
      crm: currentCRM || '',
      hours: hoursObj,
      bookingLink: bookingLink || '',
      googleProfile: googleProfile || '',
    },
    scheduling: {
      services: servicesArr,
      calendarType: calendarType || '',
      calendarLink: calendarLink || '',
    },
    website: {
      goals: websiteGoals || '',
      brandColors: colorsArr,
      logoStatus: logoStatus || '',
      logoFileUrl: logoFileUrl,
      existingPhotos: existingPhotos || '',
      photoFileUrls: photoFileUrls,
      domainStatus: domainStatus || '',
    },
    social: socialsArr,
    notes: additionalInfo || '',
    assets: {
      briefUrl: '',      // filled in after upload
      logoUrl: logoFileUrl,
      photoUrls: photoFileUrls,
    },
    actionItems: getActionItems(plan || ''),
  };

  // ── Upload build brief JSON to Supabase Storage ──
  let buildBriefUrl = '';
  try {
    const briefJson = JSON.stringify(brief, null, 2);
    const briefBuffer = Buffer.from(briefJson, 'utf8');
    const briefStoragePath = `${folder}/build-brief.json`;
    const { error: briefUploadErr } = await supabase.storage
      .from('client-assets')
      .upload(briefStoragePath, briefBuffer, {
        contentType: 'application/json',
        upsert: false,
      });
    if (briefUploadErr) throw briefUploadErr;
    const { data: briefUrlData } = supabase.storage
      .from('client-assets')
      .getPublicUrl(briefStoragePath);
    buildBriefUrl = briefUrlData.publicUrl;
    // Patch brief with its own URL
    brief.assets.briefUrl = buildBriefUrl;
  } catch (briefErr) {
    console.error('Brief upload error:', briefErr.message);
  }

  // ── Build DB record ──
  const clientData = {
    first_name: firstName || '',
    last_name: lastName || '',
    email: businessEmail || '',
    business_name: businessName || '',
    business_phone: businessPhone || '',
    business_address: businessAddress || '',
    booking_link: bookingLink || '',
    google_profile: googleProfile || '',
    current_crm: currentCRM || '',
    message_tone: messageTone || '',
    additional_info: additionalInfo || '',
    plan: plan || 'unknown',
    hours: hours || '',
    services: JSON.stringify(servicesArr),
    calendar_type: calendarType || '',
    calendar_link: calendarLink || '',
    brand_colors: JSON.stringify(colorsArr),
    logo_status: logoStatus || '',
    logo_file_url: logoFileUrl,
    existing_photos: existingPhotos || '',
    photo_file_urls: JSON.stringify(photoFileUrls),
    domain_status: domainStatus || '',
    website_goals: websiteGoals || '',
    socials: JSON.stringify(socialsArr),
    build_brief_url: buildBriefUrl,
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
    }
  } catch (dbErr) {
    console.error('Supabase exception:', dbErr.message);
  }

  // 2. Send build brief to Roger
  try {
    // Enrich clientData with parsed arrays and brief URL for the email template
    const enrichedData = {
      ...clientData,
      socialsArr,
      servicesArr,
      colorsArr,
      logoFileUrl,
      photoFileUrls,
      buildBriefUrl,
      brief,
    };
    const briefEmail = getBuildBriefEmail(enrichedData);
    await resend.emails.send({
      from: 'Apex Automations System <contact@send.apexautomations.pro>',
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
      from: 'Roger Canales <contact@send.apexautomations.pro>',
      to: businessEmail,
      subject: confirmEmail.subject,
      html: confirmEmail.html,
    });
  } catch (emailErr) {
    console.error('Confirmation email error:', emailErr.message);
  }

  return res.status(200).json({ success: true, message: 'Onboarding received.' });
};
