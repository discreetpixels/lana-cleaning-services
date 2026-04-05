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

function formatDate(dateStr) {
  if (!dateStr) return dateStr;
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

const PACKAGE_DURATIONS = {
  '2h': 2, 'move-out': 8, 'reg': 3, 'deep': 6, 'off-e': 4, 'off-s': 3,
};

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

// GET - fetch a booking by ID
export async function GET(request, { params }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}

// PATCH - reschedule a booking
export async function PATCH(request, { params }) {
  const { id } = await params;
  const { date, time } = await request.json();

  const { data: booking, error: fetchError } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.google_calendar_event_id) {
    try {
      const calendar = await getCalendarClient();
      if (calendar) {
        const durationHours = PACKAGE_DURATIONS[booking.package] || 4;
        const startDateTime = new Date(`${date} ${time}`);
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
    } catch (calError) {
      console.error('Calendar update error:', calError);
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from('bookings')
    .update({ date, time })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE - cancel a booking
export async function DELETE(_request, { params }) {
  const { id } = await params;

  const { data: booking, error: fetchError } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.google_calendar_event_id) {
    try {
      const calendar = await getCalendarClient();
      if (calendar) {
        // sendUpdates: 'all' notifies the customer (attendee) of the cancellation
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: booking.google_calendar_event_id,
          sendUpdates: 'all',
        });
      }
    } catch (calError) {
      console.error('Calendar delete error:', calError);
    }
  }

  await supabaseAdmin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id);

  // Send cancellation email to customer
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    const packageName = PACKAGE_NAMES[booking.package] || booking.package;
    await transporter.sendMail({
      from: '"Lana Cleaning" <benarshy@gmail.com>',
      to: booking.email,
      subject: `Appointment Cancelled: ${formatDate(booking.date)} @ ${booking.time}`,
      html: `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1C1C1C;background:#FDFCF5;padding:40px;border:1px solid #E5E2D0;">
          <h1 style="font-size:22px;border-bottom:1px solid #E5E2D0;padding-bottom:20px;font-weight:900;letter-spacing:-0.03em;margin-top:0;">LANA CLEANING SERVICES</h1>
          <p style="font-size:16px;line-height:1.6;margin-top:28px;">Dear ${booking.name},</p>
          <p style="font-size:16px;line-height:1.6;">We're writing to let you know that your <strong>${packageName}</strong> appointment has been cancelled.</p>
          <div style="background:#FFF8F0;padding:24px;margin:28px 0;border:1px solid #FDE8CC;border-left:4px solid #F59E0B;">
            <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#92400E;font-weight:800;">Cancelled Appointment</p>
            <p style="margin:0;font-size:20px;font-weight:800;color:#1C1C1C;">${formatDate(booking.date)}</p>
            <p style="margin:4px 0 0;font-size:16px;color:#555;">${booking.time}</p>
          </div>
          <p style="font-size:14px;color:#4A4A4A;line-height:1.6;">If you have any questions or would like to rebook, please reply to this email and we'll be happy to help.</p>
          <p style="margin-top:32px;font-size:15px;">Best regards,<br/><strong>The Lana Team</strong></p>
          <div style="margin-top:48px;font-size:12px;color:#AAA;text-align:center;border-top:1px solid #EEE;padding-top:20px;">
            &copy; 2026 Lana Cleaning Services. All rights reserved.
          </div>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error('Cancellation email error:', emailErr);
  }

  return NextResponse.json({ success: true });
}
