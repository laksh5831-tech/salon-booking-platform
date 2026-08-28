import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import reviewService from '../../services/reviewService';
import useSalon from '../../hooks/useSalon';
import StarRating from '../../components/common/StarRating';
import { LoadingSpinner, EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const SalonReviews = () => {
  const { salon, loading: salonLoading } = useSalon();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salon?._id) return;
    const fetchReviews = async () => {
      try {
        const res = await reviewService.getSalonReviews(salon._id, { limit: 50 });
        setReviews(res.data.data.reviews || []);
      } catch (error) {
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [salon?._id]);

  if (loading || salonLoading) return <LoadingSpinner text="Loading reviews..." />;

  return (
    <>
      <Helmet><title>Reviews - Salon Dashboard</title></Helmet>
      <h4 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>Reviews</h4>

      {reviews.length === 0 ? (
        <EmptyState icon="bi-star" title="No reviews yet" message="Reviews from customers will appear here." />
      ) : (
        <div className="d-flex flex-column gap-3">
          {reviews.map(review => (
            <div key={review._id} className="card-velora">
              <div className="card-velora-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white"
                      style={{ width: 42, height: 42, background: 'linear-gradient(135deg, var(--velora-primary), var(--velora-secondary))', fontSize: '0.85rem', fontWeight: 700 }}
                    >
                      {review.customer?.firstName?.[0]}{review.customer?.lastName?.[0]}
                    </div>
                    <div>
                      <div className="fw-semibold">{review.customer?.firstName} {review.customer?.lastName}</div>
                      <StarRating rating={review.rating} readonly size={0.8} />
                    </div>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mb-0 text-muted mt-2" style={{ fontSize: '0.9rem' }}>{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SalonReviews;
