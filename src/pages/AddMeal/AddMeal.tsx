import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select } from '../../components/ui';
import './AddMeal.css';


const mealTypes = [
    { value: 'breakfast', label: 'Café da Manhã' },
    { value: 'lunch', label: 'Almoço' },
    { value: 'dinner', label: 'Jantar' },
    { value: 'snack', label: 'Lanche' }
];

const recentFoods = [
    { id: '1', name: 'Salada de Frango Grelhado', calories: 350, portion: '1 tigela', icon: 'restaurant' },
    { id: '2', name: 'Café Gelado', calories: 15, portion: 'Grande', icon: 'local_cafe' },
    { id: '3', name: 'Maçã', calories: 95, portion: '1 média', icon: 'nutrition' }
];

const suggestedFood = {
    id: 'suggested',
    name: 'Parfait de Iogurte Grego',
    calories: 180,
    portion: '1 copo',
    icon: 'auto_awesome',
    reason: 'Meta de Proteína'
};

export const AddMeal: React.FC = () => {
    const navigate = useNavigate();
    const [mealType, setMealType] = useState('lunch');
    const [food, setFood] = useState('');
    const [quantity, setQuantity] = useState('');

    const handleClose = () => {
        navigate(-1);
    };

    const handleSave = () => {
        // Save meal logic
        navigate('/dashboard');
    };

    const handleQuickAdd = (foodId: string) => {
        console.log('Quick add:', foodId);
        navigate('/dashboard');
    };

    return (
        <div className="add-meal">
            {/* Header */}
            <header className="add-meal__header">
                <button className="add-meal__close" onClick={handleClose}>
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h2 className="add-meal__title">Adicionar Refeição</h2>
                <div className="add-meal__spacer" />
            </header>

            {/* Content */}
            <main className="add-meal__content">
                {/* Meal Type */}
                <Select
                    label="Horário da Refeição"
                    value={mealType}
                    onChange={(value) => setMealType(value)}
                    options={mealTypes}
                />

                {/* Food Input */}
                <Input
                    label="Alimento"
                    placeholder="O que você comeu?"
                    iconLeft="search"
                    value={food}
                    onChange={(e) => setFood(e.target.value)}
                />

                {/* Quantity Input */}
                <Input
                    label="Quantidade"
                    placeholder="ex: 1 xícara, 200g"
                    iconLeft="scale"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />

                {/* Quick Actions */}
                <div className="add-meal__quick-actions">
                    <label className="add-meal__label">Ações Rápidas</label>
                    <div className="add-meal__chips">
                        <button className="add-meal__chip add-meal__chip--voice">
                            <span className="material-symbols-outlined">mic</span>
                            <span>Gravar Áudio</span>
                        </button>
                        <button className="add-meal__chip">
                            <span className="material-symbols-outlined">favorite</span>
                            <span>Favoritos</span>
                        </button>
                        <button className="add-meal__chip">
                            <span className="material-symbols-outlined">history</span>
                            <span>Repetir Refeição Anterior</span>
                        </button>
                        <button className="add-meal__chip">
                            <span className="material-symbols-outlined">content_copy</span>
                            <span>Copiar Dia Anterior</span>
                        </button>
                    </div>
                </div>

                {/* Recent History */}
                <div className="add-meal__history">
                    <h3 className="add-meal__section-title">Histórico Recente</h3>

                    {/* Suggested Item */}
                    <div
                        className="food-item food-item--suggested"
                        onClick={() => handleQuickAdd(suggestedFood.id)}
                    >
                        <div className="food-item__icon food-item__icon--suggested">
                            <span className="material-symbols-outlined">{suggestedFood.icon}</span>
                        </div>
                        <div className="food-item__info">
                            <div className="food-item__name">
                                {suggestedFood.name}
                                <span className="food-item__badge">SUGERIDO</span>
                            </div>
                            <span className="food-item__details">{suggestedFood.reason} • {suggestedFood.portion}</span>
                        </div>
                        <button className="food-item__add food-item__add--suggested">
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>

                    {/* Recent Items */}
                    {recentFoods.map((item) => (
                        <div
                            key={item.id}
                            className="food-item"
                            onClick={() => handleQuickAdd(item.id)}
                        >
                            <div className="food-item__icon">
                                <span className="material-symbols-outlined">{item.icon}</span>
                            </div>
                            <div className="food-item__info">
                                <span className="food-item__name">{item.name}</span>
                                <span className="food-item__details">{item.calories} kcal • {item.portion}</span>
                            </div>
                            <button className="food-item__add">
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {/* CTA */}
            <div className="add-meal__cta">
                <Button
                    fullWidth
                    size="lg"
                    icon="check_circle"
                    onClick={handleSave}
                    disabled={!food || !quantity}
                >
                    Salvar Refeição
                </Button>
            </div>
        </div>
    );
};
