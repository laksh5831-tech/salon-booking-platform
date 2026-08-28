import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin', icon: 'bi-grid', label: 'Dashboard', exact: true },
    { path: '/admin/users', icon: 'bi-people', label: 'Users' },
    { path: '/admin/salons', icon: 'bi-shop', label: 'Salons' },
    { path: '/admin/appointments', icon: 'bi-calendar-check', label: 'Appointments' },
    { path: '/admin/reviews', icon: 'bi-star', label: 'Reviews' },
    { path: '/admin/catalog', icon: 'bi-list-check', label: 'Services & Categories' },
  ];

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="d-flex">
      {sidebarOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1039 }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'show' : ''}`} style={{ background: '#1a1a2e' }}>
        <div className="px-4 mb-4">
          <Link to="/" className="text-decoration-none">
            <h4 className="mb-0" style={{ fontFamily: 'var(--font-display)', color: '#EC4899' }}>Velora</h4>
          </Link>
          <div className="mt-1" style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Admin Dashboard</div>
        </div>

        <nav className="d-flex flex-column gap-1 px-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-4 py-3" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #EC4899, #F59E0B)', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="overflow-hidden">
              <div className="text-white fw-medium" style={{ fontSize: '0.85rem' }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{user?.email}</div>
            </div>
          </div>
          <button
            className="btn btn-sm w-100 rounded-pill"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#9CA3AF', border: 'none' }}
            onClick={logout}
          >
            <i className="bi bi-box-arrow-right me-1"></i> Sign Out
          </button>
        </div>
      </aside>

      <div className="dashboard-main flex-grow-1">
        <div className="d-flex align-items-center justify-content-between px-4 py-3 bg-white border-bottom">
          <button className="btn d-lg-none border-0" onClick={() => setSidebarOpen(true)}>
            <i className="bi bi-list fs-4"></i>
          </button>
          <div className="d-flex align-items-center gap-3">
            <span className="badge-velora badge-velora-danger">
              <i className="bi bi-shield-lock me-1"></i> Admin
            </span>
          </div>
        </div>
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
