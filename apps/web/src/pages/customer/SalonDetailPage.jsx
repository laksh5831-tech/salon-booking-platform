import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import salonService from '../../services/salonService';
import serviceService from '../../services/serviceService';
import staffService from '../../services/staffService';
import reviewService from '../../services/reviewService';
import { LoadingSpinner, ErrorState } from '../../components/common/EmptyState';
import StarRating from '../../components/common/StarRating';
import { formatCurrency, formatTime, staffAvatarUrl } from '../../utils/helpers';
import { PLACEHOLDER_IMAGES, DAY_LABELS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SalonDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const salonRes = await salonService.getSalonBySlug(slug);
        const salonData = salonRes.data.data;
        setSalon(salonData);

        const [servicesRes, staffRes, reviewsRes] = await Promise.allSettled([
          serviceService.getServices({ salon: salonData._id, limit: 20 }),
          staffService.getStaffBySalon(salonData._id, { limit: 20 }),
          reviewService.getSalonReviews(salonData._id, { limit: 10 })
        ]);

        setServices(servicesRes.status === 'fulfilled' ? servicesRes.value.data.data.services || [] : []);
        setStaffList(staffRes.status === 'fulfilled' ? staffRes.value.data.data.staff || [] : []);
        setReviews(reviewsRes.status === 'fulfilled' ? reviewsRes.value.data.data.reviews || [] : []);
      } catch (err) {
        console.error('Failed to load salon details:', err?.response?.data || err?.message || err);
        setError(err?.response?.data?.message || 'Failed to load salon details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleBookService = (serviceId) => {
    const target = `/salons/${slug}/book?service=${serviceId}`;
    if (!isAuthenticated && !authLoading) {
      navigate('/login', { state: { from: target } });
      return;
    }
    if (user?.role && user.role !== 'customer') {
      toast.info('Please sign in as a customer to book an appointment.');
      navigate('/login', { state: { from: target } });
      return;
    }
    navigate(target);
  };

  if (loading) return <LoadingSpinner text="Loading salon details..." />;
  if (error) return <div className="container py-5"><ErrorState message={error} /></div>;
  if (!salon) return null;

  return (
    <>
      <Helmet>
        <title>{salon.name} - Velora</title>
        <meta name="description" content={`${salon.description || `Book appointments at ${salon.name} in ${salon.city}.`} Book online with Velora.`} />
      </Helmet>

      {/* Cover Image */}
      <div style={{ height: 300, overflow: 'hidden', position: 'relative' }}>
        <img
          src={salon.coverImage || PLACEHOLDER_IMAGES.salon}
          alt={salon.name}
          className="w-100 h-100"
          style={{ objectFit: 'cover' }}
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGES.salon; }}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(transparent, var(--velora-bg))' }}></div>
      </div>

      <div className="container" style={{ marginTop: -60, position: 'relative', zIndex: 2 }}>
        <div className="row g-4">
          <div className="col-lg-8">
            {/* Salon Info Card */}
            <div className="card-velora mb-4">
              <div className="card-velora-body p-4">
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div
                    className="rounded-3 overflow-hidden flex-shrink-0"
                    style={{ width: 72, height: 72, border: '3px solid white', boxShadow: 'var(--velora-shadow)' }}
                  >
                    <img
                      src={salon.logo || PLACEHOLDER_IMAGES.avatar}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGES.avatar; }}
                    />
                  </div>
                  <div>
                    <h2 className="mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>{salon.name}</h2>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <div className="d-flex align-items-center gap-1">
                        <StarRating rating={salon.rating} readonly size={0.9} />
                        <span className="fw-semibold">{salon.rating?.toFixed(1)}</span>
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>({salon.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-muted mb-3" style={{ lineHeight: 1.7 }}>{salon.description}</p>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
                      <i className="bi bi-geo-alt" style={{ color: 'var(--velora-primary)' }}></i>
                      {salon.address}, {salon.city}, {salon.state}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
                      <i className="bi bi-telephone" style={{ color: 'var(--velora-primary)' }}></i>
                      {salon.phone}
                    </div>
                  </div>
                  {salon.email && (
                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
                        <i className="bi bi-envelope" style={{ color: 'var(--velora-primary)' }}></i>
                        {salon.email}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="card-velora mb-4">
              <div className="d-flex border-bottom">
                {['services', 'staff', 'reviews', 'hours'].map(tab => (
                  <button
                    key={tab}
                    className={`flex-fill py-3 border-0 bg-transparent fw-medium text-capitalize ${
                      activeTab === tab ? 'border-bottom' : 'text-muted'
                    }`}
                    style={{
                      borderBottomWidth: 3,
                      borderBottomStyle: 'solid',
                      borderBottomColor: activeTab === tab ? 'var(--velora-primary)' : 'transparent',
                      color: activeTab === tab ? 'var(--velora-primary)' : 'var(--velora-muted)',
                      fontSize: '0.9rem'
                    }}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'hours' ? 'Opening Hours' : tab}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {activeTab === 'services' && (
                  <div>
                    {services.length === 0 ? (
                      <p className="text-muted text-center py-4">No services available yet.</p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {services.map(service => (
                          <div
                            key={service._id}
                            className="d-flex justify-content-between align-items-center p-3 rounded-3"
                            style={{ border: '1px solid var(--velora-border)' }}
                          >
                            <div>
                              <h6 className="mb-1">{service.name}</h6>
                              <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{service.description}</p>
                              <div className="d-flex gap-3 mt-1" style={{ fontSize: '0.8rem' }}>
                                <span className="text-muted"><i className="bi bi-clock me-1"></i>{service.duration} min</span>
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="fw-bold mb-2" style={{ color: 'var(--velora-primary)' }}>
                                {formatCurrency(service.price)}
                              </div>
                              <button
                                className="btn-velora btn-velora-sm"
                                onClick={() => handleBookService(service._id)}
                              >
                                Book
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'staff' && (
                  <div className="row g-3">
                    {staffList.length === 0 ? (
                      <p className="text-muted text-center py-4">No staff available.</p>
                    ) : (
                      staffList.map(member => (
                        <div key={member._id} className="col-md-6">
                          <div className="p-3 rounded-3" style={{ border: '1px solid var(--velora-border)' }}>
                            <div className="d-flex align-items-center gap-3 mb-2">
                              <div
                                className="rounded-circle overflow-hidden flex-shrink-0"
                                style={{
                                  width: 50, height: 50,
                                  background: 'linear-gradient(135deg, var(--velora-primary), var(--velora-secondary))'
                                }}
                              >
                                <img
                                  src={member.profileImage || staffAvatarUrl(member.name)}
                                  alt={member.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => { e.target.src = staffAvatarUrl(member.name); }}
                                />
                              </div>
                              <div>
                                <div className="fw-semibold">{member.name}</div>
                                <div className="text-muted" style={{ fontSize: '0.8rem' }}>{member.specialization}</div>
                              </div>
                            </div>
                            {member.bio && (
                              <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{member.bio}</p>
                            )}
                            <div className="mt-2" style={{ fontSize: '0.8rem' }}>
                              <span className="text-muted">{member.experience} years experience</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    {reviews.length === 0 ? (
                      <p className="text-muted text-center py-4">No reviews yet.</p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {reviews.map(review => (
                          <div key={review._id} className="p-3 rounded-3" style={{ border: '1px solid var(--velora-border)' }}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                  style={{
                                    width: 36, height: 36,
                                    background: 'linear-gradient(135deg, var(--velora-primary), var(--velora-secondary))',
                                    fontSize: '0.8rem', fontWeight: 700
                                  }}
                                >
                                  {review.customer?.firstName?.[0]}{review.customer?.lastName?.[0]}
                                </div>
                                <div>
                                  <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                                    {review.customer?.firstName} {review.customer?.lastName}
                                  </div>
                                  <StarRating rating={review.rating} readonly size={0.75} />
                                </div>
                              </div>
                              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'hours' && (
                  <div>
                    {salon.openingHours?.length === 0 ? (
                      <p className="text-muted text-center py-4">Opening hours not available.</p>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {salon.openingHours?.map(hours => (
                          <div
                            key={hours.day}
                            className="d-flex justify-content-between align-items-center py-2 px-3 rounded-3"
                            style={{ background: hours.enabled ? 'transparent' : 'var(--velora-bg)' }}
                          >
                            <span className={`fw-medium ${!hours.enabled ? 'text-muted' : ''}`}>
                              {DAY_LABELS[hours.day]}
                            </span>
                            <span className={`${hours.enabled ? '' : 'text-muted'}`} style={{ fontSize: '0.9rem' }}>
                              {hours.enabled
                                ? `${formatTime(hours.open)} - ${formatTime(hours.close)}${hours.hasBreak ? ` (Break: ${formatTime(hours.breakStart)} - ${formatTime(hours.breakEnd)})` : ''}`
                                : 'Closed'
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card-velora mb-4" style={{ position: 'sticky', top: 100 }}>
              <div className="card-velora-body p-4 text-center">
                <h5 className="mb-2" style={{ fontFamily: 'var(--font-display)' }}>Ready to Book?</h5>
                <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                  Select a service to check availability and book your appointment.
                </p>
                {services.length > 0 && (
                  <button
                    className="btn-velora w-100 justify-content-center"
                    onClick={() => handleBookService(services[0]._id)}
                  >
                    <i className="bi bi-calendar-plus"></i> Book Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalonDetailPage;
