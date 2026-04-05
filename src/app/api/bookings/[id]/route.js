import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

const PACKAGE_DURATIONS = {
  '2h': 2, '4h': 4, 'reg': 3, 'deep': 6, 'off-e': 4, 'off-s': 3,
};

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

  // Fetch current booking
  const { data: booking, error: fetchError } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Update Google Calendar event if we have a token
  const cookieStore = await cookies();
  const tokensCookie = cookieStore.get('google_auth_tokens');

  if (tokensCookie && booking.google_calendar_event_id) {
    try {
      const tokens = JSON.parse(tokensCookie.value);
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      auth.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth });

      const durationHours = PACKAGE_DURATIONS[booking.package] || 4;
      const startDateTime = new Date(`${date} ${time}`);
      const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

      await calendar.events.patch({
        calendarId: 'primary',
        eventId: booking.google_calendar_event_id,
        requestBody: {
          start: { dateTime: startDateTime.toISOString() },
          end: { dateTime: endDateTime.toISOString() },
        },
      });
    } catch (calError) {
      console.error("Calendar update error:", calError);
    }
  }

  // Update Supabase
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
export async function DELETE(request, { params }) {
  const { id } = await params;

  // Fetch current booking
  const { data: booking, error: fetchError } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Delete Google Calendar event
  const cookieStore = await cookies();
  const tokensCookie = cookieStore.get('google_auth_tokens');

  if (tokensCookie && booking.google_calendar_event_id) {
    try {
      const tokens = JSON.parse(tokensCookie.value);
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      auth.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: booking.google_calendar_event_id,
      });
    } catch (calError) {
      console.error("Calendar delete error:", calError);
    }
  }

  // Mark as cancelled in Supabase (soft delete)
  await supabaseAdmin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id);

  return NextResponse.json({ success: true });
}
