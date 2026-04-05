'use client';

import { useState, useEffect } from 'react';
import { Lock, Globe, CheckCircle2, LogOut, ArrowLeft, Settings } from 'lucide-react';

export default function BackendControl() {
  const [googleUser, setGoogleUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

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
  };

  if (isAuthenticating) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6EF', padding: '4rem 2rem', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2D5A27', textDecoration: 'none', fontWeight: 700, marginBottom: '3rem' }}>
          <ArrowLeft size={16} /> Back to Site
        </a>

        <div style={{ background: 'white', padding: '3rem', border: '1px solid #E5E2D0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <Settings size={32} color="#2D5A27" />
            <h1 style={{ margin: 0, fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>Backend Control</h1>
          </div>

          <p style={{ color: '#666', marginBottom: '3rem' }}>
            Manage your system connections here. These settings are private and only for Lana Cleaning administrators.
          </p>

          <div style={{ borderTop: '1px solid #EEE', paddingTop: '3rem' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Google Calendar Integration</h3>
            
            {!googleUser ? (
              <div style={{ background: '#FDFCF5', padding: '2rem', border: '1px dashed #E5E2D0', textAlign: 'center' }}>
                <Lock size={32} color="#888" style={{ marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.9rem', marginBottom: '2rem' }}>Connect your Google account to sync bookings and check availability.</p>
                <button onClick={handleConnectGoogle} className="btn btn-primary" style={{ gap: '12px' }}>
                  <Globe size={18} />
                  Connect Lana Google Account
                </button>
              </div>
            ) : (
              <div style={{ background: '#F0FDF4', padding: '2rem', border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <CheckCircle2 size={32} color="#2D5A27" />
                <div>
                  <p style={{ fontWeight: 800, margin: 0, color: '#2D5A27' }}>System Connected</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7, margin: 0 }}>Active Account: {googleUser.email}</p>
                </div>
                <button onClick={handleLogout} className="btn btn-outline" style={{ marginLeft: 'auto', padding: '0.75rem 1.5rem' }}>
                  <LogOut size={16} style={{ marginRight: '8px' }} /> Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
