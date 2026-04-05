import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { date, time, package: pkgId, name, email, phone, address } = body;

    const cookieStore = await cookies();
    const tokensCookie = cookieStore.get('google_auth_tokens');

    console.log("Processing formal booking for:", name, date, time);

    // 1. Google Calendar Integration
    if (tokensCookie) {
      try {
        const tokens = JSON.parse(tokensCookie.value);
        const auth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        auth.setCredentials(tokens);
        const calendar = google.calendar({ version: 'v3', auth });

        const startDateTime = new Date(`${date} ${time}`);
        const endDateTime = new Date(startDateTime.getTime() + 4 * 60 * 60 * 1000); // 4h block

        await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: `Lana Cleaning: ${pkgId} Reservation`,
            location: address,
            description: `--- Lana Cleaning Services ---\nClient: ${name}\nPhone: ${phone}\nPackage: ${pkgId}\nAddress: ${address}\n\nThank you for choosing Lana.`,
            start: { dateTime: startDateTime.toISOString() },
            end: { dateTime: endDateTime.toISOString() },
            attendees: [{ email: email }],
            reminders: { useDefault: true },
          },
        });
      } catch (calError) {
        console.error("Google Calendar Sync Error:", calError);
      }
    }

    // 2. Email Confirmation (Gmail SMTP)
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
        <p style="font-size: 16px; line-height: 1.6;">Your reservation for the <strong>${pkgId}</strong> has been secured. We are looking forward to bringing our personal touch to your space.</p>
        
        <div style="background-color: #F7F6EF; padding: 30px; margin: 30px 0; border: 1px solid #E5E2D0;">
          <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #2D5A27;">Appointment Details</h3>
          <p style="margin: 10px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 10px 0;"><strong>Arrival Time:</strong> ${time}</p>
          <p style="margin: 10px 0;"><strong>Location:</strong> ${address}</p>
          <p style="margin: 10px 0;"><strong>Payment:</strong> Pending (Invoice will follow)</p>
        </div>

        <p style="font-size: 14px; color: #4A4A4A;">If you need to reschedule or have specific requests, please reply to this email or call us at (555) 123-4567.</p>
        
        <p style="margin-top: 40px; font-size: 16px;">Best regards,<br/><strong>The Lana Team</strong></p>
        
        <div style="margin-top: 60px; font-size: 12px; color: #AAA; text-align: center; border-top: 1px solid #EEE; padding-top: 20px;">
          &copy; 2026 Lana Cleaning Services. All rights reserved.
        </div>
      </div>
    `;

    // Attempt to send email
    try {
      await transporter.sendMail({
        from: '"Lana Cleaning" <hello@lanacleaning.com>',
        to: email,
        subject: `Reservation Confirmed: ${date} @ ${time}`,
        html: emailHtml,
      });
      console.log("Confirmation email sent successfully.");
    } catch (emailErr) {
      console.error("Email Sending Error:", emailErr);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Booking API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
