import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'salon_owner'])
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'customer' }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = data;
      await registerUser(submitData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account - Velora</title>
      </Helmet>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="text-center mb-4">
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--velora-dark)' }}>Join Velora</h2>
              <p className="text-muted">Create your account to get started</p>
            </div>
            <div className="card-velora">
              <div className="card-velora-body p-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-3">
                    <label className="form-label-velora">I want to</label>
                    <div className="d-flex gap-2">
                      {[
                        { value: 'customer', label: 'Book Appointments', icon: 'bi-calendar-check' },
                        { value: 'salon_owner', label: 'List My Salon', icon: 'bi-shop' }
                      ].map(opt => (
                        <label
                          key={opt.value}
                          className={`flex-fill text-center p-3 rounded-3 border-2 cursor-pointer ${
                            selectedRole === opt.value ? 'border-primary bg-primary bg-opacity-10' : ''
                          }`}
                          style={{
                            borderColor: selectedRole === opt.value ? 'var(--velora-primary)' : 'var(--velora-border)',
                            cursor: 'pointer'
                          }}
                        >
                          <input type="radio" value={opt.value} className="d-none" {...register('role')} />
                          <i className={`bi ${opt.icon} d-block mb-1 fs-5`} style={{
                            color: selectedRole === opt.value ? 'var(--velora-primary)' : 'var(--velora-muted)'
                          }}></i>
                          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label-velora">First Name</label>
                      <input
                        type="text"
                        className={`input-velora ${errors.firstName ? 'border-danger' : ''}`}
                        placeholder="First name"
                        {...register('firstName')}
                      />
                      {errors.firstName && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errors.firstName.message}</div>}
                    </div>
                    <div className="col-6">
                      <label className="form-label-velora">Last Name</label>
                      <input
                        type="text"
                        className={`input-velora ${errors.lastName ? 'border-danger' : ''}`}
                        placeholder="Last name"
                        {...register('lastName')}
                      />
                      {errors.lastName && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errors.lastName.message}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label-velora">Email</label>
                    <input
                      type="email"
                      className={`input-velora ${errors.email ? 'border-danger' : ''}`}
                      placeholder="Enter your email"
                      {...register('email')}
                    />
                    {errors.email && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errors.email.message}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label-velora">Phone (optional)</label>
                    <input
                      type="tel"
                      className="input-velora"
                      placeholder="+1 (555) 000-0000"
                      {...register('phone')}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label-velora">Password</label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`input-velora pe-5 ${errors.password ? 'border-danger' : ''}`}
                        placeholder="At least 6 characters"
                        {...register('password')}
                      />
                      <button
                        type="button"
                        className="position-absolute top-50 end-0 translate-middle-y me-3 border-0 bg-transparent"
                        style={{ color: 'var(--velora-muted)' }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    {errors.password && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errors.password.message}</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label-velora">Confirm Password</label>
                    <input
                      type="password"
                      className={`input-velora ${errors.confirmPassword ? 'border-danger' : ''}`}
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errors.confirmPassword.message}</div>}
                  </div>

                  <button
                    type="submit"
                    className="btn-velora w-100 justify-content-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="spinner-border spinner-border-sm" style={{ color: 'white' }}>
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <>Create Account <i className="bi bi-arrow-right"></i></>
                    )}
                  </button>
                </form>

                <div className="text-center mt-4 pt-3 border-top">
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" className="fw-semibold">Sign In</Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
