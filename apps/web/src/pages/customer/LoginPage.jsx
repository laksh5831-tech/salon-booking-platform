import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required')
});

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate(redirectTo);
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In - Velora</title>
      </Helmet>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="text-center mb-4">
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--velora-dark)' }}>Welcome Back</h2>
              <p className="text-muted">Sign in to continue to Velora</p>
            </div>
            <div className="card-velora">
              <div className="card-velora-body p-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-3">
                    <label className="form-label-velora">Email</label>
                    <input
                      type="email"
                      className={`input-velora ${errors.email ? 'border-danger' : ''}`}
                      placeholder="Enter your email"
                      {...register('email')}
                    />
                    {errors.email && (
                      <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errors.email.message}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label-velora">Password</label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`input-velora pe-5 ${errors.password ? 'border-danger' : ''}`}
                        placeholder="Enter your password"
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
                    {errors.password && (
                      <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{errors.password.message}</div>
                    )}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <label className="d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                      <input type="checkbox" className="form-check-input" style={{ width: 18, height: 18 }} />
                      Remember me
                    </label>
                    <Link to="/forgot-password" style={{ fontSize: '0.9rem' }}>Forgot Password?</Link>
                  </div>
                  {errorMsg && (
                    <div className="alert alert-danger py-2 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                      <i className="bi bi-exclamation-circle"></i>
                      <span>{errorMsg}</span>
                    </div>
                  )}
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
                      <>Sign In <i className="bi bi-arrow-right"></i></>
                    )}
                  </button>
                </form>

                <div className="text-center mt-4 pt-3 border-top">
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Don't have an account?{' '}
                    <Link to="/register" className="fw-semibold">Sign Up</Link>
                  </span>
                </div>

                <div className="mt-3 p-3 rounded-3" style={{ background: 'var(--velora-bg)', fontSize: '0.8rem' }}>
                  <div className="fw-semibold mb-2">Demo Credentials:</div>
                  <div className="text-muted">
                    <div>Customer: <strong>customer@velora.demo</strong> / <strong>Password123!</strong></div>
                    <div>Owner: <strong>owner@velora.demo</strong> / <strong>Password123!</strong></div>
                    <div>Admin: <strong>admin@velora.demo</strong> / <strong>Password123!</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
