import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceCard from '@/components/ServiceCard';
import BookingSystem from '@/components/BookingSystem';

export default function Home() {
  const services = [
    {
      id: "2h",
      title: "2-Hour Quick Refresh",
      duration: "2 Hours",
      description: "A focused, efficient cleaning of essential living spaces. Ideal for maintaining a high standard between standard visits.",
      price: "$95",
      category: "Personal"
    },
    {
      id: "move-out",
      title: "Move-Out Deep Clean",
      duration: "6 - 8 Hours",
      description: "A comprehensive, top-to-bottom transformation designed for transitions. We handle every surface to ensure your old or new home is immaculate.",
      price: "$450",
      highlight: true,
      category: "Personal"
    },
    {
      id: "reg",
      title: "Regular Maintenance",
      duration: "3 - 4 Hours",
      description: "Steadfast care for your home on a weekly or bi-weekly basis. Professionalism meet personal attention for a consistently fresh life.",
      price: "$160",
      category: "Personal"
    },
    {
      id: "deep",
      title: "Deep Detailed Clean",
      duration: "5 - 6 Hours",
      description: "The peak of cleaning excellence. Every corner, baseboard, and intricate detail is sanitized and polished to perfection.",
      price: "$350",
      category: "Personal"
    },
    {
      id: "off-e",
      title: "Executive Office Clean",
      duration: "4 Hours",
      description: "Elevate your professional space. We handle high-traffic areas, shared spaces, and personal offices with impeccable discretion and care.",
      price: "$250",
      category: "Office"
    },
    {
      id: "off-s",
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
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.95)), url("/hero.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '8rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <div className="container animate-fade-in-up">
            <span className="badge">Boutique Cleaning Group</span>
            <h1>Sparkling Clean, <br /><span style={{ color: 'var(--accent-secondary)' }}>Personal Touch.</span></h1>
            <p>Professional home care by women who care. We treat every space with the relentless and meticulous attention it deserves.</p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '3rem' }}>
              <a href="#booking" className="btn btn-primary">Book Appointment</a>
              <a href="#services" className="btn btn-outline">Our Packages</a>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span className="badge">Fine Home & Office Care</span>
              <h2 style={{ fontSize: '4.5rem' }}>Cleaning Packages</h2>
            </div>
            <div className="service-grid">
              {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '6rem', alignItems: 'center' }}>
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', height: '650px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
               <Image 
                src="/founders.png" 
                alt="Lana Cleaning Founders" 
                fill 
                style={{ objectFit: 'cover' }}
               />
            </div>
            <div>
              <span className="badge">The Art of Personal Touch</span>
              <h2 style={{ fontSize: '4rem', marginBottom: '2rem' }}>Meet the Founders</h2>
              <p style={{ fontSize: '1.25rem', marginBottom: '3.5rem' }}>Lana Cleaning Services is a passion project between two dedicated professionals who believe quality home care is an essential luxury. We obsess over the details so you don't have to.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ fontSize: '3rem', color: 'var(--accent-secondary)', fontWeight: '900', lineHeight: '1', letterSpacing: '-0.05em' }}>01</div>
                  <div>
                    <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '800' }}>Unrivaled Trust</h4>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>We handle every booking personally. No contractors, no strangers—just our dedicated founders delivering excellence.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ fontSize: '3rem', color: 'var(--accent-secondary)', fontWeight: '900', lineHeight: '1', letterSpacing: '-0.05em' }}>02</div>
                  <div>
                    <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '800' }}>Botanical Quality</h4>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>We use professional-grade, eco-friendly products that are safe for your family, pets, and our planet.</p>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '4rem' }}>
                <a href="#booking" className="btn btn-primary">Experience Excellence</a>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section id="booking" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span className="badge">Reservations</span>
              <h2 style={{ fontSize: '4.5rem' }}>Book Your Appointment</h2>
              <p style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1.2rem' }}>Secure your preferred timestamp. We handle everything else from there with utmost care.</p>
            </div>
            
            <div className="card" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0', border: 'none', background: 'transparent', boxShadow: 'none' }}>
              <BookingSystem />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
