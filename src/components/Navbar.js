'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <div className="container nav-content">
        <Link href="/" className="logo">
          LANA CLEANING
        </Link>
        <div className="nav-links">
          <Link href="#services" className="nav-link">Services</Link>
          <Link href="#about" className="nav-link">Founders</Link>
          <Link href="#booking" className="btn btn-primary" style={{ padding: '0.85rem 2.25rem', fontSize: '0.8rem' }}>Book Now</Link>
        </div>
      </div>
      <style jsx>{`
        .logo {
          letter-spacing: 0.15em;
        }
      `}</style>
    </nav>
  );
}
