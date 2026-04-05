'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

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

export default function ReschedulePage() {
  const { token } = useParams();
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | accepted | declined | error
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reschedule/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.booking) {
          setBooking(data.booking);
          setStatus('ready');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [token]);

  const handleAction = async (action) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reschedule/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(data.action === 'accepted' ? 'accepted' : 'declined');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6EF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'var(--font-sans)' }}>

      {/* Logo / Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2D5A27' }}>Lana Cleaning Services</div>
      </div>

      <div style={{ background: 'white', border: '1px solid #E5E2D0', padding: '3rem', maxWidth: '500px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {status === 'loading' && (
          <div style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>Loading your appointment details...</div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ margin: '0 0 0.5rem', fontWeight: 900 }}>Link Expired</h2>
            <p style={{ color: '#666', fontSize: '0.95rem' }}>This reschedule link is no longer valid. Please contact us directly if you need to make changes.</p>
          </div>
        )}

        {status === 'accepted' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: '#F0FDF4', border: '1px solid #86efac', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem' }}>✓</div>
            <h2 style={{ margin: '0 0 0.5rem', fontWeight: 900, color: '#2D5A27' }}>Appointment Confirmed</h2>
            <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Your appointment has been rescheduled. A confirmation email has been sent to you.
            </p>
          </div>
        )}

        {status === 'declined' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: '#FFF7ED', border: '1px solid #FDE8CC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem' }}>✕</div>
            <h2 style={{ margin: '0 0 0.5rem', fontWeight: 900 }}>Original Time Kept</h2>
            <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: 1.6 }}>
              No problem — your original appointment remains unchanged. We&apos;ll be in touch if we need to make further arrangements.
            </p>
          </div>
        )}

        {status === 'ready' && booking && (
          <>
            <h2 style={{ margin: '0 0 0.25rem', fontWeight: 900, fontSize: '1.4rem' }}>Reschedule Request</h2>
            <p style={{ color: '#666', margin: '0 0 2rem', fontSize: '0.9rem' }}>
              Hi {booking.name}, we&apos;d like to move your {PACKAGE_NAMES[booking.package] || booking.package} appointment.
            </p>

            {/* Current */}
            <div style={{ background: '#FFF8F0', border: '1px solid #FDE8CC', borderLeft: '4px solid #F59E0B', padding: '1.25rem 1.5rem', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, color: '#92400E', marginBottom: '4px' }}>Current Appointment</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{formatDate(booking.date)}</div>
              <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '2px' }}>{booking.time}</div>
            </div>

            {/* Arrow */}
            <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#aaa', margin: '0.5rem 0' }}>↓</div>

            {/* Proposed */}
            <div style={{ background: '#F0FDF4', border: '1px solid #86efac', borderLeft: '4px solid #2D5A27', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, color: '#2D5A27', marginBottom: '4px' }}>Proposed New Time</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{formatDate(booking.proposed_date)}</div>
              <div style={{ color: '#555', fontSize: '0.9rem', marginTop: '2px' }}>{booking.proposed_time}</div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Does the new time work for you? Click <strong>Accept</strong> to confirm, or <strong>Decline</strong> to keep your original appointment.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => handleAction('accept')}
                disabled={submitting}
                style={{ flex: 1, background: '#2D5A27', color: 'white', border: 'none', padding: '1rem', fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.95rem', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Processing...' : 'Accept New Time'}
              </button>
              <button
                onClick={() => handleAction('decline')}
                disabled={submitting}
                style={{ flex: 1, background: 'transparent', color: '#666', border: '1px solid #ddd', padding: '1rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }}
              >
                Decline
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#aaa' }}>
        © 2026 Lana Cleaning Services
      </div>
    </div>
  );
}
