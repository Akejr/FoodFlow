import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    icon?: string;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    icon,
    iconPosition = 'right',
    loading = false,
    disabled,
    className = '',
    ...props
}) => {
    const baseClass = 'button';
    const classes = [
        baseClass,
        `${baseClass}--${variant}`,
        `${baseClass}--${size}`,
        fullWidth ? `${baseClass}--full` : '',
        loading ? `${baseClass}--loading` : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className="button__spinner">
                    <span className="material-symbols-outlined spinning">progress_activity</span>
                </span>
            )}
            {!loading && icon && iconPosition === 'left' && (
                <span className="material-symbols-outlined button__icon">{icon}</span>
            )}
            <span className="button__text">{children}</span>
            {!loading && icon && iconPosition === 'right' && (
                <span className="material-symbols-outlined button__icon">{icon}</span>
            )}
        </button>
    );
};
