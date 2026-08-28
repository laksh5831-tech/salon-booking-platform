import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import appointmentService from '../../services/appointmentService';
import { formatDate, formatTime, formatCurrency } from '../../utils/helpers';
import { STATUS_LABELS } from '../../constants';
import { LoadingSpinner, EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchAppointments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments({
        page,
        limit: 15,
        status: statusFilter || undefined
      });
      setAppointments(res.data.data.appointments || []);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [statusFilter]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentService.updateAppointment(id, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <>
      <Helmet><title>Appointments - Salon Dashboard</title></Helmet>

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h4 className="mb-0" style={{ fontFamily: 'var(--font-display)' }}>Appointments</h4>
        <div className="d-flex gap-2">
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              className={`btn btn-sm rounded-pill px-3 ${statusFilter === status ? 'text-white' : ''}`}
              style={{
                background: statusFilter === status ? 'var(--velora-primary)' : 'white',
                border: '1px solid var(--velora-border)',
                fontSize: '0.8rem'
              }}
              onClick={() => setStatusFilter(status)}
            >
              {status ? STATUS_LABELS[status] : 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <EmptyState icon="bi-calendar-x" title="No appointments" message="No appointments match your filter." />
      ) : (
        <div className="card-velora">
          <div className="table-responsive">
            <table className="table table-velora mb-0">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Staff</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt._id}>
                    <td>
                      <div className="fw-medium">{apt.customer?.firstName} {apt.customer?.lastName}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{apt.customer?.email}</div>
                    </td>
                    <td>{apt.service?.name}</td>
                    <td>{apt.staff?.name}</td>
                    <td>{formatDate(apt.date)}</td>
                    <td>{formatTime(apt.startTime)}</td>
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
                    <td>
                      <div className="d-flex gap-1">
                        {apt.status === 'pending' && (
                          <button
                            className="btn btn-sm btn-outline-success rounded-pill px-2"
                            title="Confirm"
                            onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                        )}
                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill px-2"
                            title="Mark Complete"
                            onClick={() => handleStatusUpdate(apt._id, 'completed')}
                          >
                            <i className="bi bi-check-all"></i>
                          </button>
                        )}
                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-2"
                            title="Cancel"
                            onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentManagement;
