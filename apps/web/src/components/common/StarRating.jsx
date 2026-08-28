import { useState } from 'react';

const StarRating = ({ rating = 0, onRate, readonly = false, size = 1.1 }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="d-flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${readonly ? '' : 'cursor-pointer'}`}
          style={{ fontSize: `${size}rem`, color: star <= (hover || rating) ? 'var(--velora-warning)' : '#D1D5DB' }}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          <i className={`bi ${star <= (hover || rating) ? 'bi-star-fill' : 'bi-star'}`}></i>
        </span>
      ))}
    </div>
  );
};

export default StarRating;
