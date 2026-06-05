# Apex Automations — Automation Build Guide (Make.com)

## Setup Prerequisites
1. Create free Make.com account at make.com
2. Create free Twilio account at twilio.com (get a phone number ~$1/mo)
3. Create free Airtable account at airtable.com
4. Create free Calendly account at calendly.com

---

## Flow 1 — Missed Call Text-Back

**Platform:** Make.com + Twilio

### Steps:
1. **Trigger:** Twilio webhook — "New Incoming Call" (status = no-answer or missed)
2. **Action:** Twilio "Send SMS"
   - To: caller's number (from trigger)
   - From: your Twilio number
   - Body: "Hey! Sorry we missed your call at [Shop Name]. We'd love to help — reply here or book a time online: [Calendly link]"
3. **Action (optional):** Add caller to Airtable as new lead with status "Missed Call - Texted"

### Twilio Setup:
- In Twilio console: Phone Numbers → your number → Voice → "A call comes in" → set to webhook pointing at Make.com scenario URL
- In Make.com: Create scenario, add Twilio "Watch Calls" module or use webhook trigger

**Test:** Call your Twilio number from another phone, don't answer. Should receive text within 60 seconds.

---

## Flow 2 — Lead Follow-Up Sequence

**Platform:** Make.com + Twilio + Airtable

### Airtable Setup:
Create base: "Leads"
Fields:
- Name (text)
- Phone (phone)
- Email (email)
- Status (single select: New, Contacted, Day 1 Sent, Day 3 Sent, Day 7 Sent, Booked, Dead)
- Created Date (date)
- Source (text)

### Steps:
**Scenario A — Immediate welcome (trigger: new row in Airtable)**
1. Trigger: Airtable "Watch Records" — new row with Status = "New"
2. Action: Twilio SMS — "Thanks for reaching out to [Shop Name]! We'll have a quote to you within a few hours. Any questions in the meantime? 🙌"
3. Action: Update Airtable record Status → "Contacted"

**Scenario B — Day 1 follow-up (trigger: scheduled, runs daily)**
1. Trigger: Make.com Scheduler — runs every day at 10 AM
2. Action: Airtable "Search Records" — Status = "Contacted" AND Created Date = yesterday
3. Iterator: loop through results
4. Action: Twilio SMS — "Hey [Name], just following up from [Shop Name] on your quote. Still interested? Happy to answer any questions!"
5. Action: Update record Status → "Day 1 Sent"

**Scenario C — Day 3 follow-up**
Same structure as B, but:
- Search: Status = "Day 1 Sent" AND Created Date = 3 days ago
- Message: "Hey [Name] — still thinking it over? We have a couple spots open this week. Here's the booking link if you want to lock one in: [Calendly]"
- Update: "Day 3 Sent"

**Scenario D — Day 7 follow-up**
Same structure, but:
- Search: Status = "Day 3 Sent" AND Created Date = 7 days ago
- Message: "Hey [Name], last check-in from [Shop Name]. If the timing's not right, totally fine — we'll be here when you're ready. Booking link if you want it: [Calendly]"
- Update: "Day 7 Sent"

**Note:** Add date filtering carefully. Make.com has a "formatDate" function for comparisons.

---

## Flow 3 — Review Request Automation

**Platform:** Make.com + Twilio + Airtable

### Airtable Setup (add to existing Leads base or new "Jobs" base):
Add field: "Job Status" (single select: In Progress, Completed, Review Requested)
Add field: "Completed Date" (date)

### Steps:
**Scenario — Daily review requests (runs every day at 11 AM)**
1. Trigger: Scheduler — daily at 11 AM
2. Action: Airtable "Search Records" — Job Status = "Completed" AND Completed Date = yesterday
3. Iterator: loop through results
4. Action: Twilio SMS — "Hey [Name]! Thanks so much for coming into [Shop Name] — we hope you loved the results! If you have 30 seconds, a Google review would mean the world to us 🙏 [Google Review Link]"
5. Action: Update record Job Status → "Review Requested"

### How to get your Google Review Link:
- Google Maps → search your business → click "Get more reviews" button → copy the link
- Shorten with bit.ly for cleaner SMS

---

## Flow 4 — Customer Reactivation

**Platform:** Make.com + Twilio + Airtable

### Steps:
**Scenario A — 90-day check (runs weekly on Monday at 9 AM)**
1. Trigger: Scheduler — weekly Monday 9 AM
2. Action: Airtable "Search Records" — Job Status = "Completed" AND Completed Date = 90 days ago (±3 days)
3. Iterator: loop
4. Action: Twilio SMS — "Hey [Name]! It's been a little while since your last visit to [Shop Name] 👋 We're running a special this month — want to get your car back in? Book here: [Calendly]"
5. Action: Update record — add tag "Reactivation 1 Sent"

**Scenario B — 7-day follow-up to non-responders**
1. Trigger: Scheduler — weekly Monday 9 AM
2. Action: Airtable "Search Records" — tag = "Reactivation 1 Sent" AND sent date = 7 days ago AND NOT booked
3. Iterator: loop
4. Action: Twilio SMS — "Last call, [Name]! Our [offer] spots are filling up this week at [Shop Name]. Grab yours: [Calendly]"
5. Action: Update tag → "Reactivation 2 Sent"

---

## Testing Checklist

Before going live with any client:
- [ ] Trigger fires on correct event
- [ ] SMS sends to correct number
- [ ] Message looks right (no broken variables)
- [ ] Airtable updates correctly after each step
- [ ] No duplicate messages (add deduplication filters)
- [ ] Error handler added (Make.com has built-in error routing)
- [ ] Tested with real phone, not just test data

---

## Client Handoff
After going live, give client:
1. Airtable access (view only or editor — their choice)
2. Simple 1-page doc: "How to mark a job complete" (all they need to do)
3. Your contact info for questions
4. 30-day check-in scheduled

The client touches ONE thing: marking jobs complete in Airtable. Everything else is automated.
