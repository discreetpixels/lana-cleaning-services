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

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isSelected = selectedDate === dateStr;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    const isPast = date < new Date(new Date().setHours(0,0,0,0));
    const isSunday = date.getDay() === 0;
    
    // Logic to mark as busy if all time slots are taken
    const isBusy = busySlots && busySlots[dateStr] && busySlots[dateStr].length >= 8;

    days.push(
      <div 
        key={i} 
        className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isPast || isBusy || isSunday ? 'disabled' : ''}`}
        onClick={() => !isPast && !isBusy && !isSunday && onSelect(dateStr)}
      >
        {i}
      </div>
    );
  }

  const formatSelectedDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-btn" type="button" aria-label="Previous Month">
          <span className="arrow-left"></span>
        </button>
        <h3 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '900', fontFamily: 'var(--font-sans)', color: 'var(--accent-primary)' }}>
          {monthName} {year}
        </h3>
        <button onClick={handleNextMonth} className="nav-btn" type="button" aria-label="Next Month">
          <span className="arrow-right"></span>
        </button>
      </div>
      <div className="calendar-weekdays">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div className="calendar-grid">
        {days}
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
          padding: 3rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }
        .nav-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          color: var(--accent-primary);
        }
        .nav-btn:hover { 
          border-color: var(--accent-primary); 
          background: var(--accent-primary);
        }
        .nav-btn:hover span {
          border-color: var(--white);
        }
        .arrow-left, .arrow-right {
          display: block;
          width: 10px;
          height: 10px;
          border-left: 3px solid var(--accent-primary);
          border-bottom: 3px solid var(--accent-primary);
          transition: var(--transition);
        }
        .arrow-left {
          transform: rotate(45deg);
          margin-left: 4px;
        }
        .arrow-right {
          transform: rotate(-135deg);
          margin-right: 4px;
        }
        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-weight: 900;
          font-size: 0.7rem;
          color: var(--accent-primary);
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          opacity: 0.6;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: 700;
          transition: var(--transition);
          font-size: 0.95rem;
          border: 1px solid transparent;
          color: var(--text-primary);
        }
        .calendar-day:not(.empty):not(.disabled):hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: var(--bg-secondary);
        }
        .calendar-day.selected {
          border-color: var(--accent-primary) !important;
          background: var(--accent-primary) !important;
          color: var(--white) !important;
          font-weight: 900;
        }
        .calendar-day.today {
          color: var(--accent-primary);
          position: relative;
        }
        .calendar-day.today::after {
          content: '';
          position: absolute;
          bottom: 15%;
          width: 4px;
          height: 4px;
          background: var(--accent-primary);
          border-radius: 50%;
        }
        .calendar-day.disabled {
          opacity: 0.15;
          cursor: not-allowed;
          background: transparent !important;
          color: var(--text-secondary);
        }
        .selected-date-preview {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
          text-align: center;
          animation: slideUp 0.4s ease-out;
        }
        .preview-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #888;
          margin-bottom: 0.5rem;
          font-weight: 800;
        }
        .preview-value {
          font-size: 1.1rem;
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
