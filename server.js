import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
const app = express();

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

// Check if Google Calendar is properly configured
// Render.com stores secret files in /etc/secrets/
const SERVICE_ACCOUNT_PATHS = [
    '/etc/secrets/service-account.json',  // Render.com secret files location
    './service-account.json'               // Local development
];

const SERVICE_ACCOUNT_PATH = SERVICE_ACCOUNT_PATHS.find(p => fs.existsSync(p));
const isCalendarConfigured = CALENDAR_ID && SERVICE_ACCOUNT_PATH;

let calendar = null;
if (isCalendarConfigured) {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_PATH,
            scopes: SCOPES,
        });
        calendar = google.calendar({ version: 'v3', auth });
        console.log('✓ Google Calendar configured successfully using:', SERVICE_ACCOUNT_PATH);
    } catch (error) {
        console.error('✗ Google Calendar configuration error:', error.message);
    }
} else {
    console.warn('⚠ Google Calendar NOT configured:');
    if (!CALENDAR_ID) console.warn('  - Missing GOOGLE_CALENDAR_ID environment variable');
    if (!SERVICE_ACCOUNT_PATH) console.warn('  - Missing service-account.json file (checked: ' + SERVICE_ACCOUNT_PATHS.join(', ') + ')');
    console.warn('  Calendar sync will be disabled. Appointments will still be accepted.');
}

app.use(express.static('dist')); // Serve built frontend
app.use(cors());
app.use(express.json());

const DOMAIN = process.env.RENDER_EXTERNAL_URL || 'http://localhost:5174';

// Helper to parse "Feb 4" "11:30 AM" and year into ISO Dates with timezone
const parseDateTime = (dateStr, timeStr, yearStr) => {
    // Use provided year or fall back to current year
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
    const dateParts = dateStr.split(' '); // ["Feb", "4"]
    const month = new Date(`${dateStr} ${year}`).getMonth(); // 0-indexed
    const day = parseInt(dateParts[1]);

    const timeParts = timeStr.split(/[: ]/); // ["11", "30", "AM"]
    let hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const meridian = timeParts[2];

    if (meridian === 'PM' && hours !== 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;

    // Format as YYYY-MM-DDTHH:MM:SS (local time, timezone specified separately)
    const pad = (n) => n.toString().padStart(2, '0');
    const startStr = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00`;

    // Calculate end time (90 minutes later)
    let endHours = hours;
    let endMinutes = minutes + 90;
    let endDay = day;
    if (endMinutes >= 60) {
        endHours += Math.floor(endMinutes / 60);
        endMinutes = endMinutes % 60;
    }
    if (endHours >= 24) {
        endHours -= 24;
        endDay += 1;
    }
    const endStr = `${year}-${pad(month + 1)}-${pad(endDay)}T${pad(endHours)}:${pad(endMinutes)}:00`;

    return { start: startStr, end: endStr };
};

app.post('/create-checkout-session', async (req, res) => {
    try {
        const formData = req.body;

        // Dynamic pricing: use totalPrice from frontend, or calculate
        const truckCount = parseInt(formData.truckCount) || 1;
        let pricePerTruck = 199; // Default Owner Operator price
        if (truckCount >= 2 && truckCount <= 10) pricePerTruck = 175;
        else if (truckCount >= 11) pricePerTruck = 145;

        const totalPrice = formData.totalPrice || (truckCount * pricePerTruck);

        const lineItems = [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Clean Truck Inspection (${truckCount} truck${truckCount > 1 ? 's' : ''})`,
                        description: `${formData.name} at ${formData.location} - $${pricePerTruck}/truck × ${truckCount} trucks`,
                    },
                    unit_amount: pricePerTruck * 100,
                },
                quantity: truckCount,
            },
        ];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            // Include session_id in success URL to retrieve details later
            success_url: `${DOMAIN}?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${DOMAIN}?canceled=true`,
            phone_number_collection: { enabled: true },
            metadata: {
                customer_name: formData.name,
                service_address: formData.location,
                county: formData.county,
                scheduled_date: formData.selectedDate,
                scheduled_year: formData.selectedYear ? String(formData.selectedYear) : '',
                scheduled_time: formData.selectedTime,
                memo: formData.memo,
                is_quick_charge: formData.isQuickCharge ? 'true' : 'false'
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function to create calendar event with retry
const createCalendarEventWithRetry = async (eventData, maxRetries = 3) => {
    // Check if calendar is configured
    if (!calendar || !isCalendarConfigured) {
        throw new Error('Google Calendar is not configured. Please contact support to set up calendar integration.');
    }

    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await calendar.events.insert({
                calendarId: CALENDAR_ID,
                requestBody: eventData
            });
            return result;
        } catch (error) {
            lastError = error;
            console.error(`Calendar API attempt ${attempt}/${maxRetries} failed:`, error.message);
            if (attempt < maxRetries) {
                // Exponential backoff: 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
            }
        }
    }
    throw lastError;
};

app.post('/verify-booking', async (req, res) => {
    try {
        const { session_id } = req.body;

        if (!session_id) {
            return res.status(400).json({
                status: 'failed',
                message: 'Missing session_id',
                calendar_synced: false
            });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            const meta = session.metadata;

            // Check if this is a Quick Charge (no calendar event needed)
            if (meta.is_quick_charge === 'true') {
                console.log('Quick Charge payment verified for:', meta.customer_name);
                return res.json({
                    status: 'success',
                    message: 'Quick Charge payment verified',
                    calendar_synced: false,
                    is_quick_charge: true,
                    booking: {
                        name: meta.customer_name,
                        phone: session.customer_details?.phone
                    }
                });
            }

            // Validate required metadata for scheduled appointments
            if (!meta.scheduled_date || !meta.scheduled_time) {
                console.error('Missing appointment date/time in metadata:', meta);
                return res.status(400).json({
                    status: 'failed',
                    message: 'Missing appointment date or time',
                    calendar_synced: false
                });
            }

            // Create Google Calendar Event with retry
            const { start, end } = parseDateTime(meta.scheduled_date, meta.scheduled_time, meta.scheduled_year);

            const eventData = {
                summary: meta.service_address || 'Truck Inspection',
                description: `Customer: ${meta.customer_name}\nAddress: ${meta.service_address}\nCounty: ${meta.county || 'N/A'}\nPhone: ${session.customer_details?.phone || 'N/A'}\nEmail: ${session.customer_details?.email || 'N/A'}\n\nMemo: ${meta.memo || 'None'}`,
                location: meta.service_address,
                start: { dateTime: start, timeZone: 'America/Los_Angeles' },
                end: { dateTime: end, timeZone: 'America/Los_Angeles' },
            };

            try {
                await createCalendarEventWithRetry(eventData);
                console.log('Calendar event created for:', meta.customer_name, 'on', meta.scheduled_date, meta.scheduled_year, 'at', meta.scheduled_time);

                res.json({
                    status: 'success',
                    message: 'Booking verified and added to calendar',
                    calendar_synced: true,
                    booking: {
                        date: meta.scheduled_date,
                        year: meta.scheduled_year,
                        time: meta.scheduled_time,
                        name: meta.customer_name,
                        phone: session.customer_details?.phone
                    }
                });
            } catch (calendarError) {
                // Payment succeeded but calendar sync failed - this is critical
                console.error('CRITICAL: Calendar sync failed after payment:', calendarError);
                res.status(500).json({
                    status: 'partial',
                    message: 'Payment successful but calendar sync failed. Please contact support.',
                    calendar_synced: false,
                    calendar_error: calendarError.message,
                    booking: {
                        date: meta.scheduled_date,
                        year: meta.scheduled_year,
                        time: meta.scheduled_time,
                        name: meta.customer_name,
                        phone: session.customer_details?.phone
                    }
                });
            }
        } else {
            res.status(400).json({
                status: 'failed',
                message: 'Payment not successful',
                calendar_synced: false
            });
        }
    } catch (error) {
        console.error('Error verifying booking:', error);
        res.status(500).json({
            status: 'error',
            error: error.message,
            calendar_synced: false
        });
    }
});

// Check Availability Endpoint
app.get('/check-availability', async (req, res) => {
    try {
        const { date } = req.query; // Format: "Jan 25 2026" or "2026-01-25"
        if (!date) return res.status(400).json({ error: 'Date required' });

        // If calendar is not configured, return empty (all slots available)
        if (!calendar || !isCalendarConfigured) {
            console.warn('Calendar not configured - returning empty availability');
            return res.json({ busy: [], calendar_configured: false });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(7, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(21, 0, 0, 0); // Extended to 9 PM to catch 7 PM bookings (90 min duration)

        const response = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            timeZone: 'America/Los_Angeles',
            singleEvents: true,
            orderBy: 'startTime',
        });

        const busySlots = response.data.items.map(event => ({
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            title: event.summary || 'Busy'
        }));

        res.json({ busy: busySlots, calendar_configured: true });
    } catch (error) {
        console.error('Availability Check Error:', error);
        res.status(500).json({ error: error.message, calendar_configured: false });
    }
});

app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
