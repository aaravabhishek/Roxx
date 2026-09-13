import React from 'react';

export default function Loading({ label = 'Loading…' }) {
  return (
    <div className="state-box">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}
