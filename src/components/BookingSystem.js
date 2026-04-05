'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Package, User, ArrowRight, CheckCircle2, Mail, Phone, MapPin } from 'lucide-react';
import Calendar from '@/components/Calendar';

export default function BookingSystem() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busySlots, setBusySlots] = useState({});
  
  const [bookingData, setBookingData] = useState({
    date: null,
    time: '',
    package: '',
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const steps = [
    { id: 1, name: 'Service', icon: Package },
    { id: 2, name: 'Schedule', icon: CalendarIcon },
    { id: 3, name: 'Details', icon: User },
    { id: 4, name: 'Finish', icon: CheckCircle2 }
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

  // Fetch availability when on schedule step
  useEffect(() => {
    if (step === 2) {
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
  }, [step]);

  const nextStep = () => {
    if (step === 1 && bookingData.package) setStep(2);
    else if (step === 2 && bookingData.date && bookingData.time) setStep(3);
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handlePackageSelect = (pkg) => {
    setBookingData({ ...bookingData, package: pkg });
    setStep(2);
  };

  const handleDateSelect = (date) => setBookingData({ ...bookingData, date, time: '' });
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
      
      if (response.ok) setStep(4);
    } catch (error) {
      console.error("Booking error:", error);
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {bookingData.package && step > 1 && step < 4 && (
        <div className="booking-summary-bar animate-in">
          <div className="summary-info">
            <span className="summary-label">Selected Package</span>
            <h4 className="summary-value">
              {packages.find(p => p.id === bookingData.package)?.name}
            </h4>
          </div>
          <div className="summary-price">
            <span className="summary-label">Estimated Price</span>
            <div className="price-value">${packages.find(p => p.id === bookingData.package)?.price}</div>
          </div>
        </div>
      )}

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
          <div className="animate-in">
            <h3 className="step-title">2. Schedule Your Visit</h3>
            <div className="booking-grid">
              <div className="calendar-col">
                <Calendar onSelect={handleDateSelect} selectedDate={bookingData.date} busySlots={busySlots} />
              </div>
              <div className="time-col">
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Select Arrival Window</h4>
                <div className="time-grid">
                  {timeSlots.map((slot) => {
                    const isBusy = busySlots[bookingData.date]?.includes(slot);
                    return (
                      <button 
                        key={slot} 
                        className={`time-chip ${bookingData.time === slot ? 'active' : ''} ${isBusy ? 'disabled' : ''}`}
                        onClick={() => !isBusy && handleTimeSelect(slot)}
                        disabled={isBusy || !bookingData.date}
                        type="button"
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={nextStep} 
                  className="btn btn-primary" 
                  disabled={!bookingData.date || !bookingData.time}
                  style={{ width: '100%', marginTop: '3rem' }}
                  type="button"
                >
                  Confirm Schedule <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <button onClick={prevStep} className="back-link" type="button">← Change Service</button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in">
            <h3 className="step-title">3. Personal Details</h3>
            <form onSubmit={handleFormSubmit} className="details-form">
              <div className="form-row">
                <div className="input-group">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <User size={16} />
                    <input type="text" placeholder="Sarah Connor" value={bookingData.name} onChange={(e) => setBookingData({...bookingData, name: e.target.value})} required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input type="email" placeholder="sarah@example.com" value={bookingData.email} onChange={(e) => setBookingData({...bookingData, email: e.target.value})} required />
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <label>Phone Number</label>
                  <div className="input-with-icon">
                    <Phone size={16} />
                    <input type="tel" placeholder="(555) 000-0000" value={bookingData.phone} onChange={(e) => setBookingData({...bookingData, phone: e.target.value})} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Cleaning Address</label>
                  <div className="input-with-icon">
                    <MapPin size={16} />
                    <input type="text" placeholder="123 Luxury Lane, Suite 100" value={bookingData.address} onChange={(e) => setBookingData({...bookingData, address: e.target.value})} required />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '3rem', borderTop: '1px solid #EEE', paddingTop: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                   <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>Invoice & Payment</div>
                   <div style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>Pay via Invoice Later</div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%' }}>
                  {isSubmitting ? 'Securing your spot...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
            <button onClick={prevStep} className="back-link" type="button">← Adjust Schedule</button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in finish-step">
            <CheckCircle2 size={80} color="var(--accent-primary)" style={{ marginBottom: '2.5rem' }} />
            <h3 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>Reservation Secured</h3>
            <p style={{ maxWidth: '400px', margin: '0 auto 3rem', opacity: 0.8 }}>
              Thank you for choosing Lana. We've sent a confirmation email with all the details and a link to manage your booking.
            </p>
            <button onClick={() => window.location.reload()} className="btn btn-primary" type="button">
              Return to Home
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .booking-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          background: var(--white);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }
        .steps-nav {
          display: flex;
          justify-content: space-between;
          padding: 2rem 4rem;
          background: var(--bg-secondary);
          border-bottom: 2px solid var(--border);
        }
        .step-node {
          display: flex;
          align-items: center;
          gap: 1rem;
          opacity: 0.3;
          transition: var(--transition);
        }
        .step-node.active {
          opacity: 1;
        }
        .node-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .node-label {
          font-weight: 800;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .step-panel {
          padding: 4rem;
        }
        .step-title {
          font-size: 2rem;
          margin-bottom: 3rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
        }
        .package-options {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        .package-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 3rem;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: var(--transition);
        }
        .package-item:hover, .package-item.selected {
          border-color: var(--accent-primary);
          background: var(--bg-secondary);
        }
        .pkg-cat {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--accent-primary);
          font-weight: 900;
        }
        .package-item h4 {
          margin: 0;
          font-size: 1.25rem;
          font-family: var(--font-sans);
        }
        .pkg-price {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 700;
        }
        .booking-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 4rem;
        }
        .time-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .time-chip {
          padding: 1.25rem;
          border: 1px solid var(--border);
          background: white;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
          font-size: 0.85rem;
        }
        .time-chip:hover:not(.disabled) {
          border-color: var(--accent-primary);
        }
        .time-chip.active {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }
        .time-chip.disabled {
          opacity: 0.2;
          cursor: not-allowed;
          background: #eee;
        }
        .details-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .input-group label {
          display: block;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.75rem;
          color: var(--accent-primary);
        }
        .input-with-icon {
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid var(--border);
          padding: 0 1.5rem;
          transition: var(--transition);
        }
        .input-with-icon:focus-within {
          border-color: var(--accent-primary);
        }
        .input-with-icon input {
          flex: 1;
          padding: 1.25rem 0;
          border: none;
          outline: none;
          font-family: inherit;
          font-size: 1rem;
        }
        .back-link {
          margin-top: 3rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-weight: 700;
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0;
        }
        .animate-in {
          animation: fadeIn 0.6s ease-out;
        }
        .finish-step {
          text-align: center;
          padding: 4rem 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .booking-summary-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 4rem;
          background: #FDFCF5;
          border-bottom: 1px solid var(--border);
          animation: slideDown 0.4s ease-out;
        }
        .summary-label {
          display: block;
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
          font-weight: 800;
        }
        .summary-value {
          margin: 0;
          font-size: 1.25rem;
          font-family: var(--font-serif);
          color: var(--accent-primary);
        }
        .summary-price {
          text-align: right;
        }
        .price-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--accent-primary);
          font-family: var(--font-serif);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .booking-grid, .form-row {
            grid-template-columns: 1fr;
          }
          .step-panel { padding: 2rem; }
          .steps-nav { padding: 1.5rem; }
          .node-label { display: none; }
          .booking-summary-bar { padding: 1.5rem 2rem; flex-direction: column; align-items: flex-start; gap: 1rem; }
          .summary-price { text-align: left; }
        }
      `}</style>
    </div>
  );
}
