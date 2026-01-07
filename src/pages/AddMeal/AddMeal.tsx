import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Select } from '../../components/ui';
import { BottomNav } from '../../components/BottomNav';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { calculateNutritionWithAI, calculateNutritionFromVoice, type FoodItem, type NutritionData } from '../../services/openai';
import './AddMeal.css';

const mealTypes = [
    { value: 'breakfast', label: 'Café da Manhã' },
    { value: 'lunch', label: 'Almoço' },
    { value: 'dinner', label: 'Jantar' },
    { value: 'snack', label: 'Lanche' }
];

interface RecentFood {
    id: string;
    food_name: string;
    calories: number;
    quantity_g: number;
}

export const AddMeal: React.FC = () => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [mealType, setMealType] = useState('lunch');

    // Lista de alimentos
    const [foodItems, setFoodItems] = useState<FoodItem[]>([
        { name: '', weightG: 0 }
    ]);

    // Histórico recente (dados reais)
    const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Resultados da IA
    const [nutritionResults, setNutritionResults] = useState<NutritionData[]>([]);
    const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [calculated, setCalculated] = useState(false);

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Modal de voz
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [processingVoice, setProcessingVoice] = useState(false);

    // Carregar histórico recente
    useEffect(() => {
        loadRecentFoods();
    }, []);

    const loadRecentFoods = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoadingHistory(false);
                return;
            }

            const { data } = await supabase
                .from('meal_logs')
                .select('id, food_name, calories, quantity_g')
                .eq('user_id', user.id)
                .order('logged_at', { ascending: false })
                .limit(3);

            setRecentFoods(data || []);
        } catch (err) {
            console.error('Erro ao carregar histórico:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleClose = () => {
        navigate(-1);
    };

    // Adicionar novo campo de alimento
    const handleAddFood = () => {
        setFoodItems([...foodItems, { name: '', weightG: 0 }]);
        setCalculated(false);
    };

    // Remover alimento
    const handleRemoveFood = (index: number) => {
        if (foodItems.length > 1) {
            const newItems = foodItems.filter((_, i) => i !== index);
            setFoodItems(newItems);
            setCalculated(false);
        }
    };

    // Atualizar alimento
    const handleUpdateFood = (index: number, field: 'name' | 'weightG', value: string) => {
        const newItems = [...foodItems];
        if (field === 'name') {
            newItems[index].name = value;
        } else {
            newItems[index].weightG = parseInt(value) || 0;
        }
        setFoodItems(newItems);
        setCalculated(false);
    };

    // Iniciar gravação de voz
    const handleStartVoice = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError('Seu navegador não suporta reconhecimento de voz');
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsRecording(true);
            setVoiceTranscript('');
            setShowVoiceModal(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setVoiceTranscript(transcript);
            setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setError('Erro no reconhecimento de voz. Tente novamente.');
            setIsRecording(false);
            setShowVoiceModal(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.start();
    };

    // Confirmar transcrição de voz - envia direto para IA
    const handleConfirmVoice = async () => {
        if (!voiceTranscript.trim()) return;

        setProcessingVoice(true);
        setError('');

        try {
            const result = await calculateNutritionFromVoice(voiceTranscript);

            if (result.success && result.items.length > 0) {
                setNutritionResults(result.items);
                setTotals(result.totals);
                setCalculated(true);
                setFoodItems(result.items.map(item => ({
                    name: item.name,
                    weightG: item.weightG
                })));
                setShowVoiceModal(false);
            } else {
                setError(result.error || 'Não foi possível interpretar o áudio');
            }
        } catch (err) {
            setError('Erro ao processar áudio');
        } finally {
            setProcessingVoice(false);
            setVoiceTranscript('');
        }
    };

    // Cancelar e tentar novamente
    const handleRetryVoice = () => {
        setVoiceTranscript('');
        handleStartVoice();
    };

    // Calcular macros com IA
    const handleCalculate = async () => {
        const validItems = foodItems.filter(f => f.name.trim() && f.weightG > 0);

        if (validItems.length === 0) {
            setError('Adicione pelo menos um alimento com nome e peso');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await calculateNutritionWithAI(validItems);

            if (result.success) {
                setNutritionResults(result.items);
                setTotals(result.totals);
                setCalculated(true);
            } else {
                setError(result.error || 'Erro ao calcular nutrição');
            }
        } catch (err) {
            setError('Erro ao conectar com a IA');
        } finally {
            setLoading(false);
        }
    };

    // Adicionar do histórico
    const handleQuickAdd = (food: RecentFood) => {
        setFoodItems([{ name: food.food_name, weightG: food.quantity_g }]);
        setCalculated(false);
    };

    // Salvar refeição
    const handleSave = async () => {
        console.log('🔵 ========== INÍCIO DO SALVAMENTO ==========');
        
        if (!calculated || nutritionResults.length === 0) {
            setError('Calcule os macros antes de salvar');
            return;
        }

        if (!authUser) {
            setError('Você precisa estar logado para salvar refeições');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const userId = authUser.id;
            console.log('✅ Usando userId:', userId);
            console.log('🔵 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
            console.log('🔵 Tem Anon Key?:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

            const mealLogs = nutritionResults.map(item => ({
                user_id: userId,
                food_name: item.name,
                quantity_g: item.weightG,
                calories: Math.round(item.calories),
                protein: Math.round(item.protein * 100) / 100,
                carbs: Math.round(item.carbs * 100) / 100,
                fat: Math.round(item.fat * 100) / 100,
                meal_type: mealType,
                logged_at: new Date().toISOString()
            }));

            console.log('🔵 Dados a inserir:', JSON.stringify(mealLogs, null, 2));
            console.log('🔵 Iniciando insert...');
            
            const startTime = Date.now();
            const result = await supabase
                .from('meal_logs')
                .insert(mealLogs);
            
            const endTime = Date.now();
            console.log(`🔵 Insert levou ${endTime - startTime}ms`);
            console.log('🔵 Resultado completo:', result);
            console.log('🔵 result.data:', result.data);
            console.log('🔵 result.error:', result.error);
            console.log('🔵 result.status:', result.status);
            console.log('🔵 result.statusText:', result.statusText);

            if (result.error) {
                console.error('🔴 Erro do Supabase:', result.error);
                console.error('🔴 Código:', result.error.code);
                console.error('🔴 Mensagem:', result.error.message);
                console.error('🔴 Detalhes:', result.error.details);
                console.error('🔴 Hint:', result.error.hint);
                throw result.error;
            }

            console.log('✅ Sucesso! Navegando...');
            setSaving(false);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('🔴 ERRO CAPTURADO:', err);
            console.error('🔴 Tipo:', typeof err);
            console.error('🔴 Constructor:', err.constructor?.name);
            console.error('🔴 Message:', err.message);
            console.error('🔴 Code:', err.code);
            console.error('🔴 Stack:', err.stack);
            setError(err.message || 'Erro ao salvar refeição. Verifique sua conexão.');
            setSaving(false);
        }
        
        console.log('🔵 ========== FIM DO SALVAMENTO ==========');
    };

    const isValid = foodItems.some(f => f.name.trim() && f.weightG > 0);

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
                    label="Tipo de Refeição"
                    value={mealType}
                    onChange={(value) => setMealType(value)}
                    options={mealTypes}
                />

                {/* Food Items */}
                <div className="add-meal__foods">
                    {foodItems.map((item, index) => (
                        <div key={index} className="add-meal__food-card">
                            <div className="add-meal__food-card-header">
                                <span className="add-meal__item-number">Item {index + 1}</span>
                                {foodItems.length > 1 && (
                                    <button
                                        className="add-meal__remove-btn"
                                        onClick={() => handleRemoveFood(index)}
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                )}
                            </div>

                            <div className="add-meal__food-fields">
                                <label className="add-meal__field">
                                    <span className="add-meal__field-label">Nome do Alimento</span>
                                    <div className="add-meal__input-wrapper">
                                        <span className="material-symbols-outlined add-meal__input-icon">restaurant_menu</span>
                                        <input
                                            type="text"
                                            className="add-meal__input"
                                            placeholder="O que você comeu?"
                                            value={item.name}
                                            onChange={(e) => handleUpdateFood(index, 'name', e.target.value)}
                                        />
                                    </div>
                                </label>

                                <label className="add-meal__field">
                                    <span className="add-meal__field-label">Peso/Quantidade</span>
                                    <div className="add-meal__input-wrapper">
                                        <span className="material-symbols-outlined add-meal__input-icon">scale</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="add-meal__input"
                                            placeholder="ex: 150g, 1 unidade"
                                            value={item.weightG > 0 ? `${item.weightG}g` : ''}
                                            onChange={(e) => {
                                                const num = e.target.value.replace(/\D/g, '');
                                                handleUpdateFood(index, 'weightG', num);
                                            }}
                                        />
                                    </div>
                                </label>
                            </div>
                        </div>
                    ))}

                    {/* Action Buttons */}
                    <div className="add-meal__actions">
                        <button className="add-meal__add-btn" onClick={handleAddFood}>
                            <span className="material-symbols-outlined">add</span>
                            Adicionar Mais Alimentos
                        </button>
                        <button
                            className="add-meal__ai-btn"
                            onClick={handleCalculate}
                            disabled={!isValid || loading}
                        >
                            <span className="material-symbols-outlined">auto_awesome</span>
                            {loading ? 'Calculando...' : 'Calcular Macros com IA'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="add-meal__error">
                        <span className="material-symbols-outlined">error</span>
                        <p>{error}</p>
                    </div>
                )}

                {/* Results */}
                {calculated && nutritionResults.length > 0 && (
                    <div className="add-meal__results">
                        <h3 className="add-meal__section-title">
                            <span className="material-symbols-outlined">check_circle</span>
                            Resultado da Análise
                        </h3>

                        <div className="add-meal__result-items">
                            {nutritionResults.map((item, index) => (
                                <div key={index} className="result-item">
                                    <div className="result-item__header">
                                        <span className="result-item__name">{item.name}</span>
                                        <span className="result-item__weight">{item.weightG}g</span>
                                    </div>
                                    <div className="result-item__macros">
                                        <span>{item.calories} kcal</span>
                                        <span>P: {item.protein}g</span>
                                        <span>C: {item.carbs}g</span>
                                        <span>G: {item.fat}g</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="add-meal__totals">
                            <div className="add-meal__total-row">
                                <span>Total</span>
                                <span className="add-meal__total-calories">{totals.calories} kcal</span>
                            </div>
                            <div className="add-meal__macros-summary">
                                <div className="macro-badge macro-badge--protein">
                                    <span>Proteínas</span>
                                    <strong>{totals.protein}g</strong>
                                </div>
                                <div className="macro-badge macro-badge--carbs">
                                    <span>Carbos</span>
                                    <strong>{totals.carbs}g</strong>
                                </div>
                                <div className="macro-badge macro-badge--fat">
                                    <span>Gorduras</span>
                                    <strong>{totals.fat}g</strong>
                                </div>
                            </div>
                        </div>

                        <button
                            className="add-meal__recalculate"
                            onClick={() => setCalculated(false)}
                        >
                            <span className="material-symbols-outlined">refresh</span>
                            Editar e recalcular
                        </button>
                    </div>
                )}

                {/* Histórico Recente */}
                {!calculated && (
                    <div className="add-meal__history">
                        <h3 className="add-meal__history-title">Histórico Recente</h3>

                        {loadingHistory ? (
                            <div className="add-meal__history-loading">
                                <span className="material-symbols-outlined">sync</span>
                                <span>Buscando histórico...</span>
                            </div>
                        ) : recentFoods.length === 0 ? (
                            <div className="add-meal__history-empty">
                                <span className="material-symbols-outlined">restaurant</span>
                                <span>Suas refeições anteriores aparecerão aqui para adição rápida</span>
                            </div>
                        ) : (
                            recentFoods.map((food) => (
                                <div
                                    key={food.id}
                                    className="add-meal__history-item"
                                    onClick={() => handleQuickAdd(food)}
                                >
                                    <div className="add-meal__history-icon">
                                        <span className="material-symbols-outlined">restaurant</span>
                                    </div>
                                    <div className="add-meal__history-info">
                                        <span className="add-meal__history-name">{food.food_name}</span>
                                        <span className="add-meal__history-details">{food.calories} kcal • {food.quantity_g}g</span>
                                    </div>
                                    <button className="add-meal__history-add">
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* Voice Button */}
            <button
                className={`add-meal__voice-btn ${isRecording ? 'add-meal__voice-btn--recording' : ''}`}
                onClick={handleStartVoice}
            >
                <span className="material-symbols-outlined">{isRecording ? 'mic' : 'mic'}</span>
            </button>

            {/* Voice Modal */}
            {showVoiceModal && (
                <div className="add-meal__modal-overlay" onClick={() => !isRecording && !processingVoice && setShowVoiceModal(false)}>
                    <div className="add-meal__modal" onClick={e => e.stopPropagation()}>
                        <div className="add-meal__modal-header">
                            <span className="material-symbols-outlined">
                                {processingVoice ? 'auto_awesome' : 'mic'}
                            </span>
                            <h3>
                                {processingVoice ? 'IA Analisando...' : isRecording ? 'Ouvindo...' : 'Transcrição'}
                            </h3>
                        </div>

                        <div className="add-meal__modal-content">
                            {processingVoice ? (
                                <div className="add-meal__modal-processing">
                                    <div className="add-meal__ai-animation">
                                        <div className="add-meal__ai-ring"></div>
                                        <div className="add-meal__ai-ring add-meal__ai-ring--delay1"></div>
                                        <div className="add-meal__ai-ring add-meal__ai-ring--delay2"></div>
                                        <span className="material-symbols-outlined add-meal__ai-icon">auto_awesome</span>
                                    </div>
                                    <p>Interpretando alimentos...</p>
                                    <span>Calculando valores nutricionais</span>
                                </div>
                            ) : isRecording ? (
                                <div className="add-meal__modal-recording">
                                    <div className="add-meal__pulse"></div>
                                    <p>Fale os alimentos e quantidades</p>
                                    <span>Ex: "Arroz 150 gramas, frango 200 gramas"</span>
                                </div>
                            ) : voiceTranscript ? (
                                <div className="add-meal__modal-transcript">
                                    <p>"{voiceTranscript}"</p>
                                </div>
                            ) : (
                                <p className="add-meal__modal-empty">Nenhuma transcrição detectada</p>
                            )}
                        </div>

                        {!isRecording && !processingVoice && (
                            <div className="add-meal__modal-actions">
                                <button
                                    className="add-meal__modal-btn add-meal__modal-btn--secondary"
                                    onClick={handleRetryVoice}
                                >
                                    <span className="material-symbols-outlined">refresh</span>
                                    Falar Novamente
                                </button>
                                {voiceTranscript && (
                                    <button
                                        className="add-meal__modal-btn add-meal__modal-btn--primary"
                                        onClick={handleConfirmVoice}
                                    >
                                        <span className="material-symbols-outlined">check</span>
                                        Confirmar
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CTA */}
            <div className="add-meal__cta">
                <Button
                    fullWidth
                    size="lg"
                    icon="check_circle"
                    onClick={handleSave}
                    disabled={!calculated || saving}
                >
                    {saving ? 'Salvando...' : 'Salvar Refeição'}
                </Button>
            </div>

            {/* Bottom Navigation - Componente reutilizável */}
            <BottomNav showFab={false} />
        </div>
    );
};
