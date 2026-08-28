import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import salonService from '../../services/salonService';
import useSalon from '../../hooks/useSalon';
import { LoadingSpinner, EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const StaffLeavePage = () => {
  const { salon, loading: salonLoading } = useSalon();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salon?._id) return;
    const fetchLeaves = async () => {
      try {
        const res = await salonService.getSalonStaffLeave(salon._id, { limit: 50 });
        setLeaves(res.data.data.leaves || []);
      } catch (error) {
        toast.error('Failed to load staff leaves');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, [salon?._id]);

  if (loading || salonLoading) return <LoadingSpinner text="Loading staff leaves..." />;

  return (
    <>
      <Helmet><title>Staff Leave - Salon Dashboard</title></Helmet>
      <h4 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>Staff Leave Requests</h4>

      {leaves.length === 0 ? (
        <EmptyState icon="bi-calendar-minus" title="No leave requests" message="Staff leave requests will appear here." />
      ) : (
        <div className="card-velora">
          <div className="table-responsive">
            <table className="table table-velora mb-0">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(leave => (
                  <tr key={leave._id}>
                    <td className="fw-medium">{leave.staff?.name}</td>
                    <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="text-muted">{leave.reason || 'No reason provided'}</td>
                    <td>
                      <span className={`badge-velora ${
                        leave.status === 'approved' ? 'badge-velora-success' :
                        leave.status === 'rejected' ? 'badge-velora-danger' :
                        'badge-velora-warning'
                      }`}>
                        {leave.status}
                      </span>
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

export default StaffLeavePage;
