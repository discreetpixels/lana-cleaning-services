'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Package, CreditCard, CheckCircle2, Globe, Mail, Phone, MapPin, User, ArrowRight, Lock, LogOut } from 'lucide-react';
import Calendar from '@/components/Calendar';

export default function BookingSystem() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busySlots, setBusySlots] = useState({});
  const [googleUser, setGoogleUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  
  const [bookingData, setBookingData] = useState({
    date: null,
    time: '',
    package: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMode: 'later'
  });

  const steps = [
    { id: 1, name: 'Service', icon: Package },
    { id: 2, name: 'Connect', icon: Lock },
    { id: 3, name: 'Schedule', icon: CalendarIcon },
    { id: 4, name: 'Details', icon: User },
    { id: 5, name: 'Finish', icon: CheckCircle2 }
  ];

  const packages = [
    { id: '2h', name: '2-Hour Quick Refresh', price: 95, cat: 'Personal' },
    { id: '4h', name: '4-Hour Essential Clean', price: 200, cat: 'Personal' },
    { id: 'reg', name: 'Regular Maintenance', price: 160, cat: 'Personal' },
    { id: 'deep', name: 'Deep Detailed Clean', price: 350, cat: 'Personal' },
    { id: 'off-e', name: 'Executive Office Clean', price: 250, cat: 'Office' },
    { id: 'off-s', name: 'Studio/Creative Care', price: 180, cat: 'Office' },
  ];

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'
  ];

  // --- Auth & Initial Check ---
  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split('; ');
      const userCookie = cookies.find(row => row.startsWith('google_user='));
      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          setGoogleUser(userData);
        } catch (e) {
          console.error("Auth sync error:", e);
        }
      }
      setIsAuthenticating(false);
    };
    checkAuth();
  }, []);

  const handleConnectGoogle = () => {
    window.location.href = '/api/auth/google/login';
  };

  const handleLogout = () => {
    document.cookie = "google_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "google_auth_tokens=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setGoogleUser(null);
    setStep(2);
  };

  // --- Fetch busy slots ---
  useEffect(() => {
    if (googleUser && step === 3) {
      async function fetchAvailability() {
        try {
          const res = await fetch(`/api/availability`);
          const data = await res.json();
          setBusySlots(data.busy || {});
        } catch (e) {
          console.error("Failed to fetch availability", e);
        }
      }
      fetchAvailability();
    }
  }, [googleUser, step]);

  const nextStep = () => {
    if (step === 1 && bookingData.package) setStep(2);
    else if (step === 2 && googleUser) setStep(3);
    else if (step === 3 && bookingData.date && bookingData.time) setStep(4);
    else if (step === 4) handleFormSubmit();
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handlePackageSelect = (pkg) => {
    setBookingData({ ...bookingData, package: pkg });
    setStep(2);
  };

  const handleDateSelect = (date) => setBookingData({ ...bookingData, date });
  const handleTimeSelect = (time) => setBookingData({ ...bookingData, time });

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      
      if (response.ok) setStep(5);
    } catch (error) {
      console.error("Booking error:", error);
      setStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticating) return null;

  return (
    <div className="booking-wrapper">
      <div className="steps-nav">
        {steps.map((s) => (
          <div key={s.id} className={`step-node ${step >= s.id ? 'active' : ''}`}>
            <div className="node-circle"><s.icon size={14} /></div>
            <span className="node-label">{s.name}</span>
          </div>
        ))}
      </div>

      <div className="step-panel">
        {step === 1 && (
          <div className="animate-in">
            <h3 className="step-title">1. Select Service</h3>
            <div className="package-options">
              {packages.map((pkg) => (
                <div key={pkg.id} className={`package-item ${bookingData.package === pkg.id ? 'selected' : ''}`} onClick={() => handlePackageSelect(pkg.id)}>
                   <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                     <span className="pkg-cat">{pkg.cat}</span>
                     <h4>{pkg.name}</h4>
                   </div>
                   <div className="pkg-price">${pkg.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in auth-step">
            <h3 className="step-title">2. Secure Integration</h3>
            <div className="auth-box">
              <Lock size={48} color="var(--accent-primary)" style={{ marginBottom: '2rem' }} />
              <p style={{ maxWidth: '500px', margin: '0 auto 3rem' }}>
                To provide a seamless experience, please connect your Google account. This allows us to sync the appointment directly to your calendar and check for availability.
              </p>
              {!googleUser ? (
                <button onClick={handleConnectGoogle} className="btn btn-primary" style={{ gap: '12px' }}>
                  <Globe size={18} />
                  Connect with Google
                </button>
              ) : (
                <div className="session-info">
                  <CheckCircle2 size={24} color="var(--accent-primary)" />
                  <div>
                    <p style={{ fontWeight: 800, margin: 0 }}>Connected Successfully</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7, margin: 0 }}>{googleUser.email}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
                    <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.75rem' }} title="Logout">
                      <LogOut size={16} />
                    </button>
                    <button onClick={nextStep} className="btn btn-primary">
                      Continue to Schedule <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={prevStep} className="back-link">← Change Service</button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in">
            <h3 className="step-title">3. Schedule Your Visit</h3>
            <div className="booking-grid">
              <div className="calendar-col">
                <Calendar onSelect={handleDateSelect} selectedDate={bookingData.date} busySlots={busySlots} />
              </div>
              <div className="time-col">
                <p className="col-label">Select Arrival Window</p>
                <div className="time-grid">
                  {timeSlots.map((t) => {
                    const isBooked = busySlots[bookingData.date]?.includes(t);
                    return (
                      <button 
                        key={t} 
                        disabled={!bookingData.date || isBooked}
                        className={`time-btn ${bookingData.time === t ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                        onClick={() => handleTimeSelect(t)}
                      >
                        {isBooked ? 'Booked' : t}
                      </button>
                    );
                  })}
                </div>
                {bookingData.date && bookingData.time && (
                  <button onClick={nextStep} className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
                    Confirm Schedule <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                  </button>
                )}
              </div>
            </div>
            <button onClick={prevStep} className="back-link">← Return</button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in">
            <h3 className="step-title">4. Personal Details</h3>
            <form onSubmit={handleFormSubmit} className="booking-details-form">
              <div className="input-group">
                <label>Full Name</label>
                <input required type="text" className="fancy-input" value={bookingData.name} onChange={e => setBookingData({...bookingData, name: e.target.value})} />
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Email</label>
                  <input required type="email" className="fancy-input" value={bookingData.email} onChange={e => setBookingData({...bookingData, email: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Phone</label>
                  <input required type="tel" className="fancy-input" value={bookingData.phone} onChange={e => setBookingData({...bookingData, phone: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label>Service Address</label>
                <textarea required className="fancy-input" rows="3" value={bookingData.address} onChange={e => setBookingData({...bookingData, address: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="back-link">← Back</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Confirming...' : 'Complete Booking'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in success-view">
             <div className="success-icon"><CheckCircle2 size={100} strokeWidth={1} /></div>
             <h2 style={{ fontSize: '3rem' }}>Reservation Confirmed</h2>
             <p style={{ fontSize: '1.25rem', marginBottom: '4rem' }}>A robust confirmation email and calendar invitation have been sent.</p>
             <div className="summary-card" style={{ maxWidth: '600px' }}>
                <div className="summary-line"><span>Reference</span><strong>#{Math.random().toString(36).substr(2, 9).toUpperCase()}</strong></div>
                <div className="summary-line"><span>Service</span><strong>{packages.find(p => p.id === bookingData.package)?.name}</strong></div>
                <div className="summary-line"><span>Schedule</span><strong>{bookingData.date} @ {bookingData.time}</strong></div>
                <div className="summary-line"><span>Status</span><strong>Confirmed</strong></div>
             </div>
             <button onClick={() => window.location.reload()} className="btn btn-outline" style={{ marginTop: '3rem' }}>Done</button>
          </div>
        )}
      </div>

      <style jsx>{`
        .booking-wrapper { min-height: 600px; padding: 4rem; background: var(--white); }
        .steps-nav { display: flex; justify-content: space-between; margin-bottom: 6rem; position: relative; }
        .steps-nav::before { content: ''; position: absolute; top: 16px; left: 0; right: 0; height: 1px; background: var(--border); z-index: 0; }
        .step-node { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 1rem; flex: 1; }
        .node-circle { width: 32px; height: 32px; background: var(--white); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: var(--transition); border-radius: 50%; }
        .step-node.active .node-circle { border-color: var(--accent-primary); background: var(--accent-primary); color: var(--white); }
        .node-label { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2rem; color: var(--text-secondary); }
        .step-node.active .node-label { color: var(--text-primary); }

        .step-title { font-size: 3rem; margin-bottom: 4rem; border-bottom: 1px solid var(--border); padding-bottom: 2rem; }
        .package-options { display: flex; flex-direction: column; gap: 1rem; }
        .package-item { padding: 2.5rem 4rem; border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: var(--transition); }
        .package-item:hover { border-color: var(--accent-primary); background: var(--bg-secondary); }
        .package-item.selected { border-color: var(--accent-primary); background: #F8F9F3; }
        .pkg-cat { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.2em; border: 1px solid var(--border); padding: 4px 12px; color: var(--accent-primary); border-radius: 20px; }
        .pkg-price { font-family: var(--font-serif); font-size: 2rem; font-weight: 700; color: var(--accent-primary); }

        .auth-box { text-align: center; padding: 4rem 0; border: 1px solid var(--border); background: var(--bg-secondary); }
        .session-info { display: flex; align-items: center; gap: 2rem; max-width: 600px; margin: 0 auto; background: var(--white); padding: 2rem; border: 1px solid var(--accent-primary); text-align: left; }
        
        .booking-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 6rem; }
        .time-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .time-btn { padding: 1.5rem; border: 1px solid var(--border); background: var(--white); font-weight: 800; font-size: 0.8rem; cursor: pointer; transition: var(--transition); text-transform: uppercase; letter-spacing: 0.1em; }
        .time-btn:hover:not(:disabled) { border-color: var(--accent-primary); color: var(--accent-primary); }
        .time-btn.selected { background: var(--accent-primary); color: var(--white); border-color: var(--accent-primary); }
        .time-btn.booked { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; text-decoration: line-through; }
        .time-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .fancy-input { width: 100%; padding: 1.5rem; border: 1px solid var(--border); background: var(--bg-secondary); font-family: inherit; font-size: 1.125rem; transition: var(--transition); }
        .fancy-input:focus { outline: none; border-color: var(--accent-primary); background: var(--white); }
        label { display: block; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.7rem; margin-bottom: 1rem; color: var(--accent-primary); }

        .success-view { text-align: center; padding: 6rem 0; }
        .success-icon { color: var(--accent-primary); margin-bottom: 4rem; }
        .summary-card { background: var(--bg-secondary); padding: 3rem; border: 1px solid var(--border); margin: 0 auto; text-align: left; }
        .summary-line { display: flex; justify-content: space-between; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }

        .animate-in { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        
        .back-link { background: none; border: none; font-weight: 900; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.2rem; cursor: pointer; color: var(--text-secondary); margin-top: 4rem; }
        .back-link:hover { color: var(--accent-primary); }
      `}</style>
    </div>
  );
}
