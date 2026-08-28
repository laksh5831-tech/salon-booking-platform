import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import salonService from '../../services/salonService';
import SalonCard from '../../components/salon/SalonCard';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const HomePage = () => {
  const [featuredSalons, setFeaturedSalons] = useState([]);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const res = await salonService.getSalons({ limit: 3, sort: '-rating' });
        setFeaturedSalons(res.data.data.salons);
      } catch (error) {
        console.error('Failed to fetch salons:', error);
      }
    };
    fetchSalons();
  }, []);

  return (
    <>
      <Helmet>
        <title>Velora - Your Beauty. Your Time. Your Stylist.</title>
        <meta name="description" content="Discover premium salons and book beauty appointments instantly. Velora connects you with the best beauty professionals." />
      </Helmet>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(236,72,153,0.05) 100%)',
        padding: '80px 0 100px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center min-vh-50">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
              >
                <motion.div variants={fadeUp}>
                  <span className="badge-velora badge-velora-primary mb-3">
                    <i className="bi bi-stars me-1"></i> Premium Beauty Platform
                  </span>
                </motion.div>
                <motion.h1
                  variants={fadeUp}
                  className="mb-4"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '3.5rem',
                    lineHeight: 1.15,
                    color: 'var(--velora-dark)'
                  }}
                >
                  Find Your{' '}
                  <span className="text-gradient">Perfect Salon</span>
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  className="mb-4 text-muted"
                  style={{ fontSize: '1.15rem', maxWidth: 500, lineHeight: 1.7 }}
                >
                  Discover top-rated salons, explore services, and book appointments
                  in seconds. Your beauty journey starts here.
                </motion.p>
                <motion.div variants={fadeUp} className="d-flex flex-wrap gap-3">
                  <Link to="/salons" className="btn-velora btn-velora-lg">
                    <i className="bi bi-search"></i> Explore Salons
                  </Link>
                  <Link to="/register" className="btn-velora-outline btn-velora-lg">
                    List Your Salon
                  </Link>
                </motion.div>
                <motion.div variants={fadeUp} className="d-flex align-items-center gap-4 mt-4">
                  <div className="d-flex align-items-center gap-2">
                    <div className="d-flex">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="rounded-circle border border-2 border-white" style={{
                          width: 32, height: 32, marginLeft: i > 1 ? -10 : 0,
                          overflow: 'hidden', background: `hsl(${i * 50}, 60%, 70%)`
                        }}></div>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>2,500+ happy clients</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="position-relative"
              >
                <div style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 30px 60px rgba(124,58,237,0.15)',
                  maxHeight: 480
                }}>
                  <img
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop"
                    alt="Premium salon interior"
                    className="w-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="position-absolute" style={{ bottom: -20, left: -20, zIndex: 3 }}>
                  <div className="card-velora p-3 d-flex align-items-center gap-3" style={{ boxShadow: 'var(--velora-shadow-xl)' }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: 48, height: 48, background: 'rgba(16,185,129,0.1)', color: 'var(--velora-success)'
                    }}>
                      <i className="bi bi-check-circle-fill fs-5"></i>
                    </div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Instant Booking</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>Book in under 30 seconds</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-4" style={{ background: 'white', borderBottom: '1px solid var(--velora-border)' }}>
        <div className="container">
          <div className="row text-center g-4">
            {[
              { value: '500+', label: 'Premium Salons', icon: 'bi-shop' },
              { value: '50K+', label: 'Appointments Booked', icon: 'bi-calendar-check' },
              { value: '4.8', label: 'Average Rating', icon: 'bi-star-fill' },
              { value: '200+', label: 'Expert Stylists', icon: 'bi-people' }
            ].map((stat, idx) => (
              <div key={idx} className="col-6 col-md-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="d-flex align-items-center justify-content-center mb-2" style={{ color: 'var(--velora-primary)' }}>
                    <i className={`bi ${stat.icon} fs-4`}></i>
                  </div>
                  <div className="fw-bold" style={{ fontSize: '2rem', color: 'var(--velora-dark)' }}>{stat.value}</div>
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>{stat.label}</div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Salons */}
      {featuredSalons.length > 0 && (
        <section className="page-section">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-5"
            >
              <motion.div variants={fadeUp}>
                <span className="badge-velora badge-velora-secondary mb-2">Featured</span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="section-title">Top-Rated Salons</motion.h2>
              <motion.p variants={fadeUp} className="section-subtitle mx-auto">
                Handpicked premium salons with exceptional ratings and reviews
              </motion.p>
            </motion.div>
            <div className="row g-4">
              {featuredSalons.map((salon) => (
                <div key={salon._id} className="col-lg-4 col-md-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <SalonCard salon={salon} />
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="text-center mt-5">
              <Link to="/salons" className="btn-velora btn-velora-lg">
                View All Salons <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="page-section" style={{ background: 'white' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge-velora badge-velora-primary mb-2">Simple Process</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle mx-auto">Book your next appointment in three simple steps</p>
          </div>
          <div className="row g-4">
            {[
              {
                step: '01',
                icon: 'bi-search',
                title: 'Discover',
                desc: 'Browse through hundreds of premium salons and services in your area'
              },
              {
                step: '02',
                icon: 'bi-calendar3',
                title: 'Book',
                desc: 'Select your service, choose your stylist, and pick the perfect time'
              },
              {
                step: '03',
                icon: 'bi-heart-fill',
                title: 'Enjoy',
                desc: 'Show up, relax, and enjoy your beauty experience'
              }
            ].map((item, idx) => (
              <div key={idx} className="col-lg-4 col-md-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  viewport={{ once: true }}
                  className="text-center p-4"
                >
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{
                    width: 80, height: 80,
                    background: `linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.1))`
                  }}>
                    <i className={`bi ${item.icon} fs-2`} style={{ color: 'var(--velora-primary)' }}></i>
                  </div>
                  <div className="text-gradient fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Step {item.step}</div>
                  <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--velora-dark)' }}>{item.title}</h4>
                  <p className="text-muted mt-2" style={{ fontSize: '0.95rem' }}>{item.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Velora */}
      <section className="page-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="badge-velora badge-velora-primary mb-3">Why Velora</span>
                <h2 className="section-title mb-3">The Modern Way to Book Beauty Services</h2>
                <p className="text-muted mb-4" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                  Velora connects you with the best beauty professionals in your area.
                  Real-time availability, transparent pricing, and instant confirmation.
                </p>
                <div className="d-flex flex-column gap-3">
                  {[
                    { icon: 'bi-clock', title: 'Real-Time Availability', desc: 'See available slots and book instantly' },
                    { icon: 'bi-shield-check', title: 'Verified Professionals', desc: 'Every salon and stylist is verified' },
                    { icon: 'bi-phone', title: 'Book Anywhere', desc: 'Web and mobile apps for your convenience' },
                    { icon: 'bi-chat-dots', title: 'Read Real Reviews', desc: 'Authentic reviews from real customers' }
                  ].map((feature, idx) => (
                    <div key={idx} className="d-flex gap-3 align-items-start">
                      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1" style={{
                        width: 40, height: 40, background: 'rgba(124,58,237,0.1)', color: 'var(--velora-primary)'
                      }}>
                        <i className={`bi ${feature.icon}`}></i>
                      </div>
                      <div>
                        <div className="fw-semibold">{feature.title}</div>
                        <div className="text-muted" style={{ fontSize: '0.9rem' }}>{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <img
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=700&fit=crop"
                  alt="Beauty services"
                  className="w-100"
                  style={{ borderRadius: '24px', objectFit: 'cover', maxHeight: 500 }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--velora-primary), var(--velora-secondary))',
        padding: '80px 0',
        color: 'white'
      }}>
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>
              Ready to Transform Your Beauty Experience?
            </h2>
            <p className="mb-4 mx-auto" style={{ maxWidth: 550, opacity: 0.9, fontSize: '1.1rem' }}>
              Join thousands of satisfied customers who discovered their perfect salon through Velora.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/register" className="btn btn-light btn-lg rounded-pill px-5 fw-semibold">
                Get Started Free
              </Link>
              <Link to="/salons" className="btn btn-outline-light btn-lg rounded-pill px-5 fw-semibold">
                Browse Salons
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
