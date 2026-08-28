import { Link } from 'react-router-dom';

const SOCIAL_LINKS = [
  { href: 'https://www.instagram.com', icon: 'bi-instagram', label: 'Instagram' },
  { href: 'https://www.facebook.com', icon: 'bi-facebook', label: 'Facebook' },
  { href: 'https://twitter.com', icon: 'bi-twitter-x', label: 'Twitter' }
];

const Footer = () => {
  return (
    <footer className="footer-velora">
      <div className="container">
        <div className="row g-4 mb-5">
          <div className="col-lg-4 col-md-6">
            <h5 className="text-gradient mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>
              Velora
            </h5>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>
              Discover premium salons and book beauty appointments instantly.
              Your beauty. Your time. Your stylist.
            </p>
            <div className="d-flex gap-3 mt-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '1.1rem' }}
                >
                  <i className={`bi ${s.icon}`}></i>
                </a>
              ))}
            </div>
          </div>
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-semibold mb-3" style={{ fontSize: '0.95rem' }}>Product</h6>
            <ul className="list-unstyled footer-links">
              <li className="mb-2"><Link to="/salons" style={{ fontSize: '0.9rem' }}>Discover Salons</Link></li>
              <li className="mb-2"><Link to="/register" style={{ fontSize: '0.9rem' }}>Join as Salon</Link></li>
              <li className="mb-2"><Link to="/login" style={{ fontSize: '0.9rem' }}>Sign In</Link></li>
              <li className="mb-2"><Link to="/mobile-app" style={{ fontSize: '0.9rem' }}>Mobile App</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-semibold mb-3" style={{ fontSize: '0.95rem' }}>Company</h6>
            <ul className="list-unstyled footer-links">
              <li className="mb-2"><Link to="/about" style={{ fontSize: '0.9rem' }}>About Us</Link></li>
              <li className="mb-2"><Link to="/careers" style={{ fontSize: '0.9rem' }}>Careers</Link></li>
              <li className="mb-2"><Link to="/contact" style={{ fontSize: '0.9rem' }}>Contact</Link></li>
              <li className="mb-2"><Link to="/blog" style={{ fontSize: '0.9rem' }}>Blog</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-semibold mb-3" style={{ fontSize: '0.95rem' }}>Support</h6>
            <ul className="list-unstyled footer-links">
              <li className="mb-2"><Link to="/help" style={{ fontSize: '0.9rem' }}>Help Center</Link></li>
              <li className="mb-2"><Link to="/privacy" style={{ fontSize: '0.9rem' }}>Privacy Policy</Link></li>
              <li className="mb-2"><Link to="/terms" style={{ fontSize: '0.9rem' }}>Terms of Service</Link></li>
              <li className="mb-2">
                <a href="http://localhost:5000/api/docs" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem' }}>
                  API Docs
                </a>
              </li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-semibold mb-3" style={{ fontSize: '0.95rem' }}>Contact</h6>
            <ul className="list-unstyled">
              <li className="mb-2" style={{ fontSize: '0.9rem' }}>
                <i className="bi bi-envelope me-2"></i> hello@velora.demo
              </li>
              <li className="mb-2" style={{ fontSize: '0.9rem' }}>
                <i className="bi bi-telephone me-2"></i> +91 98400 00000
              </li>
              <li className="mb-2" style={{ fontSize: '0.9rem' }}>
                <i className="bi bi-geo-alt me-2"></i> Chennai, Tamil Nadu
              </li>
            </ul>
          </div>
        </div>
        <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pt-3">
          <p className="mb-0" style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
            &copy; 2026 Velora. All rights reserved.
          </p>
          <p className="mb-0 mt-2 mt-md-0" style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
            Made with care for beauty professionals
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;