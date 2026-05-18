import { useMemo, useState } from 'react';

function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  error,
  hint,
  name,
  onBlur,
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const id = useMemo(
    () => name || label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    [label, name]
  );

  return (
    <div className="auth-field">
      <div className="auth-field-head">
        <label htmlFor={id}>{label}</label>
        {hint ? <span className="auth-field-hint">{hint}</span> : null}
      </div>

      <div className={`form-input-wrap ${error ? 'error' : ''}`}>
        {icon ? <span className="form-input-icon">{icon}</span> : null}
        <input
          id={id}
          name={name || id}
          type={inputType}
          className={`form-input ${error ? 'error' : ''} ${icon ? 'with-icon' : ''} ${isPassword ? 'with-toggle' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
        />
        {isPassword ? (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🔒' : '👁'}
          </button>
        ) : null}
      </div>

      {error ? <span className="form-input-error">{error}</span> : null}
    </div>
  );
}

export default FormInput;
