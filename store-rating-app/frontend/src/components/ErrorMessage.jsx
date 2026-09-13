import React from 'react';

export function ErrorMessage({ message }) {
  if (!message) return null;
  return <div className="alert alert-error">{message}</div>;
}

export function SuccessMessage({ message }) {
  if (!message) return null;
  return <div className="alert alert-success">{message}</div>;
}

export function EmptyState({ title = 'Nothing here yet.', subtitle }) {
  return (
    <div className="state-box">
      <div className="state-title">{title}</div>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
