'use client';

export default function ServiceCard({ id, title, duration, description, price, highlight, category }) {
  return (
    <div className={`card ${highlight ? 'highlight' : ''}`} style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {category && (
        <div style={{ 
          position: 'absolute', 
          top: '1.5rem', 
          right: '1.5rem', 
          backgroundColor: category?.toLowerCase() === 'office' ? 'var(--text-secondary)' : 'var(--accent-secondary)', 
          color: 'white', 
          padding: '0.5rem 1.5rem', 
          fontSize: '0.75rem', 
          fontWeight: '800', 
          textTransform: 'uppercase', 
          letterSpacing: '0.15em',
          borderRadius: '100px',
          zIndex: 1
        }}>
          {category}
        </div>
      )}

      <div>
        <div style={{ 
          width: '80px', 
          height: '4px', 
          backgroundColor: 'var(--accent-secondary)', 
          marginBottom: '2.5rem',
          borderRadius: '2px'
        }}></div>
        <h3 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: '1.1', letterSpacing: '-0.03em' }}>{title}</h3>
        <div style={{ 
          fontSize: '0.75rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.2em', 
          fontWeight: '800',
          color: 'var(--accent-primary)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-secondary)', borderRadius: '50%' }}></span>
          {duration}
        </div>
        <p style={{ fontSize: '1.125rem', lineHeight: '1.6', color: 'var(--text-secondary)', fontWeight: '400' }}>{description}</p>
      </div>
      
      <div style={{ marginTop: '4rem' }}>
        <div className="price-tag" style={{ borderTop: '1px solid var(--border)', paddingTop: '2.5rem', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '1.5rem', verticalAlign: 'top', marginTop: '0.25rem', marginRight: '6px', color: 'var(--text-secondary)' }}>$</span>
          <span style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-0.05em' }}>{price.replace('$', '')}</span>
        </div>
        <a href={`?package=${id}#booking`} className={`btn ${highlight ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%', textAlign: 'center', display: 'block' }}>Book Reservation</a>
      </div>

      <style jsx>{`
        .card {
          padding: 3rem;
          background: var(--white);
          border: 1px solid var(--border);
          transition: var(--transition);
          border-radius: var(--radius);
        }
        .card.highlight {
          background: linear-gradient(180deg, #FFFFFF 0%, var(--bg-secondary) 100%);
          border-color: rgba(79, 70, 229, 0.3); /* Indigo border */
          box-shadow: var(--shadow-lg);
        }
        .card:hover {
          transform: translateY(-10px);
          border-color: rgba(15, 23, 42, 0.2);
          box-shadow: 0 30px 60px -15px rgba(15, 23, 42, 0.15); /* Sleek dark shadow */
        }
      `}</style>
    </div>
  );
}
