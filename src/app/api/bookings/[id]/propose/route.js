import { NextResponse } from 'next/server';
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
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export async function POST(request, { params }) {
  const { id } = await params;
  const { proposed_date, proposed_time } = await request.json();

  if (!proposed_date || !proposed_time) {
    return NextResponse.json({ error: 'proposed_date and proposed_time required' }, { status: 400 });
  }

  // Fetch booking
  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Generate a unique token
  const token = crypto.randomUUID();

  // Save proposal to booking
  const { error: updateError } = await supabaseAdmin
    .from('bookings')
    .update({ proposed_date, proposed_time, reschedule_token: token })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save proposal' }, { status: 500 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const confirmUrl = `${baseUrl}/reschedule/${token}`;
  const packageName = PACKAGE_NAMES[booking.package] || booking.package;

  // Send proposal email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const emailHtml = `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1C1C1C;background:#FDFCF5;padding:40px;border:1px solid #E5E2D0;">
      <h1 style="font-size:22px;border-bottom:1px solid #E5E2D0;padding-bottom:20px;font-weight:900;letter-spacing:-0.03em;margin-top:0;">LANA CLEANING SERVICES</h1>

      <p style="font-size:16px;line-height:1.6;margin-top:28px;">Dear ${booking.name},</p>
      <p style="font-size:16px;line-height:1.6;">We'd like to propose a new time for your <strong>${packageName}</strong> appointment. Please review the details below and confirm if the new time works for you.</p>

      <div style="background:#FFF8F0;padding:24px;margin:28px 0;border:1px solid #FDE8CC;border-left:4px solid #F59E0B;">
        <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#92400E;font-weight:800;">Current Appointment</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#1C1C1C;">${formatDate(booking.date)} at ${booking.time}</p>
      </div>

      <div style="background:#F0FDF4;padding:24px;margin:0 0 28px;border:1px solid #86efac;border-left:4px solid #2D5A27;">
        <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#2D5A27;font-weight:800;">Proposed New Time</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#1C1C1C;">${formatDate(proposed_date)} at ${proposed_time}</p>
      </div>

      <p style="font-size:14px;color:#555;line-height:1.6;">If this new time works for you, please click the button below to confirm. If not, simply ignore this email and your original appointment remains unchanged.</p>

      <div style="text-align:center;margin:36px 0;">
        <a href="${confirmUrl}" style="display:inline-block;background:#2D5A27;color:white;padding:16px 40px;text-decoration:none;font-weight:800;letter-spacing:0.05em;font-size:15px;">
          ACCEPT NEW TIME
        </a>
        <p style="font-size:12px;color:#999;margin-top:12px;">Or copy this link: ${confirmUrl}</p>
      </div>

      <p style="font-size:14px;color:#4A4A4A;line-height:1.6;">Questions? Reply to this email or call us directly.</p>
      <p style="margin-top:32px;font-size:15px;">Best regards,<br/><strong>The Lana Team</strong></p>

      <div style="margin-top:48px;font-size:12px;color:#AAA;text-align:center;border-top:1px solid #EEE;padding-top:20px;">
        &copy; 2026 Lana Cleaning Services. All rights reserved.
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"Lana Cleaning" <benarshy@gmail.com>',
      to: booking.email,
      subject: `Reschedule Proposal: ${formatDate(proposed_date)} @ ${proposed_time}`,
      html: emailHtml,
    });
  } catch (emailErr) {
    console.error('Proposal email error:', emailErr);
    // Still return success — proposal is saved even if email fails
  }

  return NextResponse.json({ success: true });
}
