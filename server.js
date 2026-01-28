import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
const app = express();

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const auth = new google.auth.GoogleAuth({
    keyFile: './service-account.json',
    scopes: SCOPES,
});

const calendar = google.calendar({ version: 'v3', auth });

app.use(express.static('dist')); // Serve built frontend
app.use(cors());
app.use(express.json());

const DOMAIN = process.env.RENDER_EXTERNAL_URL || 'http://localhost:5174';

// Helper to parse "Feb 4" "11:30 AM" into ISO Dates with timezone
const parseDateTime = (dateStr, timeStr) => {
    const currentYear = new Date().getFullYear();
    const dateParts = dateStr.split(' '); // ["Feb", "4"]
    const month = new Date(`${dateStr} ${currentYear}`).getMonth(); // 0-indexed
    const day = parseInt(dateParts[1]);

    const timeParts = timeStr.split(/[: ]/); // ["11", "30", "AM"]
    let hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const meridian = timeParts[2];

    if (meridian === 'PM' && hours !== 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;

    // Format as YYYY-MM-DDTHH:MM:SS (local time, timezone specified separately)
    const pad = (n) => n.toString().padStart(2, '0');
    const startStr = `${currentYear}-${pad(month + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00`;

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
    const endStr = `${currentYear}-${pad(month + 1)}-${pad(endDay)}T${pad(endHours)}:${pad(endMinutes)}:00`;

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
                scheduled_time: formData.selectedTime,
                memo: formData.memo
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/verify-booking', async (req, res) => {
    try {
        const { session_id } = req.body;
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            const meta = session.metadata;
            // Create Google Calendar Event
            const { start, end } = parseDateTime(meta.scheduled_date, meta.scheduled_time);

            await calendar.events.insert({
                calendarId: CALENDAR_ID,
                requestBody: {
                    summary: meta.service_address, // Use address as title
                    description: `Customer: ${meta.customer_name}\nAddress: ${meta.service_address}\nCounty: ${meta.county}\nPhone: ${session.customer_details?.phone || 'N/A'}\nEmail: ${session.customer_details?.email || 'N/A'}\n\nMemo: ${meta.memo || 'None'}`,
                    location: meta.service_address,
                    start: { dateTime: start, timeZone: 'America/Los_Angeles' },
                    end: { dateTime: end, timeZone: 'America/Los_Angeles' },
                }
            });
            console.log('Calendar event created for:', meta.customer_name);
            res.json({
                status: 'success',
                message: 'Booking verified and added to calendar',
                booking: {
                    date: meta.scheduled_date,
                    time: meta.scheduled_time,
                    name: meta.customer_name,
                    phone: session.customer_details?.phone
                }
            });
        } else {
            res.status(400).json({ status: 'failed', message: 'Payment not successful' });
        }
    } catch (error) {
        console.error('Error verifying booking:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check Availability Endpoint
app.get('/check-availability', async (req, res) => {
    try {
        const { date } = req.query; // Format: "Jan 25 2026" or "2026-01-25"
        if (!date) return res.status(400).json({ error: 'Date required' });

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

        res.json({ busy: busySlots });
    } catch (error) {
        console.error('Availability Check Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
