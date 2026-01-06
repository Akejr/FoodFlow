import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../../components/ui';
import './Dashboard.css';

// Mock data - would come from store/API
const mockData = {
    user: {
        name: 'Alex',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
    },
    date: new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }),
    goals: {
        calories: 2200,
        protein: 180,
        carbs: 250,
        fat: 60
    },
    consumed: {
        calories: 1450,
        protein: 110,
        carbs: 200,
        fat: 65
    },
    tip: {
        text: 'Você está indo muito bem! Faltam <strong>15g de proteína</strong> para sua meta. Tente um iogurte grego!',
        dismissible: true
    }
};

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [showTip, setShowTip] = React.useState(true);

    const { user, date, goals, consumed, tip } = mockData;

    const caloriesPercentage = Math.round((consumed.calories / goals.calories) * 100);

    const handleAddMeal = () => {
        navigate('/add-meal');
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard__header">
                <div className="dashboard__greeting">
                    <span className="dashboard__date">{date}</span>
                    <h1 className="dashboard__title">Olá, {user.name}</h1>
                </div>
                <div className="dashboard__avatar">
                    <img src={user.avatarUrl} alt={user.name} />
                    <div className="dashboard__avatar-badge">
                        <span className="material-symbols-outlined">sync</span>
                    </div>
                </div>
            </header>

            {/* AI Tip */}
            {showTip && (
                <div className="dashboard__tip">
                    <div className="dashboard__tip-icon">
                        <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <p dangerouslySetInnerHTML={{ __html: tip.text }} />
                    <button
                        className="dashboard__tip-close"
                        onClick={() => setShowTip(false)}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            )}

            {/* Calories Card */}
            <section className="dashboard__calories">
                <div className="dashboard__calories-glow" />
                <div className="dashboard__calories-content">
                    <div className="dashboard__calories-header">
                        <div className="dashboard__calories-label">
                            <div className="dashboard__calories-icon">
                                <span className="material-symbols-outlined">local_fire_department</span>
                            </div>
                            <div>
                                <h3>Calorias</h3>
                                <span>Meta Diária</span>
                            </div>
                        </div>
                        <div className="dashboard__calories-values">
                            <div className="dashboard__calories-current">
                                <span className="value">{consumed.calories.toLocaleString('pt-BR')}</span>
                                <span className="max">/ {goals.calories.toLocaleString('pt-BR')}</span>
                            </div>
                            <span className="dashboard__calories-percentage">{caloriesPercentage}% Consumido</span>
                        </div>
                    </div>

                    <div className="dashboard__calories-bar">
                        <div
                            className="dashboard__calories-fill"
                            style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
                        />
                    </div>

                    <div className="dashboard__calories-meals">
                        <span>Café</span>
                        <span>Almoço</span>
                        <span className="active">Jantar?</span>
                    </div>
                </div>
            </section>

            {/* Macros Section */}
            <section className="dashboard__macros">
                <h2 className="dashboard__macros-title">
                    Macros
                    <span className="dashboard__macros-badge">Resumo</span>
                </h2>

                <div className="dashboard__macros-list">
                    <ProgressBar
                        value={consumed.protein}
                        max={goals.protein}
                        label="Proteínas"
                        sublabel={`${goals.protein - consumed.protein}g restantes`}
                        icon="egg_alt"
                    />

                    <ProgressBar
                        value={consumed.carbs}
                        max={goals.carbs}
                        label="Carboidratos"
                        sublabel={`${goals.carbs - consumed.carbs}g restantes`}
                        icon="bakery_dining"
                    />

                    <ProgressBar
                        value={consumed.fat}
                        max={goals.fat}
                        label="Gorduras"
                        sublabel=""
                        icon="water_drop"
                        exceeded={consumed.fat > goals.fat}
                    />
                </div>
            </section>

            {/* Bottom Navigation with FAB */}
            <nav className="dashboard__nav">
                <button className="dashboard__nav-item dashboard__nav-item--active">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span>Início</span>
                </button>
                <button className="dashboard__nav-item" onClick={() => navigate('/diary')}>
                    <span className="material-symbols-outlined">restaurant_menu</span>
                    <span>Diário</span>
                </button>

                {/* FAB Central */}
                <button className="dashboard__fab" onClick={handleAddMeal}>
                    <span className="material-symbols-outlined">add</span>
                </button>

                <button className="dashboard__nav-item" onClick={() => navigate('/tips')}>
                    <span className="material-symbols-outlined">insights</span>
                    <span>Dicas IA</span>
                </button>
                <button className="dashboard__nav-item" onClick={() => navigate('/profile')}>
                    <span className="material-symbols-outlined">person</span>
                    <span>Perfil</span>
                </button>
            </nav>
        </div>
    );
};
