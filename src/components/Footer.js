'use client';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--text-primary)', color: 'var(--white)', padding: '8rem 0 4rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '6rem' }}>
          <div>
            <h3 style={{ color: 'var(--white)', fontSize: '2rem', marginBottom: '2rem' }}>Lana Cleaning Services</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '300px' }}>Professional home care by professional women. Dedicated to the art of the clean home.</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', marginBottom: '2rem' }}>Explore</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><a href="#services" className="footer-link">Services</a></li>
              <li><a href="#about" className="footer-link">About Us</a></li>
              <li><a href="#booking" className="footer-link">Book Now</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', marginBottom: '2rem' }}>Contact</h4>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>info@lanacleaning.com<br />(555) 123-4567</p>
          </div>
        </div>
        <div style={{ marginTop: '8rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          &copy; {new Date().getFullYear()} Lana Cleaning Services. Crafted for excellence.
        </div>
      </div>
      <style jsx>{`
        .footer-link {
          color: var(--white);
          opacity: 0.8;
          transition: var(--transition);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .footer-link:hover {
          opacity: 1;
          color: var(--accent-secondary);
        }
      `}</style>
    </footer>
  );
}
