import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import adminService from '../../services/adminService';
import StarRating from '../../components/common/StarRating';
import { LoadingSpinner, EmptyState } from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getReviews({ page, limit: 15 });
      setReviews(res.data.data.reviews || []);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleModerate = async (id, isApproved) => {
    try {
      await adminService.moderateReview(id, { isApproved });
      toast.success(isApproved ? 'Review approved' : 'Review hidden');
      fetchReviews(pagination.page);
    } catch (error) {
      toast.error('Failed to moderate review');
    }
  };

  return (
    <>
      <Helmet><title>Reviews - Admin Dashboard</title></Helmet>
      <h4 className="mb-4" style={{ fontFamily: 'var(--font-display)' }}>Reviews</h4>

      {loading ? <LoadingSpinner /> : reviews.length === 0 ? (
        <EmptyState icon="bi-star" title="No reviews" />
      ) : (
        <>
          <div className="d-flex flex-column gap-3">
            {reviews.map(review => (
              <div key={review._id} className="card-velora">
                <div className="card-velora-body p-4">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="fw-semibold">{review.customer?.firstName} {review.customer?.lastName}</div>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>reviewed</span>
                        <div className="fw-semibold">{review.salon?.name}</div>
                      </div>
                      <StarRating rating={review.rating} readonly size={0.85} />
                      <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.9rem' }}>{review.comment}</p>
                    </div>
                    <div className="d-flex flex-column gap-2 align-items-end">
                      <span className={`badge-velora ${review.isApproved ? 'badge-velora-success' : 'badge-velora-warning'}`}>
                        {review.isApproved ? 'Approved' : 'Hidden'}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      <div className="d-flex gap-1">
                        {!review.isApproved && (
                          <button className="btn btn-sm btn-outline-success rounded-pill px-3" onClick={() => handleModerate(review._id, true)}>
                            Approve
                          </button>
                        )}
                        {review.isApproved && (
                          <button className="btn btn-sm btn-outline-warning rounded-pill px-3" onClick={() => handleModerate(review._id, false)}>
                            Hide
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchReviews} />
        </>
      )}
    </>
  );
};

export default AdminReviews;
