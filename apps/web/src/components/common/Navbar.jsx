import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import NotificationsDropdown from './NotificationsDropdown';

const CATEGORIES = [
  { label: 'Hair & Styling', icon: 'bi-scissors', slug: 'hair-styling' },
  { label: 'Nail Art', icon: 'bi-hand-index-thumb', slug: 'nail-art' },
  { label: 'Skin Care', icon: 'bi-stars', slug: 'skin-care' },
  { label: 'Makeup', icon: 'bi-palette', slug: 'makeup' },
  { label: 'Massage & Spa', icon: 'bi-moisture', slug: 'massage-spa' },
  { label: 'Tattoo & Piercing', icon: 'bi-brush', slug: 'tattoo-piercing' },
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const catRef = useRef(null);
  const companyRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
      if (companyRef.current && !companyRef.current.contains(e.target)) setCompanyOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/salons?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="navbar navbar-expand-lg nav-velora"
      style={{
        boxShadow: scrolled
          ? '0 4px 20px rgba(124, 58, 237, 0.08), 0 1px 3px rgba(0,0,0,0.04)'
          : '0 1px 3px rgba(0,0,0,0.03)',
        transition: 'box-shadow 0.3s ease'
      }}
    >
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)'
            }}
          >
            <i className="bi bi-stars text-white" style={{ fontSize: '1rem' }}></i>
          </div>
          <span className="text-gradient" style={{ fontSize: '1.4rem' }}>Velora</span>
        </Link>

        {/* Mobile toggle */}
        <button className="navbar-toggler border-0 p-1" onClick={() => setMobileOpen(!mobileOpen)}>
          <div style={{ width: 24, height: 18, position: 'relative' }}>
            <span style={{
              position: 'absolute', height: 2, width: '100%', background: 'var(--velora-dark)',
              borderRadius: 2, transition: '0.3s', top: mobileOpen ? 8 : 0,
              transform: mobileOpen ? 'rotate(45deg)' : 'none'
            }} />
            <span style={{
              position: 'absolute', height: 2, width: '100%', background: 'var(--velora-dark)',
              borderRadius: 2, transition: '0.3s', top: 8,
              opacity: mobileOpen ? 0 : 1
            }} />
            <span style={{
              position: 'absolute', height: 2, width: '100%', background: 'var(--velora-dark)',
              borderRadius: 2, transition: '0.3s', top: mobileOpen ? 8 : 16,
              transform: mobileOpen ? 'rotate(-45deg)' : 'none'
            }} />
          </div>
        </button>

        {/* Collapsed menu */}
        <div className={`collapse navbar-collapse ${mobileOpen ? 'show' : ''}`}>
          {/* Search bar - center */}
          <div className="d-none d-lg-flex mx-auto" style={{ flex: '0 1 420px' }}>
            <form onSubmit={handleSearch} className="w-100 position-relative">
              <div className="d-flex align-items-center" style={{
                background: 'var(--velora-bg)',
                border: '1.5px solid var(--velora-border)',
                borderRadius: 'var(--velora-radius-pill)',
                padding: '6px 8px 6px 16px',
                transition: 'all 0.2s'
              }}>
                <i className="bi bi-search text-muted me-2" style={{ fontSize: '0.9rem' }}></i>
                <input
                  type="text"
                  className="form-control-plaintext border-0 bg-transparent p-0"
                  placeholder="Search salons, services, styles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '0.9rem', outline: 'none', flex: 1 }}
                />
                <button type="submit" className="btn btn-sm px-3 py-1" style={{
                  background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                  color: '#fff', borderRadius: 'var(--velora-radius-pill)',
                  fontWeight: 600, fontSize: '0.8rem'
                }}>
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="d-lg-none my-3">
            <div className="d-flex align-items-center" style={{
              background: 'var(--velora-bg)', border: '1.5px solid var(--velora-border)',
              borderRadius: 'var(--velora-radius-pill)', padding: '8px 8px 8px 16px'
            }}>
              <i className="bi bi-search text-muted me-2"></i>
              <input
                type="text" className="form-control-plaintext border-0 bg-transparent p-0 flex-grow-1"
                placeholder="Search..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-sm px-3 py-1" style={{
                background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                color: '#fff', borderRadius: 'var(--velora-radius-pill)', fontWeight: 600, fontSize: '0.8rem'
              }}>Search</button>
            </div>
          </form>

          {/* Nav links - right */}
          <ul className="navbar-nav mb-2 mb-lg-0 ms-lg-3 gap-1">
            <li className="nav-item">
              <Link className={`nav-link d-flex align-items-center gap-1 ${isActive('/salons') ? 'active' : ''}`} to="/salons">
                <i className="bi bi-compass" style={{ fontSize: '0.95rem' }}></i>
                <span>Discover</span>
              </Link>
            </li>

            {/* Categories dropdown */}
            <li className="nav-item position-relative" ref={catRef}>
              <button
                className={`nav-link d-flex align-items-center gap-1 border-0 bg-transparent ${catOpen ? 'active' : ''}`}
                onClick={() => setCatOpen(!catOpen)}
              >
                <i className="bi bi-grid-3x3-gap" style={{ fontSize: '0.95rem' }}></i>
                <span>Categories</span>
                <i className={`bi bi-chevron-down ms-1`} style={{
                  fontSize: '0.65rem', transition: 'transform 0.2s',
                  transform: catOpen ? 'rotate(180deg)' : 'rotate(0)'
                }}></i>
              </button>

              {catOpen && (
                <div
                  className="position-absolute border-0 shadow-lg p-2"
                  style={{
                    top: '100%', left: 0, background: '#fff',
                    borderRadius: 'var(--velora-radius-lg)', minWidth: 220, zIndex: 1050
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none"
                      style={{ color: 'var(--velora-text)', fontSize: '0.9rem', transition: '0.15s' }}
                      to={`/salons?category=${cat.slug}`}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--velora-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setCatOpen(false)}
                    >
                      <div className="d-flex align-items-center justify-content-center rounded-2" style={{
                        width: 32, height: 32,
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.08))'
                      }}>
                        <i className={`bi ${cat.icon}`} style={{ color: 'var(--velora-primary)', fontSize: '0.85rem' }}></i>
                      </div>
                      <span className="fw-medium">{cat.label}</span>
                    </Link>
                  ))}
                  <hr className="my-1" />
                  <Link
                    className="d-flex align-items-center justify-content-center gap-2 px-3 py-2 rounded-3 text-decoration-none"
                    style={{ color: 'var(--velora-primary)', fontSize: '0.85rem', fontWeight: 600 }}
                    to="/salons"
                    onClick={() => setCatOpen(false)}
                  >
                    View All Salons <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              )}
            </li>

            {/* Company dropdown */}
            <li className="nav-item position-relative" ref={companyRef}>
              <button
                className={`nav-link d-flex align-items-center gap-1 border-0 bg-transparent ${companyOpen ? 'active' : ''}`}
                onClick={() => setCompanyOpen(!companyOpen)}
              >
                <i className="bi bi-building" style={{ fontSize: '0.95rem' }}></i>
                <span>Company</span>
                <i className={`bi bi-chevron-down ms-1`} style={{
                  fontSize: '0.65rem', transition: 'transform 0.2s',
                  transform: companyOpen ? 'rotate(180deg)' : 'rotate(0)'
                }}></i>
              </button>

              {companyOpen && (
                <div
                  className="position-absolute border-0 shadow-lg p-2"
                  style={{
                    top: '100%', left: 0, background: '#fff',
                    borderRadius: 'var(--velora-radius-lg)', minWidth: 200, zIndex: 1050
                  }}
                >
                  {[
                    { label: 'About Us', icon: 'bi-info-circle', to: '/about' },
                    { label: 'Careers', icon: 'bi-briefcase', to: '/careers' },
                    { label: 'Contact', icon: 'bi-envelope', to: '/contact' },
                    { label: 'Blog', icon: 'bi-megaphone', to: '/blog' }
                  ].map((item) => (
                    <Link
                      key={item.label}
                      className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${location.pathname === item.to ? 'fw-semibold' : ''}`}
                      style={{ color: location.pathname === item.to ? 'var(--velora-primary)' : 'var(--velora-text)', fontSize: '0.9rem', transition: '0.15s' }}
                      to={item.to}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--velora-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => { setCompanyOpen(false); setMobileOpen(false); }}
                    >
                      <div className="d-flex align-items-center justify-content-center rounded-2" style={{
                        width: 32, height: 32,
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.08))'
                      }}>
                        <i className={`bi ${item.icon}`} style={{ color: 'var(--velora-primary)', fontSize: '0.85rem' }}></i>
                      </div>
                      <span className="fw-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </li>

            {isAuthenticated && (
              <li className="nav-item">
                <Link className={`nav-link d-flex align-items-center gap-1 ${isActive('/bookings') ? 'active' : ''}`} to="/bookings">
                  <i className="bi bi-calendar2-check" style={{ fontSize: '0.95rem' }}></i>
                  <span>My Bookings</span>
                </Link>
              </li>
            )}
          </ul>

          {/* Right actions */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <NotificationsDropdown />

                {/* User dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-link text-decoration-none d-flex align-items-center gap-2 dropdown-toggle p-1"
                    data-bs-toggle="dropdown"
                    style={{ boxShadow: 'none' }}
                  >
                    <div className="position-relative">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white"
                        style={{
                          width: 38, height: 38,
                          background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                          fontSize: '0.85rem', fontWeight: 700,
                          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
                        }}
                      >
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div style={{
                        position: 'absolute', bottom: -1, right: -1,
                        width: 12, height: 12, background: 'var(--velora-success)',
                        borderRadius: '50%', border: '2px solid #fff'
                      }}></div>
                    </div>
                    <span className="d-none d-lg-inline fw-medium" style={{ fontSize: '0.9rem' }}>
                      {user?.firstName}
                    </span>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-2" style={{
                    borderRadius: 'var(--velora-radius-lg)', minWidth: 230
                  }}>
                    <li className="px-3 py-2 mb-1 rounded-3" style={{ background: 'var(--velora-bg)' }}>
                      <div className="fw-bold" style={{ fontSize: '0.95rem' }}>{user?.firstName} {user?.lastName}</div>
                      <div className="text-muted d-flex align-items-center gap-1 mt-1" style={{ fontSize: '0.78rem' }}>
                        <span className="badge rounded-pill px-2 py-0" style={{
                          background: 'rgba(124,58,237,0.1)', color: 'var(--velora-primary)', fontWeight: 600, fontSize: '0.7rem'
                        }}>
                          {user?.role?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        <span className="ms-1">{user?.email}</span>
                      </div>
                    </li>
                    <li><hr className="my-1" /></li>

                    <DropdownLink icon="bi-person" label="My Profile" to="/profile" onClick={() => setMobileOpen(false)} />
                    <DropdownLink icon="bi-calendar2-check" label="My Bookings" to="/bookings" onClick={() => setMobileOpen(false)} />

                    {user?.role === 'salon_owner' && (
                      <DropdownLink icon="bi-grid" label="Salon Dashboard" to="/dashboard" onClick={() => setMobileOpen(false)} />
                    )}
                    {user?.role === 'admin' && (
                      <DropdownLink icon="bi-shield-lock" label="Admin Panel" to="/admin" onClick={() => setMobileOpen(false)} />
                    )}

                    <li><hr className="my-1" /></li>
                    <li>
                      <button
                        className="dropdown-item py-2 d-flex align-items-center gap-2 text-danger fw-medium rounded-3"
                        onClick={() => { logout(); setMobileOpen(false); }}
                        style={{ fontSize: '0.9rem' }}
                      >
                        <i className="bi bi-box-arrow-right"></i> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link className="btn d-none d-md-flex align-items-center" to="/login" onClick={() => setMobileOpen(false)} style={{
                  border: '1.5px solid var(--velora-border)', borderRadius: 'var(--velora-radius-pill)',
                  padding: '7px 20px', fontWeight: 600, fontSize: '0.88rem',
                  color: 'var(--velora-text)', textDecoration: 'none', transition: '0.2s'
                }}>
                  Sign In
                </Link>
                <Link className="btn d-flex align-items-center gap-1" to="/register" onClick={() => setMobileOpen(false)} style={{
                  background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                  color: '#fff', borderRadius: 'var(--velora-radius-pill)',
                  padding: '8px 22px', fontWeight: 600, fontSize: '0.88rem',
                  textDecoration: 'none', boxShadow: '0 2px 10px rgba(124, 58, 237, 0.25)',
                  transition: '0.2s'
                }}>
                  Get Started <i className="bi bi-arrow-right" style={{ fontSize: '0.8rem' }}></i>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const DropdownLink = ({ icon, label, to, onClick }) => (
  <li>
    <Link
      className="dropdown-item py-2 d-flex align-items-center gap-2 rounded-3"
      style={{ fontSize: '0.9rem' }}
      to={to}
      onClick={onClick}
    >
      <i className={`bi ${icon}`}></i> {label}
    </Link>
  </li>
);

export default Navbar;
