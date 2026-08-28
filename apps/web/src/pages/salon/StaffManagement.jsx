import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import staffService from '../../services/staffService';
import serviceService from '../../services/serviceService';
import useSalon from '../../hooks/useSalon';
import { DAYS_OF_WEEK, DAY_LABELS } from '../../constants';
import { LoadingSpinner } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const staffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.number().min(0).default(0),
  services: z.array(z.string()).optional(),
  workingHours: z.array(z.object({
    day: z.string(),
    enabled: z.boolean(),
    start: z.string(),
    end: z.string()
  })).optional()
});

const StaffManagement = () => {
  const { salon, loading: salonLoading } = useSalon();
  const [staffList, setStaffList] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(staffSchema)
  });

  const selectedServices = watch('services') || [];
  const workingHours = watch('workingHours') || [];

  const defaultWorkingHours = () => DAYS_OF_WEEK.map(day => ({
    day,
    enabled: true,
    start: '09:00',
    end: '18:00'
  }));

  const toggleWorkDay = (day) => {
    const next = workingHours.map(h => h.day === day ? { ...h, enabled: !h.enabled } : h);
    setValue('workingHours', next, { shouldValidate: true });
  };

  const updateWorkHours = (day, field, value) => {
    const next = workingHours.map(h => h.day === day ? { ...h, [field]: value } : h);
    setValue('workingHours', next, { shouldValidate: true });
  };

  const fetchData = async () => {
    if (!salon?._id) return;
    try {
      const [staffRes, servicesRes] = await Promise.all([
        staffService.getStaffBySalon(salon._id, { limit: 50 }),
        serviceService.getServices({ limit: 100, salon: salon._id })
      ]);
      setStaffList(staffRes.data.data.staff || []);
      setAllServices(servicesRes.data.data.services || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [salon?._id]);

  const openModal = (staff = null) => {
    setEditingStaff(staff);
    if (staff) {
      const hours = staff.workingHours && staff.workingHours.length > 0
        ? staff.workingHours.map(h => ({ day: h.day, enabled: h.enabled, start: h.start, end: h.end }))
        : defaultWorkingHours();
      reset({
        name: staff.name,
        bio: staff.bio || '',
        specialization: staff.specialization || '',
        experience: staff.experience || 0,
        services: staff.services?.map(s => s._id || s) || [],
        workingHours: hours
      });
    } else {
      reset({ name: '', bio: '', specialization: '', experience: 0, services: [], workingHours: defaultWorkingHours() });
    }
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editingStaff) {
        await staffService.updateStaff(editingStaff._id, data);
        toast.success('Staff updated successfully');
      } else {
        await staffService.createStaff(salon._id, data);
        toast.success('Staff added successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save staff');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this staff member?')) return;
    try {
      await staffService.deleteStaff(id);
      toast.success('Staff member deactivated');
      fetchData();
    } catch (error) {
      toast.error('Failed to deactivate staff');
    }
  };

  if (loading || salonLoading) return <LoadingSpinner text="Loading staff..." />;

  return (
    <>
      <Helmet><title>Staff - Salon Dashboard</title></Helmet>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0" style={{ fontFamily: 'var(--font-display)' }}>Staff Members</h4>
        <button className="btn-velora btn-velora-sm" onClick={() => openModal()}>
          <i className="bi bi-plus-lg"></i> Add Staff
        </button>
      </div>

      <div className="row g-3">
        {staffList.length === 0 ? (
          <div className="col-12">
            <div className="card-velora text-center py-5">
              <i className="bi bi-people fs-1 text-muted d-block mb-2"></i>
              <p className="text-muted">No staff members yet. Add your first team member.</p>
            </div>
          </div>
        ) : (
          staffList.map(member => (
            <div key={member._id} className="col-md-6 col-xl-4">
              <div className="card-velora h-100">
                <div className="card-velora-body p-4">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                        style={{
                          width: 56, height: 56,
                          background: 'linear-gradient(135deg, var(--velora-primary), var(--velora-secondary))',
                          fontSize: '1.1rem', fontWeight: 700
                        }}
                      >
                        {member.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <h6 className="mb-0">{member.name}</h6>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{member.specialization || 'Staff'}</div>
                      </div>
                    </div>
                    <span className={`badge-velora ${member.isAvailable ? 'badge-velora-success' : 'badge-velora-danger'}`}>
                      {member.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {member.bio && (
                    <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>{member.bio}</p>
                  )}

                  <div className="d-flex gap-3 mb-3" style={{ fontSize: '0.85rem' }}>
                    <span className="text-muted"><i className="bi bi-briefcase me-1"></i>{member.experience} yrs</span>
                    <span className="text-muted"><i className="bi bi-list-check me-1"></i>{member.services?.length || 0} services</span>
                  </div>

                  {member.services && member.services.length > 0 && (
                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {member.services.slice(0, 3).map(svc => (
                        <span key={svc._id || svc} className="badge-velora badge-velora-primary" style={{ fontSize: '0.75rem' }}>
                          {typeof svc === 'object' ? svc.name : allServices.find(s => s._id === svc)?.name || 'Service'}
                        </span>
                      ))}
                      {member.services.length > 3 && (
                        <span className="badge-velora" style={{ fontSize: '0.75rem' }}>+{member.services.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="d-flex gap-2 pt-3 border-top">
                    <button className="btn btn-sm btn-outline-primary rounded-pill flex-grow-1" onClick={() => openModal(member)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDelete(member._id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="bg-white rounded-4 p-4 w-100" style={{ maxWidth: 550, maxHeight: '90vh', overflow: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0" style={{ fontFamily: 'var(--font-display)' }}>
                {editingStaff ? 'Edit Staff' : 'Add Staff'}
              </h5>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label-velora">Name *</label>
                <input className={`input-velora ${errors.name ? 'border-danger' : ''}`} {...register('name')} placeholder="Full name" />
                {errors.name && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errors.name.message}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label-velora">Specialization</label>
                <input className="input-velora" {...register('specialization')} placeholder="e.g. Hair Color Specialist" />
              </div>
              <div className="mb-3">
                <label className="form-label-velora">Bio</label>
                <textarea className="input-velora" rows={2} {...register('bio')} placeholder="Brief bio..."></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label-velora">Experience (years)</label>
                <input type="number" className="input-velora" {...register('experience', { valueAsNumber: true })} />
              </div>
              <div className="mb-3">
                <label className="form-label-velora">Working Hours</label>
                <div className="p-3 rounded-3 border d-flex flex-column gap-2" style={{ maxHeight: 260, overflow: 'auto' }}>
                  {DAYS_OF_WEEK.map(day => {
                    const hours = workingHours.find(h => h.day === day) || { enabled: true, start: '09:00', end: '18:00' };
                    return (
                      <div key={day} className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={hours.enabled}
                          onChange={() => toggleWorkDay(day)}
                        />
                        <span style={{ width: 95, fontSize: '0.85rem' }}>{DAY_LABELS[day]}</span>
                        {hours.enabled ? (
                          <>
                            <input
                              type="time"
                              className="input-velora"
                              style={{ width: 110 }}
                              value={hours.start}
                              onChange={(e) => updateWorkHours(day, 'start', e.target.value)}
                            />
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>to</span>
                            <input
                              type="time"
                              className="input-velora"
                              style={{ width: 110 }}
                              value={hours.end}
                              onChange={(e) => updateWorkHours(day, 'end', e.target.value)}
                            />
                          </>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Day off</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label-velora">Services</label>
                <div className="p-3 rounded-3 border" style={{ maxHeight: 200, overflow: 'auto' }}>
                  {allServices.map(svc => (
                    <label key={svc._id} className="d-flex align-items-center gap-2 py-1" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        value={svc._id}
                        className="form-check-input"
                        {...register('services')}
                        checked={selectedServices.includes(svc._id)}
                      />
                      <span style={{ fontSize: '0.9rem' }}>{svc.name} ({svc.duration}min - ${svc.price})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn-velora-outline flex-grow-1" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-velora flex-grow-1 justify-content-center" disabled={saving}>
                  {saving ? 'Saving...' : editingStaff ? 'Update' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffManagement;
