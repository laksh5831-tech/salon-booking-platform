import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile - Velora</title>
      </Helmet>

      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card-velora">
              <div className="card-velora-body p-4 text-center">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center text-white mb-3"
                  style={{
                    width: 80, height: 80,
                    background: 'linear-gradient(135deg, var(--velora-primary), var(--velora-secondary))',
                    fontSize: '1.5rem', fontWeight: 700
                  }}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <h5 style={{ fontFamily: 'var(--font-display)' }}>{user?.firstName} {user?.lastName}</h5>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{user?.email}</p>
                <span className="badge-velora badge-velora-primary text-capitalize">{user?.role?.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="card-velora mt-3">
              <div className="d-flex flex-column">
                {[
                  { key: 'profile', icon: 'bi-person', label: 'Profile Info' },
                  { key: 'security', icon: 'bi-shield-lock', label: 'Security' }
                ].map(item => (
                  <button
                    key={item.key}
                    className={`text-start px-4 py-3 border-0 bg-transparent d-flex align-items-center gap-2 ${
                      activeTab === item.key ? '' : 'text-muted'
                    }`}
                    style={{
                      color: activeTab === item.key ? 'var(--velora-primary)' : undefined,
                      background: activeTab === item.key ? 'rgba(124,58,237,0.05)' : undefined,
                      fontWeight: 500,
                      fontSize: '0.9rem'
                    }}
                    onClick={() => setActiveTab(item.key)}
                  >
                    <i className={`bi ${item.icon}`}></i> {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-8">
            {activeTab === 'profile' && (
              <div className="card-velora">
                <div className="card-velora-body p-4">
                  <h5 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>Profile Information</h5>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label-velora">First Name</label>
                      <input type="text" className="input-velora" value={user?.firstName || ''} readOnly />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label-velora">Last Name</label>
                      <input type="text" className="input-velora" value={user?.lastName || ''} readOnly />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label-velora">Email</label>
                      <input type="email" className="input-velora" value={user?.email || ''} readOnly />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label-velora">Phone</label>
                      <input type="tel" className="input-velora" value={user?.phone || 'Not provided'} readOnly />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label-velora">Role</label>
                      <input type="text" className="input-velora text-capitalize" value={user?.role?.replace('_', ' ') || ''} readOnly />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label-velora">Member Since</label>
                      <input type="text" className="input-velora" value={new Date(user?.createdAt).toLocaleDateString()} readOnly />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="card-velora">
                <div className="card-velora-body p-4">
                  <h5 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>Change Password</h5>
                  <form onSubmit={handlePasswordChange}>
                    <div className="mb-3">
                      <label className="form-label-velora">Current Password</label>
                      <input
                        type="password"
                        className="input-velora"
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label-velora">New Password</label>
                      <input
                        type="password"
                        className="input-velora"
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label-velora">Confirm New Password</label>
                      <input
                        type="password"
                        className="input-velora"
                        placeholder="Confirm new password"
                        value={passwordData.confirmNewPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                    <button type="submit" className="btn-velora" disabled={loading}>
                      {loading ? (
                        <div className="spinner-border spinner-border-sm" style={{ color: 'white' }}></div>
                      ) : (
                        <>Update Password</>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
