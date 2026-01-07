import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useAuth } from '../../contexts/AuthContext';
import { BottomNav } from '../../components/BottomNav';
import './Profile.css';

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, studentProfile, nutritionGoals } = useAppStore();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        console.log('🔴 Logout button clicked');
        try {
            await signOut();
            // Redirecionamento é automático via ProtectedRoute
            console.log('✅ Logout complete, redirect will happen automatically');
        } catch (error) {
            console.error('Erro ao sair:', error);
        }
    };

    // Formatar dados para exibição
    const goalMap = {
        'lose': 'Perder Peso',
        'maintain': 'Manter Peso',
        'gain': 'Ganhar Massa'
    };

    const activityMap = {
        'sedentary': 'Sedentário',
        'light': 'Levemente Ativo',
        'moderate': 'Moderadamente Ativo',
        'active': 'Muito Ativo',
        'very_active': 'Extremamente Ativo'
    };

    return (
        <div className="profile">
            {/* Header */}
            <header className="profile__header">
                <h2 className="profile__title">Perfil</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="profile__settings-btn" onClick={handleLogout} title="Sair">
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                    <button className="profile__settings-btn">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="profile__content">
                {/* Profile Header */}
                <div className="profile__user">
                    <div className="profile__avatar-wrapper">
                        <img
                            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop&crop=face'}
                            alt={user?.fullName || 'Usuário'}
                            className="profile__avatar"
                        />
                        <div className="profile__avatar-badge">
                            <span className="material-symbols-outlined">auto_awesome</span>
                        </div>
                    </div>
                    <h1 className="profile__name">{user?.fullName || 'Usuário'}</h1>
                    <span className="profile__badge">Aluno Gratuito</span>
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
                                {studentProfile?.age || '--'} <span className="profile__stat-unit">anos</span>
                            </p>
                        </div>

                        <div className="profile__stat">
                            <div className="profile__stat-header">
                                <span className="material-symbols-outlined">male</span>
                                <p className="profile__stat-label">Sexo</p>
                            </div>
                            <p className="profile__stat-value">
                                {studentProfile?.sex === 'male' ? 'Masc.' : studentProfile?.sex === 'female' ? 'Fem.' : 'Outro'}
                            </p>
                        </div>

                        <div className="profile__stat">
                            <div className="profile__stat-header">
                                <span className="material-symbols-outlined">height</span>
                                <p className="profile__stat-label">Altura</p>
                            </div>
                            <p className="profile__stat-value">
                                {studentProfile?.heightCm || '--'} <span className="profile__stat-unit">cm</span>
                            </p>
                        </div>

                        <div className="profile__stat">
                            <div className="profile__stat-header">
                                <span className="material-symbols-outlined">monitor_weight</span>
                                <p className="profile__stat-label">Peso</p>
                            </div>
                            <p className="profile__stat-value">
                                {studentProfile?.weightKg || '--'} <span className="profile__stat-unit">kg</span>
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
                            <h4 className="profile__goal-name">
                                {studentProfile?.goal ? goalMap[studentProfile.goal] : 'Definir Meta'}
                            </h4>
                            <p className="profile__goal-description">
                                Meta calórica: {nutritionGoals?.calories || 0} kcal/dia
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
                                <p className="profile__detail-value">
                                    {studentProfile?.activityLevel ? activityMap[studentProfile.activityLevel] : '--'}
                                </p>
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

                        {/* Logout Button (Second Option) */}
                        <button className="profile__detail-item profile__detail-item--clickable" onClick={handleLogout}>
                            <div className="profile__detail-icon profile__detail-icon--secondary" style={{ color: '#ef4444' }}>
                                <span className="material-symbols-outlined">logout</span>
                            </div>
                            <div className="profile__detail-info">
                                <p className="profile__detail-value" style={{ color: '#ef4444' }}>Sair da Conta</p>
                            </div>
                            <span className="material-symbols-outlined profile__detail-chevron">chevron_right</span>
                        </button>
                    </div>
                </section>
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};
