import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Diary.css';

// Mock data
const mockData = {
    date: {
        current: 'Hoje',
        display: '24 Outubro'
    },
    calories: {
        available: 750,
        goal: 2200,
        consumed: 1450,
        percentage: 65
    },
    macros: {
        protein: { consumed: 110, goal: 150, percentage: 73 },
        carbs: { consumed: 150, goal: 200, percentage: 75 },
        fat: { consumed: 45, goal: 70, percentage: 64 }
    },
    aiInsight: {
        title: 'Ótimo trabalho no almoço!',
        description: 'Você atingiu sua meta de proteína com essa refeição. Mantenha o foco na hidratação agora à tarde.',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop'
    },
    meals: [
        {
            id: 1,
            type: 'breakfast',
            name: 'Café da Manhã',
            time: '08:30 AM',
            calories: 450,
            icon: 'wb_twilight',
            color: 'orange',
            foods: [
                { name: 'Ovos Mexidos (3 grandes)', calories: 240 },
                { name: 'Torrada Integral (2 fatias)', calories: 180 },
                { name: 'Café Preto (200ml)', calories: 5 }
            ],
            macros: { protein: 32, carbs: 28, fat: 15 }
        },
        {
            id: 2,
            type: 'lunch',
            name: 'Almoço',
            time: '12:45 PM',
            calories: 620,
            icon: 'sunny',
            color: 'yellow',
            foods: [
                { name: 'Peito de Frango (150g)', calories: 248 },
                { name: 'Arroz Branco (200g)', calories: 260 },
                { name: 'Salada Verde Mista', calories: 30 }
            ],
            macros: { protein: 45, carbs: 58, fat: 12 }
        },
        {
            id: 3,
            type: 'snack',
            name: 'Lanche da Tarde',
            time: '16:00 PM',
            calories: 380,
            icon: 'tapas',
            color: 'purple',
            isEmpty: true
        }
    ]
};

export const Diary: React.FC = () => {
    const navigate = useNavigate();
    const [currentDate] = useState(mockData.date);
    const { calories, macros, aiInsight, meals } = mockData;

    return (
        <div className="diary">
            {/* Header with Date Navigation */}
            <header className="diary__header">
                <button className="diary__nav-btn">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="diary__date">
                    <h2 className="diary__date-title">{currentDate.current}</h2>
                    <span className="diary__date-subtitle">{currentDate.display}</span>
                </div>
                <button className="diary__nav-btn">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </header>

            {/* Content */}
            <main className="diary__content">
                {/* Calories Card */}
                <section className="diary__calories-card">
                    <div className="diary__calories-header">
                        <div className="diary__calories-info">
                            <p className="diary__calories-label">Calorias Disponíveis</p>
                            <div className="diary__calories-value">
                                <span className="diary__calories-main">{calories.available}</span>
                                <span className="diary__calories-max">/ {calories.goal} kcal</span>
                            </div>
                        </div>
                        <div className="diary__calories-icon">
                            <span className="material-symbols-outlined">local_fire_department</span>
                        </div>
                    </div>
                    <div className="diary__calories-progress-section">
                        <div className="diary__calories-stats">
                            <span>{calories.percentage}% da meta</span>
                            <span>{calories.consumed} consumidas</span>
                        </div>
                        <div className="diary__calories-progress">
                            <div
                                className="diary__calories-progress-fill"
                                style={{ width: `${calories.percentage}%` }}
                            />
                        </div>
                    </div>
                </section>

                {/* Macros Grid */}
                <section className="diary__macros-grid">
                    <div className="diary__macro-card diary__macro-card--protein">
                        <div className="diary__macro-bg-icon">
                            <span className="material-symbols-outlined">egg_alt</span>
                        </div>
                        <p className="diary__macro-label">Proteína</p>
                        <p className="diary__macro-value">{macros.protein.consumed}g</p>
                        <div className="diary__macro-progress">
                            <div
                                className="diary__macro-progress-fill diary__macro-progress-fill--protein"
                                style={{ width: `${macros.protein.percentage}%` }}
                            />
                        </div>
                        <p className="diary__macro-goal">Meta: {macros.protein.goal}g</p>
                    </div>

                    <div className="diary__macro-card diary__macro-card--carbs">
                        <div className="diary__macro-bg-icon">
                            <span className="material-symbols-outlined">bakery_dining</span>
                        </div>
                        <p className="diary__macro-label">Carbos</p>
                        <p className="diary__macro-value">{macros.carbs.consumed}g</p>
                        <div className="diary__macro-progress">
                            <div
                                className="diary__macro-progress-fill diary__macro-progress-fill--carbs"
                                style={{ width: `${macros.carbs.percentage}%` }}
                            />
                        </div>
                        <p className="diary__macro-goal">Meta: {macros.carbs.goal}g</p>
                    </div>

                    <div className="diary__macro-card diary__macro-card--fat">
                        <div className="diary__macro-bg-icon">
                            <span className="material-symbols-outlined">oil_barrel</span>
                        </div>
                        <p className="diary__macro-label">Gorduras</p>
                        <p className="diary__macro-value">{macros.fat.consumed}g</p>
                        <div className="diary__macro-progress">
                            <div
                                className="diary__macro-progress-fill diary__macro-progress-fill--fat"
                                style={{ width: `${macros.fat.percentage}%` }}
                            />
                        </div>
                        <p className="diary__macro-goal">Meta: {macros.fat.goal}g</p>
                    </div>
                </section>

                {/* AI Insight */}
                <section className="diary__ai-card">
                    <div className="diary__ai-glow"></div>
                    <div className="diary__ai-content">
                        <div className="diary__ai-header">
                            <span className="material-symbols-outlined">auto_awesome</span>
                            <p className="diary__ai-tag">Insight da IA</p>
                        </div>
                        <h3 className="diary__ai-title">{aiInsight.title}</h3>
                        <p className="diary__ai-description">{aiInsight.description}</p>
                    </div>
                    <div className="diary__ai-image">
                        <img src={aiInsight.imageUrl} alt="Insight visual" />
                    </div>
                </section>

                {/* Meals Header */}
                <div className="diary__meals-header">
                    <h2 className="diary__meals-title">Refeições</h2>
                    <button className="diary__edit-btn">Editar Metas</button>
                </div>

                {/* Meals List */}
                <section className="diary__meals">
                    {meals.map((meal) => (
                        <article key={meal.id} className={`diary__meal ${meal.isEmpty ? 'diary__meal--empty' : ''}`}>
                            <div className={`diary__meal-header diary__meal-header--${meal.color}`}>
                                <div className="diary__meal-info">
                                    <div className={`diary__meal-icon diary__meal-icon--${meal.color}`}>
                                        <span className="material-symbols-outlined">{meal.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="diary__meal-name">{meal.name}</h3>
                                        <p className="diary__meal-time">{meal.time}</p>
                                    </div>
                                </div>
                                <div className="diary__meal-calories">
                                    <span className="diary__meal-calories-value">{meal.calories}</span>
                                    <span className="diary__meal-calories-unit">kcal</span>
                                </div>
                            </div>

                            {!meal.isEmpty ? (
                                <>
                                    <div className="diary__meal-foods">
                                        {meal.foods?.map((food, index) => (
                                            <div key={index} className="diary__food-item">
                                                <div className="diary__food-name">
                                                    <div className="diary__food-bullet"></div>
                                                    <span>{food.name}</span>
                                                </div>
                                                <span className="diary__food-calories">{food.calories} kcal</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="diary__meal-macros">
                                        <div className="diary__meal-macro diary__meal-macro--protein">
                                            <div className="diary__meal-macro-dot"></div>
                                            <span>{meal.macros?.protein}g Prot</span>
                                        </div>
                                        <div className="diary__meal-macro diary__meal-macro--carbs">
                                            <div className="diary__meal-macro-dot"></div>
                                            <span>{meal.macros?.carbs}g Carb</span>
                                        </div>
                                        <div className="diary__meal-macro diary__meal-macro--fat">
                                            <div className="diary__meal-macro-dot"></div>
                                            <span>{meal.macros?.fat}g Gord</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="diary__meal-empty">
                                    <p>Toque para ver detalhes</p>
                                </div>
                            )}
                        </article>
                    ))}
                </section>
            </main>

            {/* Bottom Navigation with FAB */}
            <nav className="diary__nav">
                <button className="diary__nav-item" onClick={() => navigate('/dashboard')}>
                    <span className="material-symbols-outlined">dashboard</span>
                    <span>Início</span>
                </button>
                <button className="diary__nav-item diary__nav-item--active">
                    <span className="material-symbols-outlined filled">restaurant_menu</span>
                    <span>Diário</span>
                </button>

                {/* FAB Central */}
                <button className="diary__fab" onClick={() => navigate('/add-meal')}>
                    <span className="material-symbols-outlined">add</span>
                </button>

                <button className="diary__nav-item" onClick={() => navigate('/tips')}>
                    <span className="material-symbols-outlined">insights</span>
                    <span>Dicas IA</span>
                </button>
                <button className="diary__nav-item" onClick={() => navigate('/profile')}>
                    <span className="material-symbols-outlined">person</span>
                    <span>Perfil</span>
                </button>
            </nav>
        </div>
    );
};
