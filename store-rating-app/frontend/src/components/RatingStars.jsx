import React from 'react';

export default function RatingStars({ value = 0, onChange, readonly = false, size }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`rating-stars ${readonly ? 'readonly' : ''}`} style={size ? { fontSize: size } : undefined}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={star <= Math.round(value) ? 'filled' : ''}
          onClick={() => !readonly && onChange && onChange(star)}
          disabled={readonly}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
