import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import appointmentService from '../../services/appointmentService';
import { LoadingSpinner, EmptyState } from '../../components/common/EmptyState';
import { formatDate, formatTime, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const BookingListPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments({ limit: 50 });
      setAppointments(res.data.data.appointments || []);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const now = new Date();
  const upcoming = appointments.filter(a => new Date(a.date) >= now && !['cancelled', 'completed'].includes(a.status));
  const past = appointments.filter(a => ['completed'].includes(a.status));
  const cancelled = appointments.filter(a => a.status === 'cancelled');

  const filtered = activeTab === 'upcoming' ? upcoming : activeTab === 'past' ? past : cancelled;

  return (
    <>
      <Helmet>
        <title>My Bookings - Velora</title>
      </Helmet>

      <div className="container py-5">
        <h3 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>My Bookings</h3>

        <div className="d-flex gap-2 mb-4">
          {[
            { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
            { key: 'past', label: `Past (${past.length})` },
            { key: 'cancelled', label: `Cancelled (${cancelled.length})` }
          ].map(tab => (
            <button
              key={tab.key}
              className={`btn rounded-pill px-4 py-2 fw-medium ${
                activeTab === tab.key ? 'text-white' : ''
              }`}
              style={{
                background: activeTab === tab.key ? 'var(--velora-primary)' : 'white',
                color: activeTab === tab.key ? 'white' : 'var(--velora-text)',
                border: '1px solid var(--velora-border)',
                fontSize: '0.9rem'
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading your bookings..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="bi-calendar-x"
            title={`No ${activeTab} bookings`}
            message="Your appointments will appear here once you book a service."
            action={activeTab === 'upcoming'}
            actionLabel="Browse Salons"
            onAction={() => window.location.href = '/salons'}
          />
        ) : (
          <div className="d-flex flex-column gap-3">
            {filtered.map(appointment => (
              <div
                key={appointment._id}
                className="card-velora text-decoration-none"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/bookings/${appointment._id}`)}
              >
                <div className="card-velora-body p-4">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div className="d-flex gap-3">
                      <div className="rounded-3 overflow-hidden flex-shrink-0" style={{
                        width: 60, height: 60,
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.1))'
                      }}>
                        <div className="d-flex align-items-center justify-content-center w-100 h-100" style={{ color: 'var(--velora-primary)' }}>
                          <i className="bi bi-scissors fs-4"></i>
                        </div>
                      </div>
                      <div>
                        <h6 className="mb-1 fw-semibold" style={{ color: 'var(--velora-dark)' }}>
                          {appointment.service?.name}
                        </h6>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                          {appointment.salon?.name}
                        </div>
                        <div className="d-flex gap-3 mt-1" style={{ fontSize: '0.8rem' }}>
                          <span className="text-muted">
                            <i className="bi bi-calendar me-1"></i>{formatDate(appointment.date)}
                          </span>
                          <span className="text-muted">
                            <i className="bi bi-clock me-1"></i>{formatTime(appointment.startTime)}
                          </span>
                          <span className="text-muted">
                            with {appointment.staff?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-end d-flex flex-column align-items-end gap-1">
                      <span className={`badge-velora ${appointment.paymentStatus === 'paid' ? 'badge-velora-success' : 'badge-velora-warning'}`}>
                        {appointment.paymentStatus === 'paid' ? (
                          <><i className="bi bi-check-circle me-1"></i>Paid</>
                        ) : (
                          <><i className="bi bi-clock-history me-1"></i>Pending</>
                        )}
                      </span>
                      <div className="mt-1 fw-bold" style={{ color: 'var(--velora-primary)' }}>
                        {formatCurrency(appointment.price)}
                      </div>
                      {appointment.paymentStatus !== 'paid' && !['cancelled', 'completed'].includes(appointment.status) && (
                        <button
                          className="btn-velora btn-velora-sm justify-content-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/bookings/${appointment._id}`);
                          }}
                        >
                          <i className="bi bi-credit-card me-1"></i> Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BookingListPage;
