import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import dayjs from 'dayjs';
import salonService from '../../services/salonService';
import serviceService from '../../services/serviceService';
import staffService from '../../services/staffService';
import availabilityService from '../../services/availabilityService';
import appointmentService from '../../services/appointmentService';
import paymentService from '../../services/paymentService';
import StripeProvider from '../../components/common/StripeProvider';
import PaymentForm from '../../components/common/PaymentForm';
import DemoPaymentForm from '../../components/common/DemoPaymentForm';
import { LoadingSpinner } from '../../components/common/EmptyState';
import { formatCurrency, formatTime, staffAvatarUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const BookingPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salonRes = await salonService.getSalonBySlug(slug);
        const salonData = salonRes.data.data;
        setSalon(salonData);

        const [servicesRes, staffRes] = await Promise.all([
          serviceService.getServices({ salon: salonData._id, limit: 50 }),
          staffService.getStaffBySalon(salonData._id, { limit: 50, available: 'true' })
        ]);

        setServices(servicesRes.data.data.services || []);
        setStaffList(staffRes.data.data.staff || []);

        const preselectedServiceId = searchParams.get('service');
        if (preselectedServiceId) {
          const svc = (servicesRes.data.data.services || []).find(s => s._id === preselectedServiceId);
          if (svc) {
            setSelectedService(svc);
            setStep(2);
          }
        }
      } catch (error) {
        toast.error('Failed to load booking data');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, searchParams, navigate]);

  const fetchAvailability = useCallback(async () => {
    if (!selectedService || !selectedDate) return;
    setAvailabilityLoading(true);
    try {
      const res = await availabilityService.getSalonAvailability(salon._id, {
        serviceId: selectedService._id,
        staffId: selectedStaff?._id || undefined,
        date: dayjs(selectedDate).format('YYYY-MM-DD')
      });
      setAvailability(res.data.data.availableSlots || []);
    } catch (error) {
      toast.error('Failed to check availability');
      setAvailability([]);
    } finally {
      setAvailabilityLoading(false);
    }
  }, [salon, selectedService, selectedDate, selectedStaff]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const date = dayjs().add(i, 'day');
      if (date.day() !== 0) {
        dates.push(date);
      }
    }
    return dates;
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      const res = await appointmentService.createAppointment({
        salon: salon._id,
        service: selectedService._id,
        ...(selectedStaff ? { staff: selectedStaff._id } : {}),
        date: dayjs(selectedDate).format('YYYY-MM-DD'),
        startTime: selectedTime.startTime,
        notes: notes || undefined
      });

      const appointment = res.data.data;
      setCreatedAppointment(appointment);

      if (paymentMethod === 'card') {
        try {
          const payRes = await paymentService.createPaymentIntent(appointment._id);
          setClientSecret(payRes.data.data.clientSecret);
          setStep(6);
        } catch {
          toast.success('Appointment booked! You can pay later.');
          navigate('/bookings');
        }
      } else {
        toast.success('Appointment booked! Pay at the salon.');
        navigate('/bookings');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment confirmed!');
    navigate('/bookings');
  };

  const steps = [
    { num: 1, label: 'Service' },
    { num: 2, label: 'Stylist' },
    { num: 3, label: 'Date' },
    { num: 4, label: 'Time' },
    { num: 5, label: 'Confirm' },
    { num: 6, label: 'Payment' }
  ];

  if (loading) return <LoadingSpinner text="Preparing your booking..." />;

  return (
    <>
      <Helmet>
        <title>Book Appointment - {salon?.name} - Velora</title>
      </Helmet>

      <div className="container py-5">
        <h3 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Book at {salon?.name}
        </h3>

        {/* Progress Steps */}
        <div className="d-flex gap-2 mb-5 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {steps.map(s => (
            <div
              key={s.num}
              className={`booking-step flex-shrink-0 ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
            >
              <span className="booking-step-number">
                {step > s.num ? <i className="bi bi-check"></i> : s.num}
              </span>
              <span className="d-none d-sm-inline">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="row">
          <div className="col-lg-8">
            {/* Step 1: Select Service */}
            {step === 1 && (
              <div className="fade-in">
                <h5 className="mb-3">Select a Service</h5>
                <div className="d-flex flex-column gap-2">
                  {services.map(service => (
                    <div
                      key={service._id}
                      className={`p-3 rounded-3 cursor-pointer d-flex justify-content-between align-items-center ${
                        selectedService?._id === service._id ? 'border-primary' : ''
                      }`}
                      style={{
                        border: `2px solid ${selectedService?._id === service._id ? 'var(--velora-primary)' : 'var(--velora-border)'}`,
                        cursor: 'pointer',
                        background: selectedService?._id === service._id ? 'rgba(124,58,237,0.04)' : 'white'
                      }}
                      onClick={() => { setSelectedService(service); setStep(2); }}
                    >
                      <div>
                        <div className="fw-semibold">{service.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>{service.description}</div>
                        <div className="d-flex gap-3 mt-1" style={{ fontSize: '0.8rem' }}>
                          <span><i className="bi bi-clock me-1"></i>{service.duration} min</span>
                          <span className="fw-semibold" style={{ color: 'var(--velora-primary)' }}>{formatCurrency(service.price)}</span>
                        </div>
                      </div>
                      {selectedService?._id === service._id && (
                        <i className="bi bi-check-circle-fill fs-4" style={{ color: 'var(--velora-primary)' }}></i>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Stylist */}
            {step === 2 && (
              <div className="fade-in">
                <h5 className="mb-3">Choose Your Stylist</h5>
                <div
                  className="p-3 rounded-3 mb-2 d-flex align-items-center gap-3"
                  style={{
                    border: `2px solid ${!selectedStaff ? 'var(--velora-primary)' : 'var(--velora-border)'}`,
                    cursor: 'pointer',
                    background: !selectedStaff ? 'rgba(124,58,237,0.04)' : 'white'
                  }}
                  onClick={() => { setSelectedStaff(null); setStep(3); }}
                >
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                    width: 50, height: 50, background: 'rgba(124,58,237,0.1)', color: 'var(--velora-primary)'
                  }}>
                    <i className="bi bi-shuffle fs-5"></i>
                  </div>
                  <div>
                    <div className="fw-semibold">Any Available Stylist</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>We'll match you with an available professional</div>
                  </div>
                </div>
                <div className="d-flex flex-column gap-2 mt-3">
                  {staffList.map(member => (
                    <div
                      key={member._id}
                      className="p-3 rounded-3 d-flex align-items-center gap-3"
                      style={{
                        border: `2px solid ${selectedStaff?._id === member._id ? 'var(--velora-primary)' : 'var(--velora-border)'}`,
                        cursor: 'pointer',
                        background: selectedStaff?._id === member._id ? 'rgba(124,58,237,0.04)' : 'white'
                      }}
                      onClick={() => { setSelectedStaff(member); setStep(3); }}
                    >
                      <div className="rounded-circle overflow-hidden" style={{ width: 50, height: 50, background: 'linear-gradient(135deg, var(--velora-primary), var(--velora-secondary))' }}>
                        <img src={member.profileImage || staffAvatarUrl(member.name)} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = staffAvatarUrl(member.name); }} />
                      </div>
                      <div>
                        <div className="fw-semibold">{member.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>{member.specialization} · {member.experience} yrs exp</div>
                      </div>
                      {selectedStaff?._id === member._id && (
                        <i className="bi bi-check-circle-fill ms-auto fs-4" style={{ color: 'var(--velora-primary)' }}></i>
                      )}
                    </div>
                  ))}
                </div>
                <button className="btn-velora-outline btn-velora-sm mt-3" onClick={() => setStep(1)}>
                  <i className="bi bi-arrow-left"></i> Back
                </button>
              </div>
            )}

            {/* Step 3: Select Date */}
            {step === 3 && (
              <div className="fade-in">
                <h5 className="mb-3">Select a Date</h5>
                <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {generateDates().map((date, idx) => (
                    <button
                      key={idx}
                      className="flex-shrink-0 p-3 rounded-3 text-center border-0"
                      style={{
                        minWidth: 80,
                        background: selectedDate && dayjs(selectedDate).isSame(date, 'day')
                          ? 'var(--velora-primary)' : 'white',
                        color: selectedDate && dayjs(selectedDate).isSame(date, 'day') ? 'white' : 'var(--velora-text)',
                        border: `2px solid ${selectedDate && dayjs(selectedDate).isSame(date, 'day') ? 'var(--velora-primary)' : 'var(--velora-border)'}`,
                        cursor: 'pointer'
                      }}
                      onClick={() => { setSelectedDate(date); setSelectedTime(null); setStep(4); }}
                    >
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>{date.format('ddd')}</div>
                      <div className="fw-bold" style={{ fontSize: '1.3rem' }}>{date.format('D')}</div>
                      <div style={{ fontSize: '0.7rem' }}>{date.format('MMM')}</div>
                    </button>
                  ))}
                </div>
                <button className="btn-velora-outline btn-velora-sm mt-3" onClick={() => setStep(2)}>
                  <i className="bi bi-arrow-left"></i> Back
                </button>
              </div>
            )}

            {/* Step 4: Select Time */}
            {step === 4 && (
              <div className="fade-in">
                <h5 className="mb-3">Select a Time Slot</h5>
                {availabilityLoading ? (
                  <LoadingSpinner text="Checking availability..." />
                ) : availability.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-calendar-x fs-1 text-muted d-block mb-2"></i>
                    <p className="text-muted">No available time slots for this date. Please try another date.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {availability.map((slot, idx) => (
                      <button
                        key={idx}
                        className={`time-slot ${selectedTime?.startTime === slot.startTime ? 'selected' : ''}`}
                        onClick={() => { setSelectedTime(slot); setStep(5); }}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                )}
                <button className="btn-velora-outline btn-velora-sm mt-3" onClick={() => setStep(3)}>
                  <i className="bi bi-arrow-left"></i> Back
                </button>
              </div>
            )}

            {/* Step 5: Confirm */}
            {step === 5 && (
              <div className="fade-in">
                <h5 className="mb-3">Review & Confirm</h5>
                <div className="card-velora mb-3">
                  <div className="card-velora-body">
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Service</span>
                        <span className="fw-semibold">{selectedService?.name}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Stylist</span>
                        <span className="fw-semibold">{selectedStaff?.name || 'Any Available'}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Date</span>
                        <span className="fw-semibold">{dayjs(selectedDate).format('MMMM D, YYYY')}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Time</span>
                        <span className="fw-semibold">{formatTime(selectedTime?.startTime)}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Duration</span>
                        <span className="fw-semibold">{selectedService?.duration} min</span>
                      </div>
                      <hr className="my-0" />
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Total</span>
                        <span className="fw-bold" style={{ color: 'var(--velora-primary)', fontSize: '1.2rem' }}>
                          {formatCurrency(selectedService?.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label-velora">Notes (optional)</label>
                  <textarea
                    className="input-velora"
                    rows={3}
                    placeholder="Any special requests or notes for your appointment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label-velora fw-semibold">Payment Method</label>
                  <div className="d-flex gap-2">
                    {[
                      { value: 'card', label: 'Pay Now', icon: 'bi-credit-card', desc: 'Card via Stripe' },
                      { value: 'cash', label: 'Pay at Salon', icon: 'bi-cash', desc: 'Cash on arrival' }
                    ].map(opt => (
                      <label
                        key={opt.value}
                        className="flex-fill p-3 rounded-3 d-flex align-items-center gap-3"
                        style={{
                          border: `2px solid ${paymentMethod === opt.value ? 'var(--velora-primary)' : 'var(--velora-border)'}`,
                          background: paymentMethod === opt.value ? 'rgba(124,58,237,0.04)' : 'white',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="radio"
                          value={opt.value}
                          className="d-none"
                          checked={paymentMethod === opt.value}
                          onChange={() => setPaymentMethod(opt.value)}
                        />
                        <i className={`bi ${opt.icon} fs-5`} style={{
                          color: paymentMethod === opt.value ? 'var(--velora-primary)' : 'var(--velora-muted)'
                        }}></i>
                        <div>
                          <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{opt.label}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <button className="btn-velora-outline" onClick={() => setStep(4)}>
                    <i className="bi bi-arrow-left"></i> Back
                  </button>
                  <button
                    className="btn-velora flex-grow-1 justify-content-center"
                    onClick={handleConfirmBooking}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="spinner-border spinner-border-sm" style={{ color: 'white' }}></div>
                    ) : (
                      <><i className="bi bi-check-circle"></i> Confirm Booking</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Payment */}
            {step === 6 && (
              <div className="fade-in">
                <h5 className="mb-3">Complete Payment</h5>
                <div className="card-velora mb-3">
                  <div className="card-velora-body">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-check-circle-fill" style={{ color: 'var(--velora-success)' }}></i>
                      <span className="fw-semibold">Appointment Confirmed</span>
                    </div>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                      {selectedService?.name} with {selectedStaff?.name || 'Any Available'} on {dayjs(selectedDate).format('MMM D, YYYY')} at {formatTime(selectedTime?.startTime)}
                    </p>
                  </div>
                </div>

                <div className="card-velora">
                  <div className="card-velora-body">
                    {clientSecret ? (
                      clientSecret.startsWith('pi_sandbox') ? (
                        <DemoPaymentForm
                          amount={selectedService?.price}
                          clientSecret={clientSecret}
                          onSuccess={handlePaymentSuccess}
                          onError={() => {
                            toast.error('Payment failed. You can pay later from your bookings.');
                            navigate('/bookings');
                          }}
                        />
                      ) : (
                        <StripeProvider clientSecret={clientSecret}>
                          <PaymentForm
                            amount={selectedService?.price}
                            onSuccess={handlePaymentSuccess}
                            onError={() => {
                              toast.error('Payment failed. You can pay later from your bookings.');
                              navigate('/bookings');
                            }}
                          />
                        </StripeProvider>
                      )
                    ) : (
                      <LoadingSpinner text="Preparing payment..." />
                    )}
                  </div>
                </div>

                <button
                  className="btn-velora-outline btn-velora-sm mt-3"
                  onClick={() => {
                    setStep(5);
                    setCreatedAppointment(null);
                    setClientSecret('');
                  }}
                >
                  <i className="bi bi-arrow-left"></i> Back to Review
                </button>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="col-lg-4">
            <div className="card-velora" style={{ position: 'sticky', top: 100 }}>
              <div className="card-velora-body">
                <h6 className="mb-3" style={{ fontFamily: 'var(--font-display)' }}>Booking Summary</h6>
                {selectedService && (
                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}>
                    <span className="text-muted">Service</span>
                    <span className="fw-medium">{selectedService.name}</span>
                  </div>
                )}
                {selectedStaff && (
                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}>
                    <span className="text-muted">Stylist</span>
                    <span className="fw-medium">{selectedStaff.name}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}>
                    <span className="text-muted">Date</span>
                    <span className="fw-medium">{dayjs(selectedDate).format('MMM D, YYYY')}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}>
                    <span className="text-muted">Time</span>
                    <span className="fw-medium">{formatTime(selectedTime.startTime)}</span>
                  </div>
                )}
                {selectedService && (
                  <>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold">Total</span>
                      <span className="fw-bold" style={{ color: 'var(--velora-primary)' }}>
                        {formatCurrency(selectedService.price)}
                      </span>
                    </div>
                  </>
                )}
                {!selectedService && (
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Select a service to see pricing</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingPage;
