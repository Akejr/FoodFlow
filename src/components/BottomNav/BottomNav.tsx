import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

interface BottomNavProps {
    showFab?: boolean;
    onFabClick?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ showFab = true, onFabClick }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const handleFabClick = () => {
        if (onFabClick) {
            onFabClick();
        } else {
            navigate('/add-meal');
        }
    };

    return (
        <nav className="bottom-nav">
            <button
                className={`bottom-nav__item ${isActive('/dashboard') ? 'bottom-nav__item--active' : ''}`}
                onClick={() => navigate('/dashboard')}
            >
                <span className="material-symbols-outlined">dashboard</span>
                <span>Início</span>
            </button>

            <button
                className={`bottom-nav__item ${isActive('/diary') ? 'bottom-nav__item--active' : ''}`}
                onClick={() => navigate('/diary')}
            >
                <span className="material-symbols-outlined">restaurant_menu</span>
                <span>Diário</span>
            </button>

            {/* FAB Central */}
            {showFab && (
                <button className="bottom-nav__fab" onClick={handleFabClick}>
                    <span className="material-symbols-outlined">add</span>
                </button>
            )}

            <button
                className={`bottom-nav__item ${isActive('/tips') ? 'bottom-nav__item--active' : ''}`}
                onClick={() => navigate('/tips')}
            >
                <span className="material-symbols-outlined">insights</span>
                <span>Dicas IA</span>
            </button>

            <button
                className={`bottom-nav__item ${isActive('/profile') ? 'bottom-nav__item--active' : ''}`}
                onClick={() => navigate('/profile')}
            >
                <span className="material-symbols-outlined">person</span>
                <span>Perfil</span>
            </button>
        </nav>
    );
};
