import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import appointmentService from '../../services/appointmentService';
import paymentService from '../../services/paymentService';
import StripeProvider from '../../components/common/StripeProvider';
import PaymentForm from '../../components/common/PaymentForm';
import DemoPaymentForm from '../../components/common/DemoPaymentForm';
import { LoadingSpinner } from '../../components/common/EmptyState';
import { formatDate, formatDateFull, formatTime, formatCurrency } from '../../utils/helpers';
import { CANCELLATION_REASONS } from '../../constants';
import toast from 'react-hot-toast';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [paySecret, setPaySecret] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  const loadAppointment = useCallback(async () => {
    try {
      const res = await appointmentService.getAppointmentById(id);
      setAppointment(res.data.data);
    } catch (error) {
      toast.error('Failed to load booking details');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);

  const handlePayOnline = async () => {
    setPayLoading(true);
    try {
      const res = await paymentService.createPaymentIntent(id);
      setPaySecret(res.data.data.clientSecret);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment setup failed. Please try again.');
    } finally {
      setPayLoading(false);
    }
  };

  const handlePaySuccess = () => {
    toast.success('Payment successful!');
    setPaySecret('');
    loadAppointment();
  };

  const handlePayError = () => {
    setPaySecret('');
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await appointmentService.cancelAppointment(id, { cancellationReason: cancelReason });
      toast.success('Booking cancelled successfully');
      setAppointment(prev => ({ ...prev, status: 'cancelled', cancellationReason: cancelReason }));
      setShowCancel(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading booking details..." />;
  if (!appointment) return null;

  return (
    <>
      <Helmet>
        <title>Booking #{appointment._id?.slice(-8)} - Velora</title>
      </Helmet>

      <div className="container py-5">
        <button className="btn-velora-outline btn-velora-sm mb-4" onClick={() => navigate('/bookings')}>
          <i className="bi bi-arrow-left"></i> Back to Bookings
        </button>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card-velora mb-4">
              <div className="card-velora-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h4 className="mb-1" style={{ fontFamily: 'var(--font-display)' }}>{appointment.service?.name}</h4>
                    <p className="text-muted mb-0">{appointment.salon?.name}</p>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-1">
                    <span className={`badge-velora ${appointment.paymentStatus === 'paid' ? 'badge-velora-success' : 'badge-velora-warning'}`}>
                      {appointment.paymentStatus === 'paid' ? (
                        <><i className="bi bi-check-circle me-1"></i>Paid</>
                      ) : (
                        <><i className="bi bi-clock-history me-1"></i>Pending</>
                      )}
                    </span>
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-sm-6">
                    <div className="p-3 rounded-3" style={{ background: 'var(--velora-bg)' }}>
                      <div className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>Date</div>
                      <div className="fw-semibold">{formatDateFull(appointment.date)}</div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 rounded-3" style={{ background: 'var(--velora-bg)' }}>
                      <div className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>Time</div>
                      <div className="fw-semibold">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 rounded-3" style={{ background: 'var(--velora-bg)' }}>
                      <div className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>Stylist</div>
                      <div className="fw-semibold">{appointment.staff?.name}</div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 rounded-3" style={{ background: 'var(--velora-bg)' }}>
                      <div className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>Price</div>
                      <div className="fw-bold" style={{ color: 'var(--velora-primary)', fontSize: '1.2rem' }}>
                        {formatCurrency(appointment.price)}
                      </div>
                    </div>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-3 p-3 rounded-3" style={{ background: 'var(--velora-bg)' }}>
                    <div className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>Notes</div>
                    <div>{appointment.notes}</div>
                  </div>
                )}

                {appointment.status === 'cancelled' && appointment.cancellationReason && (
                  <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(239,68,68,0.05)' }}>
                    <div className="text-danger mb-1" style={{ fontSize: '0.8rem' }}>Cancellation Reason</div>
                    <div>{appointment.cancellationReason}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {['pending', 'confirmed'].includes(appointment.status) && (
              <div className="card-velora">
                <div className="card-velora-body p-4">
                  <h6 className="mb-3">Actions</h6>
                  {!showCancel ? (
                    <button
                      className="btn-velora-danger btn-velora-sm"
                      onClick={() => setShowCancel(true)}
                    >
                      <i className="bi bi-x-circle"></i> Cancel Booking
                    </button>
                  ) : (
                    <div>
                      <label className="form-label-velora">Reason for cancellation</label>
                      <select
                        className="input-velora mb-2"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      >
                        <option value="">Select a reason...</option>
                        {CANCELLATION_REASONS.map(reason => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                      <div className="d-flex gap-2">
                        <button
                          className="btn-velora-danger btn-velora-sm"
                          onClick={handleCancel}
                          disabled={!cancelReason || cancelling}
                        >
                          {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                        </button>
                        <button
                          className="btn-velora-outline btn-velora-sm"
                          onClick={() => setShowCancel(false)}
                        >
                          Keep Booking
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="card-velora mt-4">
              <div className="card-velora-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Payment</h6>
                  {appointment.paymentStatus === 'paid' ? (
                    <span className="badge-velora badge-velora-success">
                      <i className="bi bi-check-circle me-1"></i>Paid
                    </span>
                  ) : (
                    <span className="badge-velora badge-velora-warning">
                      <i className="bi bi-clock-history me-1"></i>Pending
                    </span>
                  )}
                </div>

                {appointment.paymentStatus === 'paid' ? (
                  <div className="d-flex align-items-center gap-2 p-3 rounded-3" style={{ background: 'rgba(16,185,129,0.06)' }}>
                    <i className="bi bi-check-circle-fill" style={{ color: 'var(--velora-success)' }}></i>
                    <span style={{ fontSize: '0.9rem' }}>Payment received. Thank you!</span>
                  </div>
                ) : appointment.status === 'cancelled' ? (
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                    This booking was cancelled.
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded-3" style={{ background: 'var(--velora-bg)' }}>
                      <span className="text-muted" style={{ fontSize: '0.9rem' }}>Amount to Pay</span>
                      <span className="fw-bold" style={{ color: 'var(--velora-primary)', fontSize: '1.2rem' }}>
                        {formatCurrency(appointment.price)}
                      </span>
                    </div>

                    {paySecret ? (
                      paySecret.startsWith('pi_sandbox') ? (
                        <DemoPaymentForm
                          amount={appointment.price}
                          clientSecret={paySecret}
                          onSuccess={handlePaySuccess}
                          onError={handlePayError}
                        />
                      ) : (
                        <StripeProvider clientSecret={paySecret}>
                          <PaymentForm
                            amount={appointment.price}
                            onSuccess={handlePaySuccess}
                            onError={handlePayError}
                          />
                        </StripeProvider>
                      )
                    ) : (
                      <button
                        className="btn-velora w-100 justify-content-center"
                        onClick={handlePayOnline}
                        disabled={payLoading}
                        style={{ padding: '14px' }}
                      >
                        {payLoading ? (
                          <div className="d-flex align-items-center gap-2">
                            <div className="spinner-border spinner-border-sm" style={{ color: 'white' }}></div>
                            Preparing payment...
                          </div>
                        ) : (
                          <span>
                            <i className="bi bi-credit-card me-2"></i>
                            Pay Online Now
                          </span>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card-velora mb-4">
              <div className="card-velora-body p-4">
                <h6 className="mb-3">Salon Details</h6>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
                    <i className="bi bi-geo-alt" style={{ color: 'var(--velora-primary)' }}></i>
                    {appointment.salon?.address}
                  </div>
                  {appointment.salon?.phone && (
                    <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
                      <i className="bi bi-telephone" style={{ color: 'var(--velora-primary)' }}></i>
                      {appointment.salon?.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card-velora">
              <div className="card-velora-body p-4">
                <h6 className="mb-3">Booking ID</h6>
                <code className="text-muted" style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  {appointment._id}
                </code>
                <div className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>
                  Created: {new Date(appointment.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingDetailPage;
