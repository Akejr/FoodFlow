import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
    value: number;
    max: number;
    label?: string;
    sublabel?: string;
    showValues?: boolean;
    size?: 'sm' | 'md' | 'lg';
    exceeded?: boolean;
    icon?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max,
    label,
    sublabel,
    showValues = true,
    size = 'md',
    exceeded,
    icon
}) => {
    const percentage = Math.min((value / max) * 100, 100);
    const isExceeded = exceeded ?? value > max;
    const remaining = max - value;

    return (
        <div className={`progress-wrapper progress-wrapper--${size} ${isExceeded ? 'progress-wrapper--exceeded' : ''}`}>
            {(label || showValues) && (
                <div className="progress-header">
                    <div className="progress-label-group">
                        {icon && (
                            <div className={`progress-icon ${isExceeded ? 'progress-icon--exceeded' : ''}`}>
                                <span className="material-symbols-outlined">{icon}</span>
                            </div>
                        )}
                        <div className="progress-labels">
                            {label && <span className="progress-label">{label}</span>}
                            {sublabel && (
                                <span className={`progress-sublabel ${isExceeded ? 'progress-sublabel--exceeded' : ''}`}>
                                    {isExceeded ? 'Meta Excedida' : sublabel}
                                </span>
                            )}
                        </div>
                    </div>
                    {showValues && (
                        <div className="progress-values">
                            <span className={`progress-current ${isExceeded ? 'progress-current--exceeded' : ''}`}>
                                {value}g
                            </span>
                            <span className="progress-max">/ {max}g</span>
                        </div>
                    )}
                </div>
            )}
            <div className="progress-track">
                <div
                    className={`progress-fill ${isExceeded ? 'progress-fill--exceeded' : ''}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            {!isExceeded && remaining > 0 && sublabel && (
                <span className="progress-remaining">{remaining}g restantes</span>
            )}
        </div>
    );
};
