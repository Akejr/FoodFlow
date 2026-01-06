import React, { useState, useRef, useEffect } from 'react';
import './Select.css';

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
    label?: string;
    className?: string;
}

export const Select: React.FC<SelectProps> = ({
    value,
    onChange,
    options,
    placeholder,
    label,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`select-custom-wrapper ${className}`}>
            {label && <label className="select-custom-label">{label}</label>}

            <div
                ref={selectRef}
                className={`select-custom ${isOpen ? 'select-custom--open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="select-custom__display">
                    <span className={selectedOption ? '' : 'select-custom__placeholder'}>
                        {selectedOption ? selectedOption.label : placeholder || 'Selecione...'}
                    </span>
                    <span className={`material-symbols-outlined select-custom__arrow ${isOpen ? 'select-custom__arrow--rotated' : ''}`}>
                        expand_more
                    </span>
                </div>

                {isOpen && (
                    <div className="select-custom__dropdown">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={`select-custom__option ${value === option.value ? 'select-custom__option--selected' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(option.value);
                                }}
                            >
                                {option.label}
                                {value === option.value && (
                                    <span className="material-symbols-outlined select-custom__check">check</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
