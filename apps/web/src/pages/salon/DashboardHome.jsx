import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import salonService from '../../services/salonService';
import appointmentService from '../../services/appointmentService';
import useSalon from '../../hooks/useSalon';
import { formatCurrency, formatDate, formatTime } from '../../utils/helpers';
import { LoadingSpinner } from '../../components/common/EmptyState';

const DashboardHome = () => {
  const { salon, loading: salonLoading } = useSalon();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salon?._id) return;
    const fetchData = async () => {
      try {
        const [statsRes, appointmentsRes] = await Promise.all([
          salonService.getSalonStats(salon._id),
          appointmentService.getAppointments({ limit: 10 })
        ]);
        setStats(statsRes.data.data);
        setAppointments(appointmentsRes.data.data.appointments || []);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [salon?._id]);

  if (loading || salonLoading) return <LoadingSpinner text="Loading dashboard..." />;

  const weeklyData = [
    { name: 'Mon', bookings: 8, revenue: 520 },
    { name: 'Tue', bookings: 12, revenue: 780 },
    { name: 'Wed', bookings: 6, revenue: 390 },
    { name: 'Thu', bookings: 15, revenue: 975 },
    { name: 'Fri', bookings: 18, revenue: 1170 },
    { name: 'Sat', bookings: 22, revenue: 1430 },
    { name: 'Sun', bookings: 0, revenue: 0 },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Velora</title>
      </Helmet>

      <h4 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>Dashboard Overview</h4>

      {/* Stats Grid */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Bookings', value: stats?.totalAppointments || 0, icon: 'bi-calendar-check', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
          { label: "Today's Appointments", value: stats?.todayAppointments || 0, icon: 'bi-clock', color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
          { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: 'bi-currency-rupee', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Completed', value: stats?.completedAppointments || 0, icon: 'bi-check-circle', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
        ].map((stat, idx) => (
          <div key={idx} className="col-md-6 col-xl-3">
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-card-label">{stat.label}</div>
                  <div className="stat-card-value">{stat.value}</div>
                </div>
                <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>
                  <i className={`bi ${stat.icon}`}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* Booking Chart */}
        <div className="col-lg-8">
          <div className="card-velora">
            <div className="card-velora-body p-4">
              <h6 className="mb-3" style={{ fontFamily: 'var(--font-display)' }}>Weekly Bookings</h6>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="bookings" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="col-lg-4">
          <div className="card-velora">
            <div className="card-velora-body p-4">
              <h6 className="mb-3" style={{ fontFamily: 'var(--font-display)' }}>Revenue</h6>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#EC4899" strokeWidth={2} dot={{ fill: '#EC4899' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="card-velora">
        <div className="card-velora-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0" style={{ fontFamily: 'var(--font-display)' }}>Recent Appointments</h6>
            <Link to="/dashboard/appointments" className="text-decoration-none" style={{ fontSize: '0.9rem' }}>View All</Link>
          </div>

          {appointments.length === 0 ? (
            <p className="text-muted text-center py-4">No appointments yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-velora mb-0">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map(apt => (
                    <tr key={apt._id}>
                      <td>
                        <div className="fw-medium">{apt.customer?.firstName} {apt.customer?.lastName}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{apt.customer?.email}</div>
                      </td>
                      <td>{apt.service?.name}</td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>{formatDate(apt.date)}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{formatTime(apt.startTime)}</div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <span className={`badge-velora ${apt.paymentStatus === 'paid' ? 'badge-velora-success' : 'badge-velora-warning'}`}>
                            {apt.paymentStatus === 'paid' ? (
                              <><i className="bi bi-check-circle me-1"></i>Paid</>
                            ) : (
                              <><i className="bi bi-clock-history me-1"></i>Pending</>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="fw-semibold">{formatCurrency(apt.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardHome;
