import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminService from '../../services/adminService';
import { formatCurrency } from '../../utils/helpers';
import { LoadingSpinner } from '../../components/common/EmptyState';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getStats();
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const chartData = [
    { name: 'Customers', count: stats?.totalCustomers || 0 },
    { name: 'Salons', count: stats?.totalSalons || 0 },
    { name: 'Staff', count: stats?.totalStaff || 0 },
    { name: 'Services', count: stats?.totalServices || 0 },
  ];

  return (
    <>
      <Helmet><title>Admin Dashboard - Velora</title></Helmet>

      <h4 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>Platform Overview</h4>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: 'bi-people', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
          { label: 'Total Salons', value: stats?.totalSalons || 0, icon: 'bi-shop', color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
          { label: 'Total Appointments', value: stats?.totalAppointments || 0, icon: 'bi-calendar-check', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Platform Revenue', value: formatCurrency(stats?.platformRevenue || 0), icon: 'bi-currency-rupee', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { label: "Today's Bookings", value: stats?.todayAppointments || 0, icon: 'bi-clock', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Completed', value: stats?.completedAppointments || 0, icon: 'bi-check-circle', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Cancelled', value: stats?.cancelledAppointments || 0, icon: 'bi-x-circle', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Avg Rating', value: `${stats?.averageRating || 0} ★`, icon: 'bi-star', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
        ].map((stat, idx) => (
          <div key={idx} className="col-md-6 col-xl-3">
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-card-label">{stat.label}</div>
                  <div className="stat-card-value" style={{ fontSize: '1.6rem' }}>{stat.value}</div>
                </div>
                <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>
                  <i className={`bi ${stat.icon}`}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card-velora">
            <div className="card-velora-body p-4">
              <h6 className="mb-3" style={{ fontFamily: 'var(--font-display)' }}>Platform Statistics</h6>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card-velora h-100">
            <div className="card-velora-body p-4">
              <h6 className="mb-3" style={{ fontFamily: 'var(--font-display)' }}>Quick Stats</h6>
              <div className="d-flex flex-column gap-3">
                {[
                  { label: 'Salon Owners', value: stats?.totalSalonOwners || 0, color: '#7C3AED' },
                  { label: 'Active Categories', value: stats?.totalCategories || 0, color: '#EC4899' },
                  { label: 'Total Staff', value: stats?.totalStaff || 0, color: '#10B981' },
                ].map((item, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: 'var(--velora-bg)' }}>
                    <span className="text-muted">{item.label}</span>
                    <span className="fw-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
