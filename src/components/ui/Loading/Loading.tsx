import React from 'react';
import './Loading.css';

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
    message = 'Carregando...',
    fullScreen = false
}) => {
    return (
        <div className={`loading-container ${fullScreen ? 'loading-container--fullscreen' : ''}`}>
            <div className="loading-spinner">
                <div className="loading-spinner__ring"></div>
                <div className="loading-spinner__ring"></div>
                <div className="loading-spinner__ring"></div>
                <div className="loading-spinner__icon">
                    <span className="material-symbols-outlined">restaurant</span>
                </div>
            </div>
            <p className="loading-message">{message}</p>
        </div>
    );
};
