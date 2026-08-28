import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import adminService from '../../services/adminService';
import categoryService from '../../services/categoryService';
import { formatCurrency } from '../../utils/helpers';
import { LoadingSpinner, EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional()
});

const AdminCatalog = () => {
  const [tab, setTab] = useState('services');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema)
  });

  const fetchServices = async () => {
    try {
      const res = await adminService.getServices({ limit: 100 });
      setServices(res.data.data.services || []);
    } catch (error) {
      toast.error('Failed to load services');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await adminService.getCategories({ limit: 100 });
      setCategories(res.data.data.categories || []);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([fetchServices(), fetchCategories()]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openCategoryModal = (category = null) => {
    setEditingCategory(category);
    reset({ name: category?.name || '', description: category?.description || '' });
    setShowCategoryModal(true);
  };

  const onSubmitCategory = async (data) => {
    setSaving(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, data);
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory(data);
        toast.success('Category created successfully');
      }
      setShowCategoryModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleService = async (id) => {
    try {
      await adminService.toggleServiceStatus(id);
      toast.success('Service status updated');
      fetchServices();
    } catch (error) {
      toast.error('Failed to update service status');
    }
  };

  const handleToggleCategory = async (id) => {
    try {
      await categoryService.toggleCategoryStatus(id);
      toast.success('Category status updated');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update category status');
    }
  };

  if (loading) return <LoadingSpinner text="Loading catalog..." />;

  return (
    <>
      <Helmet><title>Services &amp; Categories - Admin</title></Helmet>

      <h4 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>Services &amp; Categories</h4>

      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={`btn btn-sm rounded-pill px-4 ${tab === 'services' ? 'btn-velora' : 'btn-velora-outline'}`}
            onClick={() => setTab('services')}
          >
            Services ({services.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`btn btn-sm rounded-pill px-4 ${tab === 'categories' ? 'btn-velora' : 'btn-velora-outline'}`}
            onClick={() => setTab('categories')}
          >
            Categories ({categories.length})
          </button>
        </li>
      </ul>

      {/* Services Tab */}
      {tab === 'services' && (
        <div className="card-velora">
          {services.length === 0 ? (
            <EmptyState icon="bi-list-check" title="No services found" message="Platform services will appear here." />
          ) : (
            <div className="table-responsive">
              <table className="table table-velora mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Salon</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service._id}>
                      <td className="fw-medium">
                        {service.name}
                        {service.description && (
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>{service.description.substring(0, 50)}</div>
                        )}
                      </td>
                      <td>{service.category?.name || 'N/A'}</td>
                      <td>
                        <div>{service.salon?.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{service.salon?.city}</div>
                      </td>
                      <td className="fw-semibold">{formatCurrency(service.price)}</td>
                      <td>{service.duration} min</td>
                      <td>
                        <span className={`badge-velora ${service.isActive ? 'badge-velora-success' : 'badge-velora-danger'}`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => handleToggleService(service._id)}>
                          {service.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {tab === 'categories' && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn-velora btn-velora-sm" onClick={() => openCategoryModal()}>
              <i className="bi bi-plus-lg"></i> Add Category
            </button>
          </div>
          <div className="card-velora">
            {categories.length === 0 ? (
              <EmptyState icon="bi-tags" title="No categories found" message="Create your first service category." />
            ) : (
              <div className="table-responsive">
                <table className="table table-velora mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Slug</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat._id}>
                        <td className="fw-medium">{cat.name}</td>
                        <td className="text-muted">{cat.slug}</td>
                        <td className="text-muted">{cat.description || '—'}</td>
                        <td>
                          <span className={`badge-velora ${cat.isActive ? 'badge-velora-success' : 'badge-velora-danger'}`}>
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => openCategoryModal(cat)}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleToggleCategory(cat._id)}>
                              {cat.isActive ? 'Deactivate' : 'Activate'}
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
        </>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="bg-white rounded-4 p-4 w-100" style={{ maxWidth: 480 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0" style={{ fontFamily: 'var(--font-display)' }}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h5>
              <button className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
            </div>
            <form onSubmit={handleSubmit(onSubmitCategory)}>
              <div className="mb-3">
                <label className="form-label-velora">Name *</label>
                <input className={`input-velora ${errors.name ? 'border-danger' : ''}`} {...register('name')} placeholder="e.g. Hair Care" />
                {errors.name && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errors.name.message}</div>}
              </div>
              <div className="mb-4">
                <label className="form-label-velora">Description</label>
                <textarea className="input-velora" rows={2} {...register('description')} placeholder="Optional description"></textarea>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn-velora-outline flex-grow-1" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                <button type="submit" className="btn-velora flex-grow-1 justify-content-center" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCatalog;