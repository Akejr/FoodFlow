import React from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
    message?: string;
    subMessage?: string;
    showLogo?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message = 'Carregando...',
    subMessage,
    showLogo = true
}) => {
    return (
        <div className="loading-screen">
            {/* Background Effects */}
            <div className="loading-screen__bg-glow loading-screen__bg-glow--1"></div>
            <div className="loading-screen__bg-glow loading-screen__bg-glow--2"></div>

            <div className="loading-screen__content">
                {showLogo && (
                    <div className="loading-screen__logo">
                        <span className="loading-screen__logo-icon">🥗</span>
                        <span className="loading-screen__logo-text">FoodFlow</span>
                    </div>
                )}

                {/* Animated Spinner */}
                <div className="loading-screen__spinner">
                    <div className="loading-screen__spinner-ring"></div>
                    <div className="loading-screen__spinner-ring loading-screen__spinner-ring--2"></div>
                    <div className="loading-screen__spinner-dot"></div>
                </div>

                {/* Loading Message */}
                <div className="loading-screen__text">
                    <p className="loading-screen__message">{message}</p>
                    {subMessage && (
                        <p className="loading-screen__sub-message">{subMessage}</p>
                    )}
                </div>

                {/* Loading Progress Dots */}
                <div className="loading-screen__dots">
                    <span className="loading-screen__dot"></span>
                    <span className="loading-screen__dot"></span>
                    <span className="loading-screen__dot"></span>
                </div>
            </div>
        </div>
    );
};
