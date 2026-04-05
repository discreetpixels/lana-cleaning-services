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
          top: '2rem', 
          right: '-2.5rem', 
          backgroundColor: category?.toLowerCase() === 'office' ? 'var(--accent-secondary)' : 'var(--accent-primary)', 
          color: 'white', 
          padding: '0.5rem 3rem', 
          fontSize: '0.6rem', 
          fontWeight: '900', 
          textTransform: 'uppercase', 
          letterSpacing: '0.2em',
          transform: 'rotate(45deg)',
          zIndex: 1
        }}>
          {category}
        </div>
      )}

      <div>
        <div style={{ 
          width: '60px', 
          height: '1px', 
          backgroundColor: 'var(--accent-primary)', 
          marginBottom: '2.5rem' 
        }}></div>
        <h3 style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: '1.2' }}>{title}</h3>
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
          <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-primary)', borderRadius: '50%' }}></span>
          {duration}
        </div>
        <p style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>{description}</p>
      </div>
      
      <div style={{ marginTop: '4rem' }}>
        <div className="price-tag" style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', marginBottom: '2rem' }}>
          <span style={{ fontSize: '1rem', verticalAlign: 'top', marginRight: '4px' }}>$</span>
          {price.replace('$', '')}
        </div>
        <a href={`?package=${id}#booking`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>Book Reservation</a>
      </div>

      <style jsx>{`
        .card {
          padding: 4rem 3rem 3rem;
          background: var(--white);
          border: 1px solid var(--border);
          transition: var(--transition);
        }
        .card.highlight {
          background-color: #F8F9F3;
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-lg);
        }
        .card:hover {
          transform: translateY(-10px);
          border-color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
