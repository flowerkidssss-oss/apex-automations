# Supabase Setup

## 1. Create free account
Go to https://supabase.com → Sign up (free, no credit card)

## 2. Create a new project
Name it: apex-automations
Region: US East (or closest to you)

## 3. Create the table
In the Supabase dashboard → Table Editor → New Table

Table name: onboarding_submissions
Enable Row Level Security: OFF (for now)

Columns (add these — id and created_at are auto-generated):
| Column | Type | Default |
|---|---|---|
| id | int8 | auto |
| created_at | timestamptz | now() |
| first_name | text | |
| last_name | text | |
| email | text | |
| business_name | text | |
| business_phone | text | |
| business_address | text | |
| booking_link | text | |
| google_profile | text | |
| current_crm | text | |
| message_tone | text | |
| additional_info | text | |
| plan | text | |
| hours | text | |
| services | text | |
| calendar_type | text | |
| brand_colors | text | |
| logo_status | text | |
| existing_photos | text | |
| domain_status | text | |
| website_goals | text | |
| status | text | 'pending_build' |

## 4. Get your credentials
Settings → API → copy:
- Project URL → this is your SUPABASE_URL
- service_role key (under Project API keys) → this is your SUPABASE_SERVICE_KEY

## 5. Add to Vercel environment variables
Vercel dashboard → your project → Settings → Environment Variables → Add:
- SUPABASE_URL = your project URL
- SUPABASE_SERVICE_KEY = your service_role key
- RESEND_API_KEY = your Resend key (if not already added)

## 6. Redeploy on Vercel
After adding env vars, go to Deployments → Redeploy latest.

Done. Every onboarding form submission will now save to this table automatically.
