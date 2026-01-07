import React, { useState, useRef, useCallback } from 'react';
import './PullToRefresh.css';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ 
    onRefresh, 
    children,
    disabled = false 
}) => {
    const [pullDistance, setPullDistance] = useState(0);
    const [status, setStatus] = useState<'idle' | 'pulling' | 'ready' | 'refreshing'>('idle');
    
    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isPulling = useRef(false);
    const isRefreshing = useRef(false);

    const PULL_THRESHOLD = 80;
    const MAX_PULL = 120;

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const container = containerRef.current;
        if (container && container.scrollTop === 0 && !isRefreshing.current && !disabled) {
            startY.current = e.touches[0].clientY;
            isPulling.current = true;
        }
    }, [disabled]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling.current || isRefreshing.current) return;

        const container = containerRef.current;
        const currentY = e.touches[0].clientY;
        const distance = currentY - startY.current;

        if (distance > 0 && container && container.scrollTop === 0) {
            const adjustedDistance = Math.min(distance * 0.5, MAX_PULL);
            setPullDistance(adjustedDistance);

            if (adjustedDistance >= PULL_THRESHOLD) {
                setStatus('ready');
            } else {
                setStatus('pulling');
            }
        }
    }, []);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling.current || isRefreshing.current) return;

        isPulling.current = false;

        if (pullDistance >= PULL_THRESHOLD) {
            setStatus('refreshing');
            isRefreshing.current = true;
            setPullDistance(PULL_THRESHOLD);

            try {
                await onRefresh();
            } catch (error) {
                console.error('Erro ao atualizar:', error);
            }

            // Animação de conclusão
            setTimeout(() => {
                isRefreshing.current = false;
                setStatus('idle');
                setPullDistance(0);
            }, 500);
        } else {
            setStatus('idle');
            setPullDistance(0);
        }
    }, [pullDistance, onRefresh]);

    const getRotation = () => {
        if (status === 'refreshing') return 0;
        return Math.min((pullDistance / PULL_THRESHOLD) * 180, 180);
    };

    const getProgress = () => {
        return Math.min((pullDistance / PULL_THRESHOLD) * 100, 100);
    };

    return (
        <div 
            ref={containerRef} 
            className="pull-to-refresh"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull Indicator */}
            {status !== 'idle' && (
                <div 
                    className="pull-to-refresh__indicator"
                    style={{ 
                        transform: `translateY(${Math.min(pullDistance - 60, 0)}px)`,
                        opacity: Math.min(pullDistance / PULL_THRESHOLD, 1)
                    }}
                >
                    <div className="pull-to-refresh__spinner-container">
                        {/* Outer Ring */}
                        <div className={`pull-to-refresh__ring ${status === 'refreshing' ? 'pull-to-refresh__ring--spinning' : ''}`}>
                            <svg width="48" height="48" viewBox="0 0 48 48">
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(getProgress() / 100) * 125} 125`}
                                    transform="rotate(-90 24 24)"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#059669" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        {/* Icon */}
                        <div 
                            className="pull-to-refresh__icon"
                            style={{ 
                                transform: status === 'refreshing' ? 'rotate(0deg)' : `rotate(${getRotation()}deg)`
                            }}
                        >
                            <span className="material-symbols-outlined">
                                {status === 'refreshing' ? 'sync' : 'refresh'}
                            </span>
                        </div>
                    </div>

                    {/* Text */}
                    <div className="pull-to-refresh__text-container">
                        <span className="pull-to-refresh__text">
                            {status === 'pulling' && 'Puxe para atualizar'}
                            {status === 'ready' && 'Solte para atualizar'}
                            {status === 'refreshing' && 'Atualizando...'}
                        </span>
                    </div>
                </div>
            )}

            {/* Content */}
            <div 
                className="pull-to-refresh__content"
                style={{ 
                    transform: `translateY(${pullDistance}px)`,
                    transition: isPulling.current ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {children}
            </div>
        </div>
    );
};
