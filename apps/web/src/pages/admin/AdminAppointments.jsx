import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import adminService from '../../services/adminService';
import { formatDate, formatTime, formatCurrency } from '../../utils/helpers';
import { STATUS_LABELS, STATUS_COLORS } from '../../constants';
import { LoadingSpinner, EmptyState } from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAppointments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getAppointments({ page, limit: 15, status: statusFilter || undefined });
      setAppointments(res.data.data.appointments || []);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [statusFilter]);

  return (
    <>
      <Helmet><title>Appointments - Admin Dashboard</title></Helmet>
      <h4 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>All Appointments</h4>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            className={`btn btn-sm rounded-pill px-3 ${statusFilter === status ? 'text-white' : ''}`}
            style={{ background: statusFilter === status ? 'var(--velora-primary)' : 'white', border: '1px solid var(--velora-border)', fontSize: '0.8rem' }}
            onClick={() => setStatusFilter(status)}
          >
            {status ? STATUS_LABELS[status] : 'All'}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : appointments.length === 0 ? (
        <EmptyState icon="bi-calendar-x" title="No appointments" />
      ) : (
        <>
          <div className="card-velora">
            <div className="table-responsive">
              <table className="table table-velora mb-0">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Salon</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt._id}>
                      <td className="fw-medium">{apt.customer?.firstName} {apt.customer?.lastName}</td>
                      <td>{apt.salon?.name}</td>
                      <td>{apt.service?.name}</td>
                      <td>
                        <div>{formatDate(apt.date)}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{formatTime(apt.startTime)}</div>
                      </td>
                      <td>
                        <span className={`badge-velora badge-velora-${STATUS_COLORS[apt.status]}`}>{STATUS_LABELS[apt.status]}</span>
                      </td>
                      <td className="fw-semibold">{formatCurrency(apt.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchAppointments} />
        </>
      )}
    </>
  );
};

export default AdminAppointments;
