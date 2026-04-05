'use client';

import { useState, useEffect, useCallback } from 'react';

const PACKAGE_NAMES = {
  '2h': '2-Hour Quick Refresh',
  'move-out': 'Move-Out Deep Clean',
  'reg': 'Regular Maintenance',
  'deep': 'Deep Detailed Clean',
  'off-e': 'Executive Office Clean',
  'off-s': 'Studio/Creative Care',
};

const PACKAGE_PRICES = {
  '2h': 95, 'move-out': 450, 'reg': 160, 'deep': 350, 'off-e': 250, 'off-s': 180,
};

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
];

export default function AdminDashboard() {
  const [googleUser, setGoogleUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  // Reschedule modal state
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Multi-select state
  const [selected, setSelected] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find(r => r.startsWith('google_user='));
    if (userCookie) {
      try { setGoogleUser(JSON.parse(decodeURIComponent(userCookie.split('=')[1]))); } catch {}
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking? This will also remove the Google Calendar event.')) return;
    setActionLoading(id + '-cancel');
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Booking cancelled'); fetchBookings(); }
      else showToast('Failed to cancel', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const openReschedule = (booking) => {
    setRescheduleBooking(booking);
    setNewDate('');
    setNewTime('');
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;
    setRescheduling(true);
    try {
      const res = await fetch(`/api/bookings/${rescheduleBooking.id}/propose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposed_date: newDate, proposed_time: newTime }),
      });
      if (res.ok) {
        showToast(`Proposal email sent to ${rescheduleBooking.email}`);
        setRescheduleBooking(null);
        fetchBookings();
      } else {
        showToast('Failed to send proposal', 'error');
      }
    } finally {
      setRescheduling(false);
    }
  };

  const handleDeleteCustomer = async (email, name) => {
    if (!confirm(`Delete ALL bookings for ${name}? This cannot be undone.`)) return;
    setActionLoading('customer-' + email);
    try {
      const res = await fetch(`/api/admin/customers?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(`Deleted ${data.deleted} booking(s) for ${name}`);
        fetchBookings();
      } else {
        showToast('Failed to delete customer', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const exportCustomersCSV = () => {
    const rows = [['Name', 'Email', 'Phone', 'Address', 'Total Bookings', 'Confirmed Bookings', 'Total Spent']];
    customers.forEach(c => {
      const confirmed = c.bookings.filter(b => b.status !== 'cancelled');
      const spent = confirmed.reduce((s, b) => s + (PACKAGE_PRICES[b.package] || 0), 0);
      rows.push([c.name, c.email, c.phone, c.address, c.bookings.length, confirmed.length, `$${spent}`]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lana-customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportBookingsCSV = () => {
    const rows = [['Date', 'Time', 'Name', 'Email', 'Phone', 'Package', 'Price', 'Address', 'Status', 'Calendar Synced']];
    bookings.forEach(b => {
      rows.push([b.date, b.time, b.name, b.email, b.phone, PACKAGE_NAMES[b.package] || b.package, `$${PACKAGE_PRICES[b.package] || 0}`, b.address, b.status, b.google_calendar_event_id ? 'Yes' : 'No']);
    });
    const csv = rows.map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lana-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (ids) => {
    setSelected(prev => ids.every(id => prev.has(id)) ? new Set() : new Set(ids));
  };

  const clearSelected = () => setSelected(new Set());

  const handleBulkCancel = async () => {
    if (!confirm(`Cancel ${selected.size} booking(s)? Calendar events will be removed.`)) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selected].map(id => fetch(`/api/bookings/${id}`, { method: 'DELETE' })));
      showToast(`${selected.size} booking(s) cancelled`);
      clearSelected();
      fetchBookings();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDeleteCustomers = async () => {
    if (!confirm(`Delete ALL bookings for ${selected.size} customer(s)? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selected].map(email =>
        fetch(`/api/admin/customers?email=${encodeURIComponent(email)}`, { method: 'DELETE' })
      ));
      showToast(`${selected.size} customer(s) deleted`);
      clearSelected();
      fetchBookings();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleConnectGoogle = () => { window.location.href = '/api/auth/google/login'; };
  const handleDisconnect = () => {
    document.cookie = "google_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "google_auth_tokens=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setGoogleUser(null);
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(b => b.status !== 'cancelled' && b.date >= today);
  const past = bookings.filter(b => b.status !== 'cancelled' && b.date < today);
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  const customerMap = {};
  bookings.forEach(b => {
    if (!customerMap[b.email]) {
      customerMap[b.email] = { name: b.name, email: b.email, phone: b.phone, address: b.address, bookings: [] };
    }
    customerMap[b.email].bookings.push(b);
  });
  const customers = Object.values(customerMap).sort((a, b) => b.bookings.length - a.bookings.length);

  const totalRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (PACKAGE_PRICES[b.package] || 0), 0);

  const filterList = (list) => {
    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter(item => {
      if (activeTab === 'customers') {
        return item.name?.toLowerCase().includes(s) || item.email?.toLowerCase().includes(s) || item.phone?.includes(s);
      }
      return item.name?.toLowerCase().includes(s) || item.email?.toLowerCase().includes(s) || item.date?.includes(s) || item.address?.toLowerCase().includes(s);
    });
  };

  const tabMap = { upcoming, past, cancelled };
  const currentList = activeTab === 'customers' ? filterList(customers) : filterList(tabMap[activeTab] || []);

  const todayMin = new Date().toISOString().split('T')[0];

  return (
    <div style={{ minHeight: '100vh', background: '#F0EFE8', fontFamily: 'var(--font-sans)' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.type === 'error' ? '#fee2e2' : '#dcfce7',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
          color: toast.type === 'error' ? '#991b1b' : '#166534',
          padding: '0.75rem 1.25rem', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', padding: '2.5rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.4rem', fontWeight: 900 }}>Propose New Time</h2>
            <p style={{ margin: '0 0 0.25rem', color: '#333', fontSize: '0.95rem', fontWeight: 600 }}>
              {rescheduleBooking.name} — {PACKAGE_NAMES[rescheduleBooking.package] || rescheduleBooking.package}
            </p>
            <p style={{ margin: '0 0 2rem', color: '#888', fontSize: '0.82rem' }}>
              Current: {rescheduleBooking.date} @ {rescheduleBooking.time}
            </p>

            <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2rem' }}>
              <div>
                <label style={labelStyle}>New Date</label>
                <input
                  type="date"
                  value={newDate}
                  min={todayMin}
                  onChange={e => setNewDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>New Time</label>
                <select value={newTime} onChange={e => setNewTime(e.target.value)} style={inputStyle}>
                  <option value="">Select time</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleReschedule}
                disabled={!newDate || !newTime || rescheduling}
                style={{ flex: 1, background: '#2D5A27', color: 'white', border: 'none', padding: '0.9rem', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', opacity: (!newDate || !newTime || rescheduling) ? 0.5 : 1 }}
              >
                {rescheduling ? 'Sending...' : 'Send Proposal Email'}
              </button>
              <button
                onClick={() => setRescheduleBooking(null)}
                style={{ padding: '0.9rem 1.25rem', background: 'transparent', border: '1px solid #ddd', cursor: 'pointer', fontWeight: 700, color: '#666' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#1C1C1C', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem' }}>← Site</a>
          <span style={{ color: 'white', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Lana Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {googleUser ? (
            <>
              <span style={{ color: '#86efac', fontSize: '0.8rem', fontWeight: 700 }}>● {googleUser.email}</span>
              <button onClick={handleDisconnect} style={{ background: 'transparent', border: '1px solid #444', color: '#aaa', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                Disconnect
              </button>
            </>
          ) : (
            <button onClick={handleConnectGoogle} style={{ background: '#2D5A27', border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
              Connect Google Calendar
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Upcoming', value: upcoming.length, color: '#2D5A27', bg: '#F0FDF4', border: '#86efac' },
            { label: 'Completed', value: past.length, color: '#1e40af', bg: '#eff6ff', border: '#93c5fd' },
            { label: 'Cancelled', value: cancelled.length, color: '#9a3412', bg: '#fff7ed', border: '#fdba74' },
            { label: 'Customers', value: customers.length, color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
            { label: 'Est. Revenue', value: `$${totalRevenue.toLocaleString()}`, color: '#92400e', bg: '#fffbeb', border: '#fcd34d' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, padding: '1.25rem 1.5rem' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', marginBottom: '0.25rem', fontWeight: 700 }}>{s.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Main Panel */}
        <div style={{ background: 'white', border: '1px solid #E5E2D0' }}>

          {/* Tabs + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E2D0', padding: '0 1.5rem' }}>
            <div style={{ display: 'flex' }}>
              {[
                { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
                { key: 'past', label: `Past (${past.length})` },
                { key: 'cancelled', label: `Cancelled (${cancelled.length})` },
                { key: 'customers', label: `Customers (${customers.length})` },
              ].map(t => (
                <button key={t.key} onClick={() => { setActiveTab(t.key); setSearch(''); clearSelected(); }} style={{
                  padding: '1rem 1.25rem', background: 'transparent', border: 'none',
                  borderBottom: activeTab === t.key ? '2px solid #2D5A27' : '2px solid transparent',
                  color: activeTab === t.key ? '#2D5A27' : '#888',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', marginBottom: '-1px', whiteSpace: 'nowrap',
                }}>
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                style={{ padding: '0.45rem 0.75rem', border: '1px solid #E5E2D0', fontSize: '0.85rem', width: '180px', outline: 'none', background: '#FDFCF5' }}
              />
              <button
                onClick={activeTab === 'customers' ? exportCustomersCSV : exportBookingsCSV}
                style={{ padding: '0.45rem 0.9rem', background: '#1C1C1C', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                ↓ Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>Loading...</div>
          ) : currentList.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#aaa', fontSize: '0.9rem' }}>No records found.</div>
          ) : activeTab === 'customers' ? (
            <>
              {selected.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.25rem', background: '#1C1C1C', color: 'white' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{selected.size} selected</span>
                  <button onClick={handleBulkDeleteCustomers} disabled={bulkLoading} style={{ background: '#dc2626', border: 'none', color: 'white', padding: '0.4rem 0.9rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                    {bulkLoading ? 'Deleting...' : 'Delete Selected'}
                  </button>
                  <button onClick={clearSelected} style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', padding: '0.4rem 0.9rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                    Clear
                  </button>
                </div>
              )}
              <CustomersTable
                customers={currentList}
                onDelete={handleDeleteCustomer}
                actionLoading={actionLoading}
                selected={selected}
                onToggle={toggleSelect}
                onToggleAll={toggleSelectAll}
                idKey="email"
              />
            </>
          ) : (
            <>
              {selected.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.25rem', background: '#1C1C1C', color: 'white' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{selected.size} selected</span>
                  {activeTab !== 'cancelled' && (
                    <button onClick={handleBulkCancel} disabled={bulkLoading} style={{ background: '#dc2626', border: 'none', color: 'white', padding: '0.4rem 0.9rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                      {bulkLoading ? 'Cancelling...' : 'Cancel Selected'}
                    </button>
                  )}
                  <button onClick={clearSelected} style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', padding: '0.4rem 0.9rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                    Clear
                  </button>
                </div>
              )}
              <BookingsTable
                bookings={currentList}
                onCancel={handleCancel}
                onReschedule={openReschedule}
                actionLoading={actionLoading}
                showActions={activeTab !== 'cancelled'}
                selected={selected}
                onToggle={toggleSelect}
                onToggleAll={toggleSelectAll}
                idKey="id"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingsTable({ bookings, onCancel, onReschedule, actionLoading, showActions, selected, onToggle, onToggleAll }) {
  const ids = bookings.map(b => b.id);
  const allChecked = ids.length > 0 && ids.every(id => selected.has(id));
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', tableLayout: 'fixed' }}>
      <colgroup>
        <col style={{ width: '3%' }} />
        <col style={{ width: '13%' }} />
        <col style={{ width: '21%' }} />
        <col style={{ width: '17%' }} />
        <col style={{ width: '19%' }} />
        <col style={{ width: '13%' }} />
        <col style={{ width: '14%' }} />
      </colgroup>
      <thead>
        <tr style={{ background: '#F7F6EF', borderBottom: '1px solid #E5E2D0' }}>
          <th style={{ ...thStyle, padding: '0.75rem 0.5rem 0.75rem 1rem' }}>
            <input type="checkbox" checked={allChecked} onChange={() => onToggleAll(ids)} style={{ cursor: 'pointer' }} />
          </th>
          {['Date & Time', 'Customer', 'Package', 'Address', 'Status', ''].map(h => (
            <th key={h} style={thStyle}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bookings.map((b, i) => (
          <tr key={b.id} style={{ borderBottom: '1px solid #F0EDE0', background: selected.has(b.id) ? '#F0FDF4' : i % 2 === 0 ? 'white' : '#FDFCF5' }}>
            <td style={{ ...tdStyle, padding: '0.85rem 0.5rem 0.85rem 1rem' }}>
              <input type="checkbox" checked={selected.has(b.id)} onChange={() => onToggle(b.id)} style={{ cursor: 'pointer' }} />
            </td>
            <td style={tdStyle}>
              <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{formatDate(b.date)}</div>
              <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '2px' }}>{b.time}</div>
            </td>
            <td style={tdStyle}>
              <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.email}</div>
              <div style={{ fontSize: '0.75rem', color: '#999' }}>{b.phone}</div>
            </td>
            <td style={tdStyle}>
              <span style={{ background: '#F0FDF4', color: '#2D5A27', padding: '0.2rem 0.45rem', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #86efac', display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {PACKAGE_NAMES[b.package] || b.package}
              </span>
            </td>
            <td style={{ ...tdStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#666', fontSize: '0.8rem' }} title={b.address}>{b.address}</td>
            <td style={tdStyle}>
              <StatusBadge status={b.status} />
              {b.google_calendar_event_id && <div style={{ color: '#2D5A27', fontSize: '0.7rem', fontWeight: 700, marginTop: '3px' }}>● Cal synced</div>}
              {b.proposed_date && <div style={{ color: '#d97706', fontSize: '0.7rem', fontWeight: 700, marginTop: '3px' }}>⏳ Proposal sent</div>}
            </td>
            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
              {showActions && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <button
                    onClick={() => onReschedule(b)}
                    style={{ background: b.proposed_date ? '#fffbeb' : '#eff6ff', border: `1px solid ${b.proposed_date ? '#fcd34d' : '#93c5fd'}`, color: b.proposed_date ? '#92400e' : '#1e40af', padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    {b.proposed_date ? 'Resend Proposal' : 'Reschedule'}
                  </button>
                  <button
                    onClick={() => onCancel(b.id)}
                    disabled={actionLoading === b.id + '-cancel'}
                    style={{ background: 'transparent', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    {actionLoading === b.id + '-cancel' ? '...' : 'Cancel'}
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CustomersTable({ customers, onDelete, actionLoading, selected, onToggle, onToggleAll }) {
  const ids = customers.map(c => c.email);
  const allChecked = ids.length > 0 && ids.every(id => selected.has(id));
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', tableLayout: 'fixed' }}>
      <colgroup>
        <col style={{ width: '3%' }} />
        <col style={{ width: '17%' }} />
        <col style={{ width: '25%' }} />
        <col style={{ width: '21%' }} />
        <col style={{ width: '13%' }} />
        <col style={{ width: '12%' }} />
        <col style={{ width: '9%' }} />
      </colgroup>
      <thead>
        <tr style={{ background: '#F7F6EF', borderBottom: '1px solid #E5E2D0' }}>
          <th style={{ ...thStyle, padding: '0.75rem 0.5rem 0.75rem 1rem' }}>
            <input type="checkbox" checked={allChecked} onChange={() => onToggleAll(ids)} style={{ cursor: 'pointer' }} />
          </th>
          {['Name', 'Contact', 'Address', 'Bookings', 'Spent', ''].map(h => (
            <th key={h} style={thStyle}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {customers.map((c, i) => {
          const confirmed = c.bookings.filter(b => b.status !== 'cancelled');
          const spent = confirmed.reduce((s, b) => s + (PACKAGE_PRICES[b.package] || 0), 0);
          const isLoading = actionLoading === 'customer-' + c.email;
          return (
            <tr key={c.email} style={{ borderBottom: '1px solid #F0EDE0', background: selected.has(c.email) ? '#F0FDF4' : i % 2 === 0 ? 'white' : '#FDFCF5' }}>
              <td style={{ ...tdStyle, padding: '0.85rem 0.5rem 0.85rem 1rem' }}>
                <input type="checkbox" checked={selected.has(c.email)} onChange={() => onToggle(c.email)} style={{ cursor: 'pointer' }} />
              </td>
              <td style={{ ...tdStyle, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</td>
              <td style={tdStyle}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#555', fontSize: '0.82rem' }}>{c.email}</div>
                <div style={{ color: '#888', fontSize: '0.78rem' }}>{c.phone}</div>
              </td>
              <td style={{ ...tdStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#666', fontSize: '0.8rem' }} title={c.address}>{c.address}</td>
              <td style={tdStyle}>
                <div style={{ fontSize: '0.8rem' }}>
                  <span style={{ background: '#F0FDF4', color: '#2D5A27', padding: '0.15rem 0.4rem', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #86efac' }}>{confirmed.length} confirmed</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#999', marginTop: '3px' }}>{c.bookings.length} total</div>
              </td>
              <td style={{ ...tdStyle, fontWeight: 800, color: '#2D5A27' }}>${spent}</td>
              <td style={tdStyle}>
                <button
                  onClick={() => onDelete(c.email, c.name)}
                  disabled={isLoading}
                  style={{ background: 'transparent', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  {isLoading ? '...' : 'Delete'}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function StatusBadge({ status }) {
  const styles = {
    confirmed: { bg: '#dcfce7', color: '#166534', border: '#86efac' },
    cancelled: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  };
  const s = styles[status] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const thStyle = {
  padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 800,
  fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em',
  color: '#666', whiteSpace: 'nowrap',
};

const tdStyle = { padding: '0.85rem 1rem' };

const labelStyle = {
  display: 'block', fontSize: '0.75rem', fontWeight: 800,
  textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: '0.4rem',
};

const inputStyle = {
  width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #ddd',
  fontSize: '0.9rem', outline: 'none', background: '#FDFCF5', boxSizing: 'border-box',
};
