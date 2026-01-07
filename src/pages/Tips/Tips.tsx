import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../../components/BottomNav';
import './Tips.css';

const mockData = {
    user: { name: 'Alex' },
    streak: { current: 5, gained: 2 },
    weeklyAdherence: 85,
    tips: [
        {
            id: '1',
            type: 'warning',
            title: 'Atenção às gorduras',
            text: '"Hoje você passou da meta de gordura. Tente moderar amanhã."',
            impact: 'Impacta meta semanal',
            image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=200&fit=crop'
        },
        {
            id: '2',
            type: 'success',
            icon: 'thumb_up',
            title: 'Continue assim! 👏',
            text: '"Você manteve boa consistência esta semana, parabéns 👏"'
        },
        {
            id: '3',
            type: 'info',
            icon: 'water_drop',
            title: 'Você sabia?',
            text: 'Beber água ajuda na concentração nos estudos. Mantenha uma garrafa sempre por perto.'
        },
        {
            id: '4',
            type: 'insight',
            icon: 'bedtime',
            title: 'Lanches Noturnos',
            text: 'Percebemos que suas refeições ficam mais calóricas após as 22h nas sextas-feiras.'
        }
    ]
};

export const Tips: React.FC = () => {
    const navigate = useNavigate();
    const { user, streak, weeklyAdherence, tips } = mockData;

    return (
        <div className="tips">
            {/* Header */}
            <header className="tips__header">
                <div className="tips__logo">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    <h2>Dicas IA</h2>
                </div>
                <div className="tips__actions">
                    <div className="tips__badge">
                        <span className="material-symbols-outlined">visibility</span>
                        <span>Personal Ativo</span>
                    </div>
                    <button className="tips__notification">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="tips__notification-dot" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="tips__content">
                {/* Greeting */}
                <div className="tips__greeting">
                    <h1>Olá {user.name},</h1>
                    <p>aqui está seu resumo diário.</p>
                </div>

                {/* Stats */}
                <div className="tips__stats">
                    <div className="tips__stat">
                        <div className="tips__stat-header">
                            <span className="material-symbols-outlined">local_fire_department</span>
                            <span className="tips__stat-badge">+{streak.gained}</span>
                        </div>
                        <div className="tips__stat-value">{streak.current} Dias</div>
                        <div className="tips__stat-label">Sequência</div>
                    </div>
                    <div className="tips__stat">
                        <div className="tips__stat-header">
                            <span className="material-symbols-outlined">donut_large</span>
                        </div>
                        <div className="tips__stat-value">{weeklyAdherence}%</div>
                        <div className="tips__stat-label">Aderência Semanal</div>
                    </div>
                </div>

                {/* Main Alert Card */}
                {tips[0] && tips[0].type === 'warning' && (
                    <div className="tips__alert-card">
                        <div
                            className="tips__alert-image"
                            style={{ backgroundImage: `url(${tips[0].image})` }}
                        >
                            <div className="tips__alert-badge">
                                <span className="material-symbols-outlined">warning</span>
                                <span>Requer Atenção</span>
                            </div>
                        </div>
                        <div className="tips__alert-content">
                            <span className="tips__alert-label">Insight de Hoje</span>
                            <h3>{tips[0].title}</h3>
                            <p>{tips[0].text}</p>
                            <div className="tips__alert-footer">
                                <span>{tips[0].impact}</span>
                                <button className="tips__alert-btn" onClick={() => navigate('/diary')}>
                                    Ver Diário
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Weekly Patterns */}
                <div className="tips__section">
                    <div className="tips__section-header">
                        <h3>Padrões Semanais</h3>
                        <button className="tips__section-link">Ver Tudo</button>
                    </div>

                    <div className="tips__patterns">
                        {tips.slice(1).map((tip) => (
                            <div key={tip.id} className={`tips__pattern tips__pattern--${tip.type}`}>
                                <div className={`tips__pattern-icon tips__pattern-icon--${tip.type}`}>
                                    <span className="material-symbols-outlined">{tip.icon}</span>
                                </div>
                                <div className="tips__pattern-content">
                                    <h4>{tip.title}</h4>
                                    <p>{tip.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};
