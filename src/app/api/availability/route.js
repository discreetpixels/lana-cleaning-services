import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  const tokensCookie = cookieStore.get('google_auth_tokens');

  if (!tokensCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const tokens = JSON.parse(tokensCookie.value);

  try {
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

    events.forEach(event => {
      if (event.start.dateTime) {
        const start = new Date(event.start.dateTime);
        const dateStr = start.toISOString().split('T')[0];
        const timeStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        if (!busy[dateStr]) busy[dateStr] = [];
        busy[dateStr].push(timeStr);
      }
    });

    return NextResponse.json({ busy });
  } catch (error) {
    console.error('Availability API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
