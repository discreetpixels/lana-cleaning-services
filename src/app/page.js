import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceCard from '@/components/ServiceCard';
import BookingSystem from '@/components/BookingSystem';

export default function Home() {
  const services = [
    {
      title: "2-Hour Quick Refresh",
      duration: "2 Hours",
      description: "A focused, efficient cleaning of essential living spaces. Ideal for maintaining a high standard between standard visits.",
      price: "$95",
      category: "Personal"
    },
    {
      title: "Move-Out Deep Clean",
      duration: "6 - 8 Hours",
      description: "A comprehensive, top-to-bottom transformation designed for transitions. We handle every surface to ensure your old or new home is immaculate.",
      price: "$450",
      highlight: true,
      category: "Personal"
    },
    {
      title: "Regular Maintenance",
      duration: "3 - 4 Hours",
      description: "Steadfast care for your home on a weekly or bi-weekly basis. Professionalism meet personal attention for a consistently fresh life.",
      price: "$160",
      category: "Personal"
    },
    {
      title: "Deep Detailed Clean",
      duration: "5 - 6 Hours",
      description: "The peak of cleaning excellence. Every corner, baseboard, and intricate detail is sanitized and polished to perfection.",
      price: "$350",
      category: "Personal"
    },
    {
      title: "Executive Office Clean",
      duration: "4 Hours",
      description: "Elevate your professional space. We handle high-traffic areas, shared spaces, and personal offices with impeccable discretion and care.",
      price: "$250",
      category: "Office"
    },
    {
      title: "Studio/Creative Care",
      duration: "3 Hours",
      description: "Tailored for creative environments. We sanitize your workspace while respecting the flow of your professional tools and equipment.",
      price: "$180",
      category: "Office"
    }
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="hero" style={{ 
          background: 'linear-gradient(rgba(253, 252, 245, 0.7), rgba(253, 252, 245, 0.7)), url("/hero.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)'
        }}>
          <div className="container">
            <p style={{ textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '0.875rem', fontWeight: '900', color: 'var(--accent-primary)', marginBottom: '2rem' }}>Boutique Cleaning Group</p>
            <h1 style={{ marginBottom: '3.5rem', fontSize: '6rem' }}>Sparkling Clean, <br /><i style={{ fontFamily: 'var(--font-serif)', fontWeight: '400' }}>Personal Touch.</i></h1>
            <p style={{ maxWidth: '700px', margin: '0 auto 5rem', fontSize: '1.5rem', lineHeight: '1.6' }}>Professional home Care by women who care. We treat every space with the meticulous attention it deserves.</p>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
              <a href="#booking" className="btn btn-primary">Book Appointment</a>
              <a href="#services" className="btn btn-outline" style={{ borderColor: 'var(--text-primary)' }}>Our Packages</a>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
              <p style={{ textTransform: 'uppercase', letterSpacing: '0.25em', fontSize: '0.8rem', fontWeight: '900', color: 'var(--accent-primary)', marginBottom: '1rem' }}>Fine Home & Office Care</p>
              <h2 style={{ fontSize: '4.5rem' }}>Cleaning Packages</h2>
            </div>
            <div className="service-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '3rem' }}>
              {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '8rem', alignItems: 'center' }}>
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', height: '700px', backgroundColor: '#e2e8f0', position: 'relative', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
               <Image 
                src="/founders.png" 
                alt="Lana Cleaning Founders" 
                fill 
                style={{ objectFit: 'cover' }}
               />
            </div>
            <div>
              <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem', fontWeight: '900', color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>The Art of Personal Touch</p>
              <h2 style={{ fontSize: '4.5rem' }}>Meet the Founders</h2>
              <p style={{ fontSize: '1.25rem', marginBottom: '3rem' }}>Lana Cleaning Services is a passion project between two dedicated professionals who believe quality home care is an essential luxury.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ fontSize: '2rem', color: 'var(--accent-secondary)', fontWeight: '900' }}>01.</div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em' , marginBottom: '0.75rem'}}>Unrivaled Trust</h4>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>We handle every booking personally. No contractors, no strangers—just our dedicated founders delivering excellence.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ fontSize: '2rem', color: 'var(--accent-secondary)', fontWeight: '900' }}>02.</div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Botanical Quality</h4>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>We use professional-grade, eco-friendly products that are safe for your family, pets, and our planet.</p>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '5rem' }}>
                <a href="#booking" className="btn btn-primary">Experience Excellence</a>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section id="booking">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
              <p style={{ textTransform: 'uppercase', letterSpacing: '0.25em', fontSize: '0.8rem', fontWeight: '900', color: 'var(--accent-primary)', marginBottom: '1rem' }}>Reservations</p>
              <h2 style={{ fontSize: '4.5rem' }}>Book Your Appointment</h2>
              <p style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1.125rem' }}>Secure your preferred timestamp. Login with your Google account for an integrated experience.</p>
            </div>
            
            <div className="card" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
              <BookingSystem />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
