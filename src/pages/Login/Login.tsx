import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Button, Input } from '../../components/ui';
import './Login.css';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ❌ REMOVIDO: useEffect que causava race condition após logout
    // O AuthContext já cuida do redirect via PublicRoute

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Timeout de segurança (10 segundos)
        const timeout = setTimeout(() => {
            setLoading(false);
            setError('O login demorou muito. Verifique sua conexão.');
        }, 10000);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) throw signInError;

            // AuthContext detectará o login via onAuthStateChange
            // e o PublicRoute redirecionará para /dashboard
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login');
            setLoading(false);
        } finally {
            clearTimeout(timeout);
        }
    };

    return (
        <div className="login">
            <div className="login__content">
                {/* Logo */}
                <div className="login__logo">
                    <span className="material-symbols-outlined">restaurant</span>
                    <h1>FoodFlow</h1>
                </div>

                {/* Title */}
                <div className="login__header">
                    <h2 className="login__title">Bem-vindo de volta!</h2>
                    <p className="login__subtitle">Entre para continuar sua jornada</p>
                </div>

                {/* Form */}
                <form className="login__form" onSubmit={handleLogin}>
                    {error && (
                        <div className="login__error">
                            <span className="material-symbols-outlined">error</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <Input
                        label="E-mail"
                        type="email"
                        placeholder="seu@email.com"
                        iconLeft="mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Senha"
                        type="password"
                        placeholder="••••••••"
                        iconLeft="lock"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="button" className="login__forgot">
                        Esqueci minha senha
                    </button>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>

                {/* Register Link */}
                <div className="login__register">
                    <p>Ainda não tem conta?</p>
                    <button onClick={() => navigate('/')}>
                        Criar conta gratuita
                    </button>
                </div>
            </div>
        </div>
    );
};
