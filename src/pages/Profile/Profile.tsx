import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

// Mock data - would come from store/API
const mockData = {
    user: {
        name: 'João Silva',
        avatarUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop&crop=face',
        isPremium: true
    },
    physicalData: {
        age: 22,
        sex: 'Masculino',
        height: 178,
        weight: 76
    },
    goal: {
        name: 'Hipertrofia Muscular',
        description: 'Foco em ganho de massa magra e força.',
        progress: 65,
        weekCurrent: 4,
        weekTotal: 12
    },
    activityLevel: {
        name: 'Moderadamente Ativo',
        description: '3-5x por semana'
    }
};

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, physicalData, goal, activityLevel } = mockData;

    return (
        <div className="profile">
            {/* Header */}
            <header className="profile__header">
                <h2 className="profile__title">Perfil</h2>
                <button className="profile__settings-btn">
                    <span className="material-symbols-outlined">settings</span>
                </button>
            </header>

            {/* Content */}
            <main className="profile__content">
                {/* Profile Header */}
                <div className="profile__user">
                    <div className="profile__avatar-wrapper">
                        <img src={user.avatarUrl} alt={user.name} className="profile__avatar" />
                        <div className="profile__avatar-badge">
                            <span className="material-symbols-outlined">auto_awesome</span>
                        </div>
                    </div>
                    <h1 className="profile__name">{user.name}</h1>
                    {user.isPremium && (
                        <span className="profile__badge">Aluno Premium</span>
                    )}
                </div>

                {/* Physical Data */}
                <section className="profile__section">
                    <h3 className="profile__section-title">Dados Físicos</h3>
                    <div className="profile__stats-grid">
                        <div className="profile__stat">
                            <div className="profile__stat-header">
                                <span className="material-symbols-outlined">calendar_today</span>
                                <p className="profile__stat-label">Idade</p>
                            </div>
                            <p className="profile__stat-value">
                                {physicalData.age} <span className="profile__stat-unit">anos</span>
                            </p>
                        </div>

                        <div className="profile__stat">
                            <div className="profile__stat-header">
                                <span className="material-symbols-outlined">male</span>
                                <p className="profile__stat-label">Sexo</p>
                            </div>
                            <p className="profile__stat-value">Masc.</p>
                        </div>

                        <div className="profile__stat">
                            <div className="profile__stat-header">
                                <span className="material-symbols-outlined">height</span>
                                <p className="profile__stat-label">Altura</p>
                            </div>
                            <p className="profile__stat-value">
                                {physicalData.height} <span className="profile__stat-unit">cm</span>
                            </p>
                        </div>

                        <div className="profile__stat">
                            <div className="profile__stat-header">
                                <span className="material-symbols-outlined">monitor_weight</span>
                                <p className="profile__stat-label">Peso</p>
                            </div>
                            <p className="profile__stat-value">
                                {physicalData.weight} <span className="profile__stat-unit">kg</span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Goal Card */}
                <section className="profile__section">
                    <h3 className="profile__section-title">Meta Atual</h3>
                    <div className="profile__goal-card">
                        <div className="profile__goal-glow"></div>
                        <div className="profile__goal-content">
                            <div className="profile__goal-header">
                                <span className="material-symbols-outlined">fitness_center</span>
                                <p className="profile__goal-tag">Meu Objetivo</p>
                            </div>
                            <h4 className="profile__goal-name">{goal.name}</h4>
                            <p className="profile__goal-description">{goal.description}</p>
                            <div className="profile__goal-progress">
                                <div
                                    className="profile__goal-progress-fill"
                                    style={{ width: `${goal.progress}%` }}
                                />
                            </div>
                            <p className="profile__goal-status">
                                Plano em progresso: Semana {goal.weekCurrent}/{goal.weekTotal}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Details */}
                <section className="profile__section">
                    <h3 className="profile__section-title">Detalhes</h3>
                    <div className="profile__details">
                        {/* Activity Level */}
                        <div className="profile__detail-item">
                            <div className="profile__detail-icon">
                                <span className="material-symbols-outlined">directions_run</span>
                            </div>
                            <div className="profile__detail-info">
                                <p className="profile__detail-label">Nível de Atividade</p>
                                <p className="profile__detail-value">{activityLevel.name}</p>
                                <p className="profile__detail-description">{activityLevel.description}</p>
                            </div>
                        </div>

                        {/* Settings Button */}
                        <button className="profile__detail-item profile__detail-item--clickable">
                            <div className="profile__detail-icon profile__detail-icon--secondary">
                                <span className="material-symbols-outlined">tune</span>
                            </div>
                            <div className="profile__detail-info">
                                <p className="profile__detail-value">Configurações do App</p>
                            </div>
                            <span className="material-symbols-outlined profile__detail-chevron">chevron_right</span>
                        </button>
                    </div>
                </section>
            </main>

            {/* Bottom Navigation with FAB */}
            <nav className="profile__nav">
                <button className="profile__nav-item" onClick={() => navigate('/dashboard')}>
                    <span className="material-symbols-outlined">dashboard</span>
                    <span>Início</span>
                </button>
                <button className="profile__nav-item" onClick={() => navigate('/diary')}>
                    <span className="material-symbols-outlined">restaurant_menu</span>
                    <span>Diário</span>
                </button>

                {/* FAB Central */}
                <button className="profile__fab" onClick={() => navigate('/add-meal')}>
                    <span className="material-symbols-outlined">add</span>
                </button>

                <button className="profile__nav-item" onClick={() => navigate('/tips')}>
                    <span className="material-symbols-outlined">insights</span>
                    <span>Dicas IA</span>
                </button>
                <button className="profile__nav-item profile__nav-item--active">
                    <span className="material-symbols-outlined filled">person</span>
                    <span>Perfil</span>
                </button>
            </nav>
        </div>
    );
};
