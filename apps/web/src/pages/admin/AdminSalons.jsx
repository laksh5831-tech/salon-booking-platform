import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import adminService from '../../services/adminService';
import { LoadingSpinner, EmptyState } from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const AdminSalons = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');

  const fetchSalons = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getSalons({ page, limit: 15, search: search || undefined });
      setSalons(res.data.data.salons || []);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load salons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalons(); }, []);

  const handleToggleStatus = async (id) => {
    try {
      await adminService.toggleSalonStatus(id);
      toast.success('Salon status updated');
      fetchSalons(pagination.page);
    } catch (error) {
      toast.error('Failed to update salon status');
    }
  };

  return (
    <>
      <Helmet><title>Salons - Admin Dashboard</title></Helmet>
      <h4 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>Salons</h4>

      <div className="mb-4" style={{ maxWidth: 300 }}>
        <input
          type="text"
          className="input-velora"
          placeholder="Search salons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchSalons(1)}
        />
      </div>

      {loading ? <LoadingSpinner /> : salons.length === 0 ? (
        <EmptyState icon="bi-shop" title="No salons found" />
      ) : (
        <>
          <div className="card-velora">
            <div className="table-responsive">
              <table className="table table-velora mb-0">
                <thead>
                  <tr>
                    <th>Salon</th>
                    <th>Owner</th>
                    <th>City</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salons.map(salon => (
                    <tr key={salon._id}>
                      <td className="fw-medium">{salon.name}</td>
                      <td className="text-muted" style={{ fontSize: '0.9rem' }}>{salon.owner?.firstName} {salon.owner?.lastName}</td>
                      <td>{salon.city}</td>
                      <td>
                        <span className="rating-stars">
                          <i className="bi bi-star-fill"></i> {salon.rating?.toFixed(1)}
                        </span>
                        <span className="text-muted ms-1" style={{ fontSize: '0.8rem' }}>({salon.reviewCount})</span>
                      </td>
                      <td>
                        <span className={`badge-velora ${salon.isActive ? 'badge-velora-success' : 'badge-velora-danger'}`}>
                          {salon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm rounded-pill px-3 ${salon.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleToggleStatus(salon._id)}
                        >
                          {salon.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchSalons} />
        </>
      )}
    </>
  );
};

export default AdminSalons;
