'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar({ onSelect, selectedDate, busySlots }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Helper to check if a date is selected
  const isDateSelected = (dStr) => selectedDate && String(selectedDate) === String(dStr);

  const formatSelectedDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-btn" type="button" aria-label="Previous Month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        
        <div className="calendar-title">
          <h3>{monthName} {year}</h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        <button onClick={handleNextMonth} className="nav-btn" type="button" aria-label="Next Month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <div className="calendar-weekdays">
        <div>SU</div><div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div>
      </div>
      
      <div className="calendar-grid">
        {/* Empty slots for start of month */}
        {[...Array(startDay)].map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day-empty"></div>
        ))}
        
        {/* Actual days */}
        {[...Array(totalDays)].map((_, i) => {
          const dayNum = i + 1;
          const date = new Date(year, month, dayNum);
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isSelected = isDateSelected(dateStr);
          const isToday = new Date().toLocaleDateString('en-CA') === dateStr;
          const isPast = date < new Date(new Date().setHours(0,0,0,0));
          const isSunday = date.getDay() === 0;
          const isBusy = busySlots && busySlots[dateStr] && busySlots[dateStr].length >= 8;
          const isDisabled = isPast || isBusy || isSunday;

          return (
            <button 
              key={dayNum} 
              className={`calendar-day ${isSelected ? 'is-selected' : ''} ${isToday ? 'today' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && onSelect(dateStr)}
              disabled={isDisabled}
              type="button"
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="selected-date-preview">
          <div className="preview-label">Selected Arrival Date</div>
          <div className="preview-value">{formatSelectedDate(selectedDate)}</div>
        </div>
      )}

      <style jsx>{`
        .calendar-card {
          width: 100%;
          background: var(--white);
          padding: 2.5rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          padding: 0 0.5rem;
        }
        .calendar-title {
          display: flex;
          align-items: center;
          cursor: default;
        }
        .calendar-title h3 {
          margin: 0;
          font-size: 1.25rem;
          font-family: var(--font-sans);
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          text-transform: none;
        }
        .calendar-title svg {
          color: var(--accent-primary);
          opacity: 0.8;
        }
        .nav-btn {
          background: transparent;
          border: 1px solid var(--border);
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--accent-primary);
          border-radius: 50%;
          padding: 0;
        }
        .nav-btn:hover { 
          border-color: var(--accent-primary); 
          background: var(--bg-secondary);
        }
        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-weight: 800;
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
          letter-spacing: 0.05em;
          opacity: 0.6;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
        }
        .calendar-day-empty {
          aspect-ratio: 1;
        }
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 1rem;
          color: var(--text-primary);
          border-radius: 8px;
          margin: 0;
          border: 1px solid transparent;
          user-select: none;
          background: #F9F9F7;
          width: 100%;
          outline: none;
          padding: 0;
        }
        .calendar-day:not(.disabled):hover {
          background: #F0F0E8;
          color: var(--accent-primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          border-color: var(--border);
        }
        .calendar-day.is-selected {
          background: #D14187 !important;
          color: #FFFFFF !important;
          font-weight: 800;
          box-shadow: 0 8px 15px rgba(209, 65, 135, 0.35) !important;
          transform: scale(1.05) translateY(-2px) !important;
          z-index: 2;
          border: none !important;
        }
        .calendar-day.today {
          color: #2D5A27;
          font-weight: 800;
          position: relative;
        }
        .calendar-day.today:not(.is-selected)::after {
          content: '';
          position: absolute;
          bottom: 15%;
          width: 4px;
          height: 4px;
          background: #2D5A27;
          border-radius: 50%;
        }
        .calendar-day.disabled {
          opacity: 0.15;
          cursor: not-allowed;
          background: transparent;
          color: var(--text-secondary);
          transform: none !important;
          box-shadow: none !important;
        }
        .selected-date-preview {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          text-align: center;
          animation: slideUp 0.4s ease-out;
        }
        .preview-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
          font-weight: 700;
        }
        .preview-value {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--accent-primary);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
