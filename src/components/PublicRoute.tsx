import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from './ui';

interface PublicRouteProps {
    children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
    const { user, loading } = useAuth();

    // Se estiver carregando, mostra loading screen
    if (loading) {
        return (
            <LoadingScreen
                message="Iniciando..."
                showLogo={true}
            />
        );
    }

    // Se usuário JÁ estiver logado, redireciona para Dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    // Se não estiver logado, permite ver a página pública (Welcome, Login, etc)
    return <>{children}</>;
};
