import { Link } from 'react-router-dom';
import { PLACEHOLDER_IMAGES } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

const SalonCard = ({ salon }) => {
  const coverImage = salon.coverImage || PLACEHOLDER_IMAGES.salon;
  const logo = salon.logo || PLACEHOLDER_IMAGES.avatar;
  const minPrice = salon._minPrice || salon.minPrice || 35;

  return (
    <div className="card-velora h-100">
      <div className="position-relative">
        <img
          src={coverImage}
          alt={salon.name}
          className="w-100"
          style={{ height: 200, objectFit: 'cover' }}
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGES.salon; }}
        />
        <div
          className="position-absolute d-flex align-items-center justify-content-center rounded-circle"
          style={{
            bottom: -20,
            left: 20,
            width: 50,
            height: 50,
            background: 'white',
            border: '3px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}
        >
          <img
            src={logo}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = PLACEHOLDER_IMAGES.avatar; }}
          />
        </div>
      </div>

      <div className="card-velora-body pt-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 className="mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
              <Link
                to={`/salons/${salon.slug}`}
                className="text-decoration-none"
                style={{ color: 'var(--velora-dark)' }}
              >
                {salon.name}
              </Link>
            </h5>
            <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-geo-alt"></i>
              {salon.city}, {salon.state || salon.country}
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={`bi ${star <= Math.round(salon.rating) ? 'bi-star-fill' : 'bi-star'}`}
              ></i>
            ))}
          </span>
          <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>{salon.rating?.toFixed(1)}</span>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>({salon.reviewCount || 0} reviews)</span>
        </div>

        {salon.categories && salon.categories.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-3">
            {salon.categories.slice(0, 3).map((cat, idx) => (
              <span key={idx} className="badge-velora badge-velora-primary">
                {typeof cat === 'object' ? cat.name : cat}
              </span>
            ))}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
          <div>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Starting from</span>
            <div className="fw-bold" style={{ color: 'var(--velora-primary)', fontSize: '1.1rem' }}>
              {formatCurrency(minPrice)}
            </div>
          </div>
          <Link
            to={`/salons/${salon.slug}`}
            className="btn-velora btn-velora-sm"
          >
            View & Book
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SalonCard;
