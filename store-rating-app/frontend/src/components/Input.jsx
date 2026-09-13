import React from 'react';

export default function Input({ label, error, hint, as = 'input', children, ...rest }) {
  const inputClass = `input ${error ? 'input-error' : ''}`;

  return (
    <div className="field">
      {label && <label>{label}</label>}
      {as === 'select' ? (
        <select className={inputClass} {...rest}>
          {children}
        </select>
      ) : as === 'textarea' ? (
        <textarea className={inputClass} {...rest} />
      ) : (
        <input className={inputClass} {...rest} />
      )}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
