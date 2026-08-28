import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import adminService from '../../services/adminService';
import { LoadingSpinner, EmptyState } from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ page, limit: 15, search: search || undefined, role: roleFilter || undefined });
      setUsers(res.data.data.users || []);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleToggleStatus = async (id) => {
    try {
      await adminService.toggleUserStatus(id);
      toast.success('User status updated');
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const roleColors = {
    customer: 'primary',
    salon_owner: 'secondary',
    salon_manager: 'warning',
    staff: 'success',
    admin: 'danger'
  };

  return (
    <>
      <Helmet><title>Users - Admin Dashboard</title></Helmet>
      <h4 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>Users</h4>

      <div className="d-flex gap-3 mb-4 flex-wrap">
        <div className="position-relative flex-grow-1" style={{ maxWidth: 300 }}>
          <i className="bi bi-search position-absolute" style={{ left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--velora-muted)' }}></i>
          <input
            type="text"
            className="input-velora ps-4"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
          />
        </div>
        <select className="input-velora" style={{ maxWidth: 180 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="salon_owner">Salon Owner</option>
          <option value="salon_manager">Salon Manager</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : users.length === 0 ? (
        <EmptyState icon="bi-people" title="No users found" message="No users match your criteria." />
      ) : (
        <>
          <div className="card-velora">
            <div className="table-responsive">
              <table className="table table-velora mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td className="fw-medium">{u.firstName} {u.lastName}</td>
                      <td className="text-muted" style={{ fontSize: '0.9rem' }}>{u.email}</td>
                      <td className="text-muted" style={{ fontSize: '0.9rem' }}>{u.phone || 'N/A'}</td>
                      <td>
                        <span className={`badge-velora badge-velora-${roleColors[u.role] || 'primary'}`}>
                          {u.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-velora ${u.isActive ? 'badge-velora-success' : 'badge-velora-danger'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm rounded-pill px-3 ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleToggleStatus(u._id)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchUsers} />
        </>
      )}
    </>
  );
};

export default AdminUsers;
