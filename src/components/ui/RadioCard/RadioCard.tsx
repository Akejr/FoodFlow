import React from 'react';
import './RadioCard.css';

interface RadioCardProps {
    name: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
    icon?: string;
    label: string;
    description?: string;
}

export const RadioCard: React.FC<RadioCardProps> = ({
    name,
    value,
    checked,
    onChange,
    icon,
    label,
    description
}) => {
    return (
        <label className={`radio-card ${checked ? 'radio-card--checked' : ''}`}>
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={() => onChange(value)}
                className="radio-card__input"
            />
            <div className="radio-card__content">
                {icon && (
                    <span className="material-symbols-outlined radio-card__icon">{icon}</span>
                )}
                <span className="radio-card__label">{label}</span>
                {description && (
                    <span className="radio-card__description">{description}</span>
                )}
            </div>
        </label>
    );
};

interface RadioCardGroupProps {
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{
        value: string;
        label: string;
        icon?: string;
        description?: string;
    }>;
    columns?: 2 | 3;
}

export const RadioCardGroup: React.FC<RadioCardGroupProps> = ({
    name,
    value,
    onChange,
    options,
    columns = 3
}) => {
    return (
        <div className={`radio-card-group radio-card-group--cols-${columns}`}>
            {options.map((option) => (
                <RadioCard
                    key={option.value}
                    name={name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={onChange}
                    icon={option.icon}
                    label={option.label}
                    description={option.description}
                />
            ))}
        </div>
    );
};
