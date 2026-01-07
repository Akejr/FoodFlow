import React from 'react';

export const DiarySkeleton: React.FC = () => {
    return (
        <div className="diary-skeleton">
            {/* Header Skeleton */}
            <header className="diary-skeleton__header">
                <div className="skeleton skeleton--circle" style={{ width: '40px', height: '40px' }}></div>
                <div className="diary-skeleton__date">
                    <div className="skeleton skeleton--title" style={{ width: '100px', marginBottom: '6px' }}></div>
                    <div className="skeleton skeleton--text" style={{ width: '140px', height: '12px' }}></div>
                </div>
                <div className="skeleton skeleton--circle" style={{ width: '40px', height: '40px' }}></div>
            </header>

            {/* Content */}
            <main className="diary-skeleton__content">
                {/* Calories Card Skeleton */}
                <section className="diary-skeleton__calories">
                    <div className="diary-skeleton__calories-header">
                        <div style={{ flex: 1 }}>
                            <div className="skeleton skeleton--text" style={{ width: '140px', marginBottom: '8px' }}></div>
                            <div className="skeleton skeleton--title" style={{ width: '180px', marginBottom: '4px' }}></div>
                        </div>
                        <div className="skeleton skeleton--circle" style={{ width: '56px', height: '56px' }}></div>
                    </div>
                    <div className="diary-skeleton__calories-stats">
                        <div className="skeleton skeleton--text" style={{ width: '80px' }}></div>
                        <div className="skeleton skeleton--text" style={{ width: '100px' }}></div>
                    </div>
                    <div className="skeleton" style={{ width: '100%', height: '8px', borderRadius: '4px', marginTop: '8px' }}></div>
                </section>

                {/* Macros Grid Skeleton */}
                <section className="diary-skeleton__macros">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="diary-skeleton__macro-card">
                            <div className="skeleton skeleton--circle" style={{ width: '48px', height: '48px', marginBottom: '12px' }}></div>
                            <div className="skeleton skeleton--text" style={{ width: '60px', marginBottom: '8px' }}></div>
                            <div className="skeleton skeleton--title" style={{ width: '50px', marginBottom: '8px' }}></div>
                            <div className="skeleton" style={{ width: '100%', height: '6px', borderRadius: '3px', marginBottom: '8px' }}></div>
                            <div className="skeleton skeleton--text" style={{ width: '70px', height: '12px' }}></div>
                        </div>
                    ))}
                </section>

                {/* Meals Header Skeleton */}
                <div className="diary-skeleton__meals-header">
                    <div className="skeleton skeleton--title" style={{ width: '100px' }}></div>
                </div>

                {/* Meals List Skeleton */}
                <section className="diary-skeleton__meals">
                    {[1, 2].map((i) => (
                        <div key={i} className="diary-skeleton__meal">
                            <div className="diary-skeleton__meal-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="skeleton skeleton--circle" style={{ width: '40px', height: '40px' }}></div>
                                    <div>
                                        <div className="skeleton skeleton--text" style={{ width: '120px', marginBottom: '4px' }}></div>
                                        <div className="skeleton skeleton--text" style={{ width: '60px', height: '12px' }}></div>
                                    </div>
                                </div>
                                <div className="skeleton skeleton--text" style={{ width: '60px' }}></div>
                            </div>
                            <div className="diary-skeleton__meal-foods">
                                {[1, 2].map((j) => (
                                    <div key={j} className="diary-skeleton__food-item">
                                        <div className="skeleton skeleton--text" style={{ width: '140px' }}></div>
                                        <div className="skeleton skeleton--text" style={{ width: '60px' }}></div>
                                    </div>
                                ))}
                            </div>
                            <div className="diary-skeleton__meal-macros">
                                <div className="skeleton skeleton--text" style={{ width: '50px' }}></div>
                                <div className="skeleton skeleton--text" style={{ width: '50px' }}></div>
                                <div className="skeleton skeleton--text" style={{ width: '50px' }}></div>
                            </div>
                        </div>
                    ))}
                </section>
            </main>

            {/* Nav Skeleton */}
            <nav className="diary-skeleton__nav">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="diary-skeleton__nav-item">
                        <div className="skeleton skeleton--circle" style={{ width: '24px', height: '24px' }}></div>
                        <div className="skeleton skeleton--text" style={{ width: '40px', height: '10px' }}></div>
                    </div>
                ))}
            </nav>
        </div>
    );
};
