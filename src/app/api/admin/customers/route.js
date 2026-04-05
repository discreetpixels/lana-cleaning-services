import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase';

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

// DELETE /api/admin/customers?email=... — removes all bookings for that customer
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  // Fetch all bookings for this customer
  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('id, google_calendar_event_id')
    .eq('email', email);

  if (bookings?.length) {
    // Delete Google Calendar events
    try {
      const calendar = await getCalendarClient();
      if (calendar) {
        await Promise.allSettled(
          bookings
            .filter(b => b.google_calendar_event_id)
            .map(b => calendar.events.delete({ calendarId: 'primary', eventId: b.google_calendar_event_id }))
        );
      }
    } catch (err) {
      console.error('Calendar cleanup error:', err);
    }

    // Hard delete all bookings
    const { error } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('email', email);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, deleted: bookings?.length || 0 });
}
