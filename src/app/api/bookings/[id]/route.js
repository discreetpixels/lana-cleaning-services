import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase';

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
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: booking.google_calendar_event_id,
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

  return NextResponse.json({ success: true });
}
