import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    // FETCH PERSISTENT TOKENS FROM DATABASE
    const { data: setting, error: settingsError } = await supabaseAdmin
      .from('admin_settings')
      .select('value, updated_at')
      .eq('key', 'google_auth_tokens')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (settingsError || !setting) {
      console.error('Settings fetch error:', settingsError);
      return NextResponse.json({ error: 'System not connected. Please visit /backendcontrol' }, { status: 500 });
    }

    const tokens = setting.value;

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth });

    // Fetch events for the next 30 days
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 30);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    const busy = {};

    // The exact time slot strings shown in the UI
    const TIME_SLOTS = [
      '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'
    ];

    events.forEach(event => {
      if (event.start.dateTime && event.end.dateTime) {
        const eventStart = new Date(event.start.dateTime);
        const eventEnd = new Date(event.end.dateTime);
        const dateStr = eventStart.toISOString().split('T')[0];

        if (!busy[dateStr]) busy[dateStr] = [];

        // Block every UI slot whose start time falls within the event window
        TIME_SLOTS.forEach(slot => {
          const [timePart, meridiem] = slot.split(' ');
          let [slotHour, slotMin] = timePart.split(':').map(Number);
          if (meridiem === 'PM' && slotHour !== 12) slotHour += 12;
          if (meridiem === 'AM' && slotHour === 12) slotHour = 0;

          // Build a Date for this slot on the same calendar day as the event
          const slotDate = new Date(eventStart);
          slotDate.setHours(slotHour, slotMin, 0, 0);

          // Slot is busy if it starts anywhere inside the event's window
          if (slotDate >= eventStart && slotDate < eventEnd) {
            if (!busy[dateStr].includes(slot)) {
              busy[dateStr].push(slot);
            }
          }
        });
      }
    });

    return NextResponse.json({ busy });
  } catch (error) {
    console.error('Availability API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
