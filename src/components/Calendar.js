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
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isSelected = selectedDate === dateStr;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    const isPast = new Date(year, month, i) < new Date(new Date().setHours(0,0,0,0));
    
    // Logic to mark as busy if all time slots are taken (implemented later)
    const isBusy = busySlots && busySlots[dateStr] === 'all';

    days.push(
      <div 
        key={i} 
        className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isPast || isBusy ? 'disabled' : ''}`}
        onClick={() => !isPast && !isBusy && onSelect(dateStr)}
      >
        {i}
      </div>
    );
  }

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-btn" type="button">
          <ChevronLeft size={20} color="var(--accent-primary)" strokeWidth={3} />
        </button>
        <h3 style={{ margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '800' }}>
          {monthName} {year}
        </h3>
        <button onClick={handleNextMonth} className="nav-btn" type="button">
          <ChevronRight size={20} color="var(--accent-primary)" strokeWidth={3} />
        </button>
      </div>
      <div className="calendar-weekdays">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div className="calendar-grid">
        {days}
      </div>

      <style jsx>{`
        .calendar-card {
          width: 100%;
          background: var(--white);
          padding: 2.5rem;
          border: 1px solid var(--border);
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3.5rem;
        }
        .nav-btn {
          background: none;
          border: 1px solid var(--border);
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .nav-btn:hover { border-color: var(--accent-primary); background: var(--bg-secondary); }
        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-weight: 900;
          font-size: 0.6rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: 700;
          transition: var(--transition);
          font-size: 0.85rem;
          border: 1px solid transparent;
          color: var(--text-secondary);
        }
        .calendar-day:not(.empty):not(.disabled):hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }
        .calendar-day.selected {
          border-color: var(--accent-primary) !important;
          background: var(--accent-primary) !important;
          color: var(--white) !important;
        }
        .calendar-day.today {
          color: var(--accent-secondary);
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .calendar-day.disabled {
          opacity: 0.15;
          cursor: not-allowed;
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
}
