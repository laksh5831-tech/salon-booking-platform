import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import { timeAgo } from '../../utils/helpers';

const TYPE_ICONS = {
  booking: 'bi-calendar2-check',
  cancellation: 'bi-x-circle',
  status_update: 'bi-arrow-repeat',
  payment: 'bi-credit-card',
  system: 'bi-info-circle'
};

const TYPE_COLORS = {
  booking: '#10B981',
  cancellation: '#EF4444',
  status_update: '#7C3AED',
  payment: '#F59E0B',
  system: '#6B7280'
};

const NotificationsDropdown = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({ limit: 10 });
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    if (!open) loadNotifications();
    setOpen(!open);
  };

  const openNotification = async (notif) => {
    try {
      await notificationService.markAsRead(notif._id);
    } catch (err) {
      // silent
    }
    setUnreadCount((c) => Math.max(0, c - 1));
    setNotifications((list) => list.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n)));
    setOpen(false);

    if (notif.data?.appointmentId) {
      navigate(`/bookings/${notif.data.appointmentId}`);
    } else if (notif.data?.salonId) {
      navigate(`/salons/${notif.data.salonId}`);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      // silent
    }
    setUnreadCount(0);
    setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
    } catch (err) {
      // silent
    }
    setNotifications((list) => list.filter((n) => n._id !== id));
  };

  return (
    <div className="position-relative" ref={ref}>
      <button
        className="btn btn-link position-relative p-2 d-none d-md-flex"
        style={{ color: 'var(--velora-muted)' }}
        onClick={toggle}
        aria-label="Notifications"
      >
        <i className="bi bi-bell" style={{ fontSize: '1.1rem' }}></i>
        {unreadCount > 0 && (
          <span className="position-absolute badge-velora-update" style={{
            top: 4, right: 2, minWidth: 18, height: 18,
            background: 'var(--velora-danger)', color: '#fff', borderRadius: '50%',
            fontSize: '0.65rem', fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '0 4px'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="position-absolute border-0 shadow-lg p-0"
          style={{
            top: '110%', right: 0, background: '#fff',
            borderRadius: 'var(--velora-radius-lg)',
            width: 360, maxHeight: 460, zIndex: 1060,
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}
        >
          <div className="d-flex align-items-center justify-content-between px-3 py-3" style={{ borderBottom: '1px solid var(--velora-border)' }}>
            <strong style={{ fontSize: '0.95rem' }}>Notifications</strong>
            <button
              className="btn btn-sm text-primary fw-semibold"
              style={{ fontSize: '0.78rem' }}
              onClick={markAllRead}
            >
              Mark all read
            </button>
          </div>

          <div style={{ overflowY: 'auto' }}>
            {loading && (
              <div className="text-center text-muted py-4" style={{ fontSize: '0.85rem' }}>
                Loading...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="text-center py-5 px-3">
                <i className="bi bi-bell-slash text-muted" style={{ fontSize: '1.8rem' }}></i>
                <div className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
                  No notifications yet
                </div>
              </div>
            )}

            {!loading && notifications.map((notif) => (
              <button
                key={notif._id}
                className="w-100 text-start border-0 bg-transparent d-flex align-items-start gap-3 px-3 py-3"
                style={{
                  borderBottom: '1px solid var(--velora-border)',
                  background: notif.isRead ? 'transparent' : 'rgba(124,58,237,0.04)',
                  cursor: 'pointer'
                }}
                onClick={() => openNotification(notif)}
              >
                <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{
                  width: 36, height: 36,
                  background: `${TYPE_COLORS[notif.type] || '#6B7280'}1A`,
                  color: TYPE_COLORS[notif.type] || '#6B7280'
                }}>
                  <i className={`bi ${TYPE_ICONS[notif.type] || 'bi-info-circle'}`} style={{ fontSize: '0.9rem' }}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <strong style={{ fontSize: '0.85rem' }}>{notif.title}</strong>
                    <span className="text-muted flex-shrink-0" style={{ fontSize: '0.7rem' }}>
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="mb-0 text-muted mt-1" style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                    {notif.message}
                  </p>
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  className="text-muted flex-shrink-0"
                  style={{ fontSize: '0.8rem' }}
                  onClick={(e) => deleteNotification(e, notif._id)}
                >
                  ×
                </span>
              </button>
            ))}
          </div>

          <div className="text-center py-2" style={{ borderTop: '1px solid var(--velora-border)' }}>
            <button
              className="btn btn-sm text-primary fw-semibold"
              style={{ fontSize: '0.8rem' }}
              onClick={() => { setOpen(false); navigate('/bookings'); }}
            >
              View all bookings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;