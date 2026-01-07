import React from 'react';
import './DashboardSkeleton.css';

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="dashboard-skeleton">
            {/* Header Skeleton */}
            <header className="dashboard-skeleton__header">
                <div className="dashboard-skeleton__greeting">
                    <div className="skeleton skeleton--text" style={{ width: '120px', marginBottom: '8px' }}></div>
                    <div className="skeleton skeleton--title" style={{ width: '180px' }}></div>
                </div>
                <div className="skeleton skeleton--circle" style={{ width: '48px', height: '48px' }}></div>
            </header>

            {/* Calories Card Skeleton */}
            <section className="dashboard-skeleton__calories">
                <div className="dashboard-skeleton__calories-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="skeleton skeleton--circle" style={{ width: '40px', height: '40px' }}></div>
                        <div>
                            <div className="skeleton skeleton--text" style={{ width: '80px', marginBottom: '6px' }}></div>
                            <div className="skeleton skeleton--text" style={{ width: '60px', height: '12px' }}></div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className="skeleton skeleton--title" style={{ width: '100px', marginBottom: '6px' }}></div>
                        <div className="skeleton skeleton--text" style={{ width: '80px', height: '12px' }}></div>
                    </div>
                </div>
                <div className="skeleton" style={{ width: '100%', height: '12px', borderRadius: '6px', marginTop: '16px' }}></div>
                <div className="dashboard-skeleton__meals">
                    <div className="skeleton skeleton--text" style={{ width: '40px' }}></div>
                    <div className="skeleton skeleton--text" style={{ width: '50px' }}></div>
                    <div className="skeleton skeleton--text" style={{ width: '45px' }}></div>
                </div>
            </section>

            {/* Macros Section Skeleton */}
            <section className="dashboard-skeleton__macros">
                <div className="dashboard-skeleton__macros-header">
                    <div className="skeleton skeleton--title" style={{ width: '80px' }}></div>
                    <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '12px' }}></div>
                </div>

                {[1, 2, 3].map((i) => (
                    <div key={i} className="dashboard-skeleton__macro-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div className="skeleton skeleton--circle" style={{ width: '36px', height: '36px' }}></div>
                            <div style={{ flex: 1 }}>
                                <div className="skeleton skeleton--text" style={{ width: '100px', marginBottom: '4px' }}></div>
                                <div className="skeleton skeleton--text" style={{ width: '80px', height: '12px' }}></div>
                            </div>
                            <div className="skeleton skeleton--text" style={{ width: '50px' }}></div>
                        </div>
                        <div className="skeleton" style={{ width: '100%', height: '8px', borderRadius: '4px' }}></div>
                    </div>
                ))}
            </section>

            {/* Nav Skeleton */}
            <nav className="dashboard-skeleton__nav">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="dashboard-skeleton__nav-item">
                        <div className="skeleton skeleton--circle" style={{ width: '24px', height: '24px' }}></div>
                        <div className="skeleton skeleton--text" style={{ width: '40px', height: '10px' }}></div>
                    </div>
                ))}
            </nav>
        </div>
    );
};
