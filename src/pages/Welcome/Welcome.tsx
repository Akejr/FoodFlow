import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import './Welcome.css';

const features = [
    {
        icon: 'analytics',
        title: 'Metas Definidas por IA',
        description: 'Objetivos nutricionais inteligentes adaptados especificamente para sua rotina.',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop'
    },
    {
        icon: 'timeline',
        title: 'Acompanhe a Consistência',
        description: 'Foque na construção de hábitos de longo prazo e constância, sem a neura de contar cada caloria.',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop'
    },
    {
        icon: 'sync_alt',
        title: 'Feedback Automatizado',
        description: 'Receba insights instantâneos sincronizados diretamente com seu personal trainer.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'
    }
];

export const Welcome: React.FC = () => {
    const navigate = useNavigate();
    const [activeSlide, setActiveSlide] = React.useState(0);

    const handleStart = () => {
        navigate('/onboarding');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="welcome">
            {/* Header */}
            <header className="welcome__header">
                <div className="welcome__logo">
                    <span className="material-symbols-outlined">smart_toy</span>
                    <h1>FoodFlow</h1>
                </div>
                <button className="welcome__skip" onClick={handleLogin}>Pular</button>
            </header>

            {/* Hero */}
            <section className="welcome__hero">
                <h2 className="welcome__title">
                    Potencialize sua Dieta <br />
                    <span className="text-primary">com Inteligência Artificial.</span>
                </h2>
                <p className="welcome__subtitle">
                    Metas inteligentes, rastreamento de hábitos e feedback automático para sua evolução.
                </p>
            </section>

            {/* Feature Carousel */}
            <div className="welcome__carousel">
                <div
                    className="welcome__slides no-scrollbar"
                    onScroll={(e) => {
                        const scrollLeft = e.currentTarget.scrollLeft;
                        const slideWidth = e.currentTarget.offsetWidth * 0.85;
                        const newSlide = Math.round(scrollLeft / slideWidth);
                        setActiveSlide(newSlide);
                    }}
                >
                    {features.map((feature, index) => (
                        <div key={index} className="welcome__slide">
                            <div
                                className="welcome__slide-image"
                                style={{ backgroundImage: `url(${feature.image})` }}
                            >
                                <div className="welcome__slide-icon-wrapper">
                                    <span className="material-symbols-outlined">{feature.icon}</span>
                                </div>
                            </div>
                            <div className="welcome__slide-content">
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dots */}
                <div className="welcome__dots">
                    {features.map((_, index) => (
                        <div
                            key={index}
                            className={`welcome__dot ${index === activeSlide ? 'welcome__dot--active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="welcome__cta">
                <Button
                    fullWidth
                    size="lg"
                    icon="arrow_forward"
                    onClick={handleStart}
                >
                    Iniciar Cadastro
                </Button>

                <button className="welcome__login-link" onClick={handleLogin}>
                    Já tenho conta ou código de convite
                </button>

                <div className="welcome__disclaimer">
                    <span className="material-symbols-outlined">info</span>
                    <p>
                        <strong>Nota:</strong> Esta ferramenta apoia sua jornada, mas não substitui um nutricionista certificado.
                    </p>
                </div>
            </div>
        </div>
    );
};
