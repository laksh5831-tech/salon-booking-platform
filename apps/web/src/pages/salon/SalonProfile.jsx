import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import salonService from '../../services/salonService';
import useSalon from '../../hooks/useSalon';
import { LoadingSpinner } from '../../components/common/EmptyState';
import { DAYS_OF_WEEK, DAY_LABELS } from '../../constants';
import toast from 'react-hot-toast';

const salonProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal(''))
});

const SalonProfile = () => {
  const { salon: mySalon, loading: salonLoading } = useSalon();
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openingHours, setOpeningHours] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(salonProfileSchema)
  });

  useEffect(() => {
    if (!mySalon?._id) return;
    const fetchSalon = async () => {
      try {
        const profileRes = await salonService.getSalonById(mySalon._id);
        setSalon(profileRes.data.data);
        setOpeningHours(profileRes.data.data.openingHours || []);
        reset({
          name: profileRes.data.data.name,
          description: profileRes.data.data.description || '',
          address: profileRes.data.data.address,
          city: profileRes.data.data.city,
          state: profileRes.data.data.state || '',
          phone: profileRes.data.data.phone,
          email: profileRes.data.data.email || '',
          website: profileRes.data.data.website || ''
        });
      } catch (error) {
        toast.error('Failed to load salon profile');
      } finally {
        setLoading(false);
      }
    };
    fetchSalon();
  }, [mySalon?._id, reset]);

  const onSubmit = async (data) => {
    if (!salon) return;
    setSaving(true);
    try {
      await salonService.updateSalon(salon._id, { ...data, openingHours });
      toast.success('Salon profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setOpeningHours(prev => {
      const existing = prev.find(h => h.day === day);
      if (existing) {
        return prev.map(h => h.day === day ? { ...h, enabled: !h.enabled } : h);
      }
      return [...prev, { day, enabled: true, open: '09:00', close: '18:00', hasBreak: false, breakStart: '13:00', breakEnd: '14:00' }];
    });
  };

  const updateHours = (day, field, value) => {
    setOpeningHours(prev => prev.map(h => h.day === day ? { ...h, [field]: value } : h));
  };

  if (loading || salonLoading) return <LoadingSpinner text="Loading salon profile..." />;

  return (
    <>
      <Helmet><title>Salon Profile - Dashboard</title></Helmet>
      <h4 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>Salon Profile</h4>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card-velora mb-4">
          <div className="card-velora-body p-4">
            <h6 className="mb-3">Basic Information</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label-velora">Salon Name *</label>
                <input className={`input-velora ${errors.name ? 'border-danger' : ''}`} {...register('name')} />
                {errors.name && <div className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.name.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label-velora">Phone *</label>
                <input className={`input-velora ${errors.phone ? 'border-danger' : ''}`} {...register('phone')} />
                {errors.phone && <div className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.phone.message}</div>}
              </div>
              <div className="col-12">
                <label className="form-label-velora">Description</label>
                <textarea className="input-velora" rows={3} {...register('description')}></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label-velora">Email</label>
                <input className="input-velora" {...register('email')} />
              </div>
              <div className="col-md-6">
                <label className="form-label-velora">Website</label>
                <input className="input-velora" {...register('website')} placeholder="https://" />
              </div>
              <div className="col-md-8">
                <label className="form-label-velora">Address *</label>
                <input className={`input-velora ${errors.address ? 'border-danger' : ''}`} {...register('address')} />
                {errors.address && <div className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.address.message}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label-velora">City *</label>
                <input className={`input-velora ${errors.city ? 'border-danger' : ''}`} {...register('city')} />
                {errors.city && <div className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.city.message}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label-velora">State</label>
                <input className="input-velora" {...register('state')} />
              </div>
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="card-velora mb-4">
          <div className="card-velora-body p-4">
            <h6 className="mb-3">Opening Hours</h6>
            <div className="d-flex flex-column gap-2">
              {DAYS_OF_WEEK.map(day => {
                const hours = openingHours.find(h => h.day === day) || { enabled: false, open: '09:00', close: '18:00' };
                return (
                  <div
                    key={day}
                    className="d-flex align-items-center gap-3 p-2 rounded-3"
                    style={{ background: hours.enabled ? 'transparent' : 'var(--velora-bg)' }}
                  >
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={hours.enabled}
                        onChange={() => toggleDay(day)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                    <span className="fw-medium" style={{ width: 100, fontSize: '0.9rem' }}>{DAY_LABELS[day]}</span>
                    {hours.enabled ? (
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="time"
                          className="input-velora"
                          style={{ width: 130 }}
                          value={hours.open}
                          onChange={(e) => updateHours(day, 'open', e.target.value)}
                        />
                        <span className="text-muted">to</span>
                        <input
                          type="time"
                          className="input-velora"
                          style={{ width: 130 }}
                          value={hours.close}
                          onChange={(e) => updateHours(day, 'close', e.target.value)}
                        />
                      </div>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.9rem' }}>Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button type="submit" className="btn-velora" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </>
  );
};

export default SalonProfile;
