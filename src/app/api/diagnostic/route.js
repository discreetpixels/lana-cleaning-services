import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const steps = [];
  
  try {
    // 1. Check Supabase connection
    steps.push({ step: 'Supabase Lookup', status: 'pending' });
    const { data: setting, error: settingsError } = await supabaseAdmin
      .from('admin_settings')
      .select('*')
      .eq('key', 'google_auth_tokens')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (settingsError) throw new Error(`Supabase Error: ${settingsError.message}`);
    if (!setting) throw new Error("No tokens found in admin_settings table.");
    steps[0].status = 'success';

    // 2. Initializing Google Auth
    steps.push({ step: 'Google Auth Setup', status: 'pending' });
    const tokens = setting.value;
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    auth.setCredentials(tokens);
    steps[1].status = 'success';
    steps[1].details = { 
      has_access_token: !!tokens.access_token,
      has_refresh_token: !!tokens.refresh_token,
      expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toLocaleString() : 'N/A'
    };

    // 3. Test Google API Connection (Account Info)
    steps.push({ step: 'Verify Account', status: 'pending' });
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const userInfo = await oauth2.userinfo.get();
    steps[2].status = 'success';
    steps[2].details = { email: userInfo.data.email };

    // 4. Test Calendar List
    steps.push({ step: 'Calendar List', status: 'pending' });
    const calendar = google.calendar({ version: 'v3', auth });
    const calList = await calendar.calendarList.list();
    steps[3].status = 'success';
    steps[3].details = calList.data.items.map(c => ({ id: c.id, summary: c.summary, primary: c.primary }));

    return NextResponse.json({ 
      overall_status: 'healthy',
      diagnostic_report: steps,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ 
      overall_status: 'failed',
      error_message: error.message,
      failed_at: steps.length > 0 ? steps[steps.length - 1].step : 'Initialization',
      diagnostic_report: steps,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
