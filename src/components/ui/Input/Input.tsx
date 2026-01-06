import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    iconLeft?: string;
    iconRight?: string;
    suffix?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    hint,
    iconLeft,
    iconRight,
    suffix,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`input-wrapper ${className}`}>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                </label>
            )}
            <div className={`input-container ${error ? 'input-container--error' : ''}`}>
                {iconLeft && (
                    <span className="material-symbols-outlined input-icon input-icon--left">
                        {iconLeft}
                    </span>
                )}
                <input
                    id={inputId}
                    className={`input ${iconLeft ? 'input--with-icon-left' : ''} ${iconRight || suffix ? 'input--with-icon-right' : ''}`}
                    {...props}
                />
                {suffix && (
                    <span className="input-suffix">{suffix}</span>
                )}
                {iconRight && !suffix && (
                    <span className="material-symbols-outlined input-icon input-icon--right">
                        {iconRight}
                    </span>
                )}
            </div>
            {hint && !error && (
                <span className="input-hint">{hint}</span>
            )}
            {error && (
                <span className="input-error">{error}</span>
            )}
        </div>
    );
};
