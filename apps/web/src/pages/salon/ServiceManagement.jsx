import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import salonService from '../../services/salonService';
import serviceService from '../../services/serviceService';
import categoryService from '../../services/categoryService';
import useSalon from '../../hooks/useSalon';
import { formatCurrency } from '../../utils/helpers';
import { LoadingSpinner } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  price: z.number().min(1, 'Price must be greater than 0'),
  duration: z.number().min(15, 'Minimum duration is 15 minutes')
});

const ServiceManagement = () => {
  const { salon, loading: salonLoading } = useSalon();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(serviceSchema)
  });

  const fetchData = async () => {
    if (!salon?._id) return;
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        salonService.getSalonServices(salon._id, { limit: 100 }),
        categoryService.getCategories({ limit: 50 })
      ]);
      setServices(servicesRes.data.data.services || []);
      setCategories(categoriesRes.data.data.categories || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [salon?._id]);

  const openModal = (service = null) => {
    setEditingService(service);
    if (service) {
      reset({
        name: service.name,
        category: service.category?._id || '',
        description: service.description || '',
        price: service.price,
        duration: service.duration
      });
    } else {
      reset({ name: '', category: '', description: '', price: 0, duration: 60 });
    }
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editingService) {
        await serviceService.updateService(editingService._id, data);
        toast.success('Service updated successfully');
      } else {
        await serviceService.createService(salon._id, data);
        toast.success('Service created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this service?')) return;
    try {
      await serviceService.deleteService(id);
      toast.success('Service deactivated');
      fetchData();
    } catch (error) {
      toast.error('Failed to deactivate service');
    }
  };

  if (loading || salonLoading) return <LoadingSpinner text="Loading services..." />;

  return (
    <>
      <Helmet><title>Services - Salon Dashboard</title></Helmet>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0" style={{ fontFamily: 'var(--font-display)' }}>Services</h4>
        <button className="btn-velora btn-velora-sm" onClick={() => openModal()}>
          <i className="bi bi-plus-lg"></i> Add Service
        </button>
      </div>

      <div className="card-velora">
        {services.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-list-check fs-1 text-muted d-block mb-2"></i>
            <p className="text-muted">No services yet. Create your first service.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-velora mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service._id}>
                    <td>
                      <div className="fw-medium">{service.name}</div>
                      {service.description && <div className="text-muted" style={{ fontSize: '0.8rem' }}>{service.description.substring(0, 60)}</div>}
                    </td>
                    <td>{service.category?.name || 'N/A'}</td>
                    <td>{service.duration} min</td>
                    <td className="fw-semibold">{formatCurrency(service.price)}</td>
                    <td>
                      <span className={`badge-velora ${service.isActive ? 'badge-velora-success' : 'badge-velora-danger'}`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => openModal(service)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleDelete(service._id)}>
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="bg-white rounded-4 p-4 w-100" style={{ maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0" style={{ fontFamily: 'var(--font-display)' }}>
                {editingService ? 'Edit Service' : 'Add Service'}
              </h5>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label-velora">Name *</label>
                <input className={`input-velora ${errors.name ? 'border-danger' : ''}`} {...register('name')} placeholder="Service name" />
                {errors.name && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errors.name.message}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label-velora">Category *</label>
                <select className={`input-velora ${errors.category ? 'border-danger' : ''}`} {...register('category')}>
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
                {errors.category && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errors.category.message}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label-velora">Description</label>
                <textarea className="input-velora" rows={2} {...register('description')} placeholder="Brief description"></textarea>
              </div>
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <label className="form-label-velora">Price ($) *</label>
                  <input type="number" step="0.01" className={`input-velora ${errors.price ? 'border-danger' : ''}`} {...register('price', { valueAsNumber: true })} />
                  {errors.price && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errors.price.message}</div>}
                </div>
                <div className="col-6">
                  <label className="form-label-velora">Duration (min) *</label>
                  <input type="number" className={`input-velora ${errors.duration ? 'border-danger' : ''}`} {...register('duration', { valueAsNumber: true })} />
                  {errors.duration && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errors.duration.message}</div>}
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn-velora-outline flex-grow-1" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-velora flex-grow-1 justify-content-center" disabled={saving}>
                  {saving ? 'Saving...' : editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceManagement;
