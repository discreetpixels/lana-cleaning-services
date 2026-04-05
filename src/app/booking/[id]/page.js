'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Calendar, Clock, MapPin, Package, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const PACKAGE_NAMES = {
  '2h': '2-Hour Quick Refresh',
  'move-out': 'Move-Out Deep Clean',
  'reg': 'Regular Maintenance',
  'deep': 'Deep Detailed Clean',
  'off-e': 'Executive Office Clean',
  'off-s': 'Studio/Creative Care',
};

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'
];

export default function ManageBooking() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('view'); // 'view' | 'reschedule' | 'cancelled'
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then(r => r.json())
      .then(data => { setBooking(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;
    setSubmitting(true);
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newDate, time: newTime }),
    });
    setSubmitting(false);
    if (res.ok) {
      setBooking({ ...booking, date: newDate, time: newTime });
      setMode('view');
      setMessage('✅ Booking rescheduled successfully!');
    } else {
      setMessage('❌ Failed to reschedule. Please try again.');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setSubmitting(true);
    const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    setSubmitting(false);
    if (res.ok) {
      setMode('cancelled');
    } else {
      setMessage('❌ Failed to cancel. Please contact us directly.');
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-outfit, sans-serif)' }}>
      <p>Loading your booking...</p>
    </div>
  );

  if (!booking || booking.error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-outfit, sans-serif)' }}>
      <div style={{ textAlign: 'center' }}>
        <XCircle size={64} color="#dc2626" style={{ margin: '0 auto 2rem' }} />
        <h1>Booking Not Found</h1>
        <p>This booking link may be invalid or expired.</p>
        <a href="/" style={{ color: '#2D5A27', fontWeight: 700 }}>← Back to Home</a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#FDFCF5', fontFamily: 'var(--font-outfit, sans-serif)', padding: '6rem 2rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2D5A27', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4rem', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Lana Cleaning
        </a>

        {mode === 'cancelled' ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <XCircle size={80} color="#dc2626" style={{ margin: '0 auto 2rem' }} />
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-playfair, serif)' }}>Booking Cancelled</h1>
            <p style={{ color: '#666', marginBottom: '3rem' }}>Your appointment has been cancelled and removed from our calendar.</p>
            <a href="/" style={{ display: 'inline-block', background: '#2D5A27', color: 'white', padding: '14px 32px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em' }}>
              BOOK AGAIN
            </a>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '3rem' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: booking.status === 'confirmed' ? '#2D5A27' : '#dc2626', fontWeight: 800 }}>
                {booking.status?.toUpperCase()}
              </span>
              <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-playfair, serif)', margin: '0.5rem 0 0' }}>Your Booking</h1>
            </div>

            {message && (
              <div style={{ background: message.includes('✅') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${message.includes('✅') ? '#86efac' : '#fca5a5'}`, padding: '1rem 1.5rem', marginBottom: '2rem', borderRadius: '2px' }}>
                {message}
              </div>
            )}

            {/* Booking Details */}
            <div style={{ border: '1px solid #E5E2D0', padding: '3rem', marginBottom: '2rem', background: 'white' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Package size={18} color="#2D5A27" />
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '2px' }}>Service</div>
                    <div style={{ fontWeight: 700 }}>{PACKAGE_NAMES[booking.package] || booking.package}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Calendar size={18} color="#2D5A27" />
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '2px' }}>Date</div>
                    <div style={{ fontWeight: 700 }}>{booking.date}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Clock size={18} color="#2D5A27" />
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '2px' }}>Time</div>
                    <div style={{ fontWeight: 700 }}>{booking.time}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <MapPin size={18} color="#2D5A27" />
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '2px' }}>Address</div>
                    <div style={{ fontWeight: 700 }}>{booking.address}</div>
                  </div>
                </div>
              </div>
            </div>

            {booking.status !== 'cancelled' && (
              <>
                {mode === 'view' && (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setMode('reschedule')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1.25rem', background: '#2D5A27', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      <RefreshCw size={16} /> Reschedule
                    </button>
                    <button onClick={handleCancel} disabled={submitting} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1.25rem', background: 'white', color: '#dc2626', border: '1px solid #dc2626', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      <XCircle size={16} /> Cancel Booking
                    </button>
                  </div>
                )}

                {mode === 'reschedule' && (
                  <div style={{ border: '1px solid #E5E2D0', padding: '3rem', background: 'white' }}>
                    <h3 style={{ margin: '0 0 2rem', fontSize: '1.25rem' }}>Choose New Date & Time</h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2D5A27', marginBottom: '0.5rem' }}>New Date</label>
                      <input
                        type="date"
                        value={newDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setNewDate(e.target.value)}
                        style={{ width: '100%', padding: '1rem', border: '1px solid #E5E2D0', fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2D5A27', marginBottom: '0.5rem' }}>New Time</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {TIME_SLOTS.map(slot => (
                          <button key={slot} onClick={() => setNewTime(slot)} style={{ padding: '1rem', border: `1px solid ${newTime === slot ? '#2D5A27' : '#E5E2D0'}`, background: newTime === slot ? '#2D5A27' : 'white', color: newTime === slot ? 'white' : '#1C1C1C', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={handleReschedule} disabled={!newDate || !newTime || submitting} style={{ flex: 1, padding: '1.25rem', background: '#2D5A27', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: (!newDate || !newTime) ? 0.5 : 1 }}>
                        {submitting ? 'Saving...' : 'Confirm Reschedule'}
                      </button>
                      <button onClick={() => setMode('view')} style={{ padding: '1.25rem 2rem', background: 'white', color: '#666', border: '1px solid #E5E2D0', cursor: 'pointer', fontWeight: 700 }}>
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            <div style={{ marginTop: '2rem', padding: '1rem', background: '#F7F6EF', fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
              Ref: <strong>{id?.slice(0, 8).toUpperCase()}</strong> · Booked {new Date(booking.created_at).toLocaleDateString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
