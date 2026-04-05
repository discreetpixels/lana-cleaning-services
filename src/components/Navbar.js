'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav>
      <div className="container nav-content">
        <Link href="/" className="logo">
          LANA CLEANING
        </Link>
        <div className="nav-links">
          <Link href="#services" className="nav-link">Services</Link>
          <Link href="#about" className="nav-link">Founders</Link>
          <Link href="#booking" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '0.75rem' }}>Book Now</Link>
        </div>
      </div>
      <style jsx>{`
        nav {
          border-bottom: 1px solid var(--border);
        }
        .logo {
          letter-spacing: -0.05em;
        }
      `}</style>
    </nav>
  );
}
