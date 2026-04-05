import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

const PACKAGE_DURATIONS = {
  '2h':       2,
  'move-out': 8,
  'reg':      3,
  'deep':     6,
  'off-e':    4,
  'off-s':    3,
};

const PACKAGE_NAMES = {
  '2h':       '2-Hour Quick Refresh',
  'move-out': 'Move-Out Deep Clean',
  'reg':      'Regular Maintenance',
  'deep':     'Deep Detailed Clean',
  'off-e':    'Executive Office Clean',
  'off-s':    'Studio/Creative Care',
};

const PACKAGE_PRICES = {
  '2h':       95,
  'move-out': 450,
  'reg':      160,
  'deep':     350,
  'off-e':    250,
  'off-s':    180,
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { date, time, package: pkgId, name, email, phone, address } = body;

    const cookieStore = await cookies();
    const tokensCookie = cookieStore.get('google_auth_tokens');

    console.log("Processing booking for:", name, date, time);

    let calendarEventId = null;
    const durationHours = PACKAGE_DURATIONS[pkgId] || 4;
    const packageName = PACKAGE_NAMES[pkgId] || pkgId;

    // 1. Google Calendar Integration - Fetch tokens from Supabase (Get the LATEST one)
    const { data: setting, error: settingsError } = await supabaseAdmin
      .from('admin_settings')
      .select('value, updated_at')
      .eq('key', 'google_auth_tokens')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (setting) {
      try {
        const tokens = setting.value;
        console.log("Tokens retrieved. Has refresh_token:", !!tokens.refresh_token);

        const auth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );
        auth.setCredentials(tokens);

        // Listen for token refreshes and save back to Supabase
        auth.on('tokens', async (newTokens) => {
          console.log("Access token refreshed. Saving to Supabase...");
          await supabaseAdmin.from('admin_settings').upsert({
            key: 'google_auth_tokens',
            value: { ...tokens, ...newTokens },
            updated_at: new Date().toISOString()
          });
        });

        const calendar = google.calendar({ version: 'v3', auth });

        const startDateTime = new Date(`${date} ${time}`);
        const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

        console.log("Attempting to insert calendar event:", {
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          package: packageName
        });

        const calEvent = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: `Lana Cleaning: ${packageName}`,
            location: address,
            description: `--- Lana Cleaning Services ---\nClient: ${name}\nPhone: ${phone}\nPackage: ${packageName}\nAddress: ${address}\n\nThank you for choosing Lana.`,
            start: { 
              dateTime: startDateTime.toISOString(),
              timeZone: 'America/Los_Angeles' // Defaulting to California time for now
            },
            end: { 
              dateTime: endDateTime.toISOString(),
              timeZone: 'America/Los_Angeles'
            },
            attendees: [{ email }],
            reminders: { useDefault: true },
          },
        });

        console.log("Calendar Event Created Successfully:", calEvent.data.id);
        calendarEventId = calEvent.data.id;
      } catch (calError) {
        console.error("Google Calendar Sync Error Details:", {
          message: calError.message,
          errors: calError.errors,
          code: calError.code,
          stack: calError.stack
        });
      }
    } else {
      console.warn("No Google Auth tokens found in admin_settings table.");
    }

    // 2. Save to Supabase
    const { data: booking, error: dbError } = await supabaseAdmin
      .from('bookings')
      .insert({
        name, email, phone, package: pkgId,
        date, time, address,
        status: 'confirmed',
        google_calendar_event_id: calendarEventId,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
    }

    const bookingId = booking?.id;
    const manageUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/booking/${bookingId}`;

    // 3. Email Confirmation (Gmail SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1C1C1C; background-color: #FDFCF5; padding: 40px; border: 1px solid #E5E2D0;">
        <h1 style="font-size: 24px; border-bottom: 1px solid #E5E2D0; padding-bottom: 20px; font-weight: 900; letter-spacing: -0.05em;">LANA CLEANING SERVICES</h1>
        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Dear ${name},</p>
        <p style="font-size: 16px; line-height: 1.6;">Your reservation for <strong>${packageName}</strong> has been confirmed. We look forward to bringing our personal touch to your space.</p>
        
        <div style="background-color: #F7F6EF; padding: 30px; margin: 30px 0; border: 1px solid #E5E2D0;">
          <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #2D5A27;">Appointment Details</h3>
          <p style="margin: 10px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 10px 0;"><strong>Arrival Time:</strong> ${time}</p>
          <p style="margin: 10px 0;"><strong>Duration:</strong> ${durationHours} hours</p>
          <p style="margin: 10px 0;"><strong>Location:</strong> ${address}</p>
          <p style="margin: 10px 0;"><strong>Reference #:</strong> ${bookingId?.slice(0, 8).toUpperCase() || 'N/A'}</p>
        </div>

        ${bookingId ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${manageUrl}" style="display: inline-block; background-color: #2D5A27; color: white; padding: 14px 32px; text-decoration: none; font-weight: 700; letter-spacing: 0.05em; font-size: 14px;">
            MANAGE MY BOOKING
          </a>
          <p style="font-size: 12px; color: #888; margin-top: 10px;">Reschedule or cancel your appointment</p>
        </div>
        ` : ''}

        <p style="font-size: 14px; color: #4A4A4A;">Questions? Reply to this email or call us directly.</p>
        <p style="margin-top: 40px; font-size: 16px;">Best regards,<br/><strong>The Lana Team</strong></p>
        
        <div style="margin-top: 60px; font-size: 12px; color: #AAA; text-align: center; border-top: 1px solid #EEE; padding-top: 20px;">
          &copy; 2026 Lana Cleaning Services. All rights reserved.
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: '"Lana Cleaning" <benarshy@gmail.com>',
        to: email,
        subject: `Reservation Confirmed: ${date} @ ${time}`,
        html: emailHtml,
      });
      console.log("Confirmation email sent.");
    } catch (emailErr) {
      console.error("Email Error:", emailErr);
    }

    // 4. WhatsApp Notification via Make.com
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const price = PACKAGE_PRICES[pkgId] || '0';
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'new_booking',
            name, email, phone, address,
            package: packageName,
            price: `$${price}`,
            date, time,
            booking_id: bookingId
          }),
        });
        console.log("Make.com Webhook triggered.");
      } catch (webhookErr) {
        console.error("Make.com Webhook Error:", webhookErr);
      }
    }

    return NextResponse.json({ success: true, bookingId });

  } catch (error) {
    console.error("Booking API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
