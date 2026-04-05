import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabase';

const PACKAGE_NAMES = {
  '2h': '2-Hour Quick Refresh',
  'move-out': 'Move-Out Deep Clean',
  'reg': 'Regular Maintenance',
  'deep': 'Deep Detailed Clean',
  'off-e': 'Executive Office Clean',
  'off-s': 'Studio/Creative Care',
};

const PACKAGE_DURATIONS = {
  '2h': 2, 'move-out': 8, 'reg': 3, 'deep': 6, 'off-e': 4, 'off-s': 3,
};

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

async function getCalendarClient() {
  const { data: setting } = await supabaseAdmin
    .from('admin_settings')
    .select('value')
    .eq('key', 'google_auth_tokens')
    .maybeSingle();
  if (!setting) return null;
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  auth.setCredentials(setting.value);
  auth.on('tokens', async (newTokens) => {
    await supabaseAdmin.from('admin_settings').upsert({
      key: 'google_auth_tokens',
      value: { ...setting.value, ...newTokens },
      updated_at: new Date().toISOString(),
    });
  });
  return google.calendar({ version: 'v3', auth });
}

// GET — fetch booking details for the confirmation page
export async function GET(_request, { params }) {
  const { token } = await params;

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('id,name,email,package,date,time,proposed_date,proposed_time,reschedule_token,status')
    .eq('reschedule_token', token)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

// POST — accept or decline
export async function POST(request, { params }) {
  const { token } = await params;
  const { action } = await request.json(); // 'accept' | 'decline'

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('reschedule_token', token)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
  }

  if (action === 'decline') {
    await supabaseAdmin
      .from('bookings')
      .update({ proposed_date: null, proposed_time: null, reschedule_token: null })
      .eq('id', booking.id);
    return NextResponse.json({ success: true, action: 'declined' });
  }

  if (action === 'accept') {
    const newDate = booking.proposed_date;
    const newTime = booking.proposed_time;
    const packageName = PACKAGE_NAMES[booking.package] || booking.package;

    // Update Google Calendar event
    if (booking.google_calendar_event_id) {
      try {
        const calendar = await getCalendarClient();
        if (calendar) {
          const durationHours = PACKAGE_DURATIONS[booking.package] || 4;
          const startDateTime = new Date(`${newDate} ${newTime}`);
          const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);
          await calendar.events.patch({
            calendarId: 'primary',
            eventId: booking.google_calendar_event_id,
            requestBody: {
              start: { dateTime: startDateTime.toISOString(), timeZone: 'America/Los_Angeles' },
              end: { dateTime: endDateTime.toISOString(), timeZone: 'America/Los_Angeles' },
            },
          });
        }
      } catch (err) {
        console.error('Calendar update error:', err);
      }
    }

    // Update booking in Supabase
    await supabaseAdmin
      .from('bookings')
      .update({
        date: newDate,
        time: newTime,
        proposed_date: null,
        proposed_time: null,
        reschedule_token: null,
      })
      .eq('id', booking.id);

    // Send confirmation email to customer
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: false,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      await transporter.sendMail({
        from: '"Lana Cleaning" <benarshy@gmail.com>',
        to: booking.email,
        subject: `Appointment Rescheduled: ${formatDate(newDate)} @ ${newTime}`,
        html: `
          <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1C1C1C;background:#FDFCF5;padding:40px;border:1px solid #E5E2D0;">
            <h1 style="font-size:22px;border-bottom:1px solid #E5E2D0;padding-bottom:20px;font-weight:900;letter-spacing:-0.03em;margin-top:0;">LANA CLEANING SERVICES</h1>
            <p style="font-size:16px;line-height:1.6;margin-top:28px;">Dear ${booking.name},</p>
            <p style="font-size:16px;line-height:1.6;">Your <strong>${packageName}</strong> appointment has been successfully rescheduled.</p>
            <div style="background:#F0FDF4;padding:24px;margin:28px 0;border:1px solid #86efac;">
              <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#2D5A27;font-weight:800;">New Appointment</p>
              <p style="margin:0;font-size:20px;font-weight:800;color:#1C1C1C;">${formatDate(newDate)}</p>
              <p style="margin:4px 0 0;font-size:16px;color:#555;">${newTime}</p>
            </div>
            <p style="font-size:14px;color:#4A4A4A;">We look forward to seeing you. Questions? Reply to this email.</p>
            <p style="margin-top:32px;font-size:15px;">Best regards,<br/><strong>The Lana Team</strong></p>
            <div style="margin-top:48px;font-size:12px;color:#AAA;text-align:center;border-top:1px solid #EEE;padding-top:20px;">
              &copy; 2026 Lana Cleaning Services. All rights reserved.
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error('Confirmation email error:', err);
    }

    return NextResponse.json({ success: true, action: 'accepted', newDate, newTime });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
