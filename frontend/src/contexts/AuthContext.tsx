import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { AuthContextType, User } from '../types/user';
import { googleSheetsService } from '@services/googleSheets';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'videosia_user';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastActivity, setLastActivity] = useState(Date.now());

    // Carregar usuário do localStorage ao iniciar
    useEffect(() => {
        const storedUser = localStorage.getItem(STORAGE_KEY);
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    // Auto-logout por inatividade
    useEffect(() => {
        const checkInactivity = () => {
            if (user && Date.now() - lastActivity > SESSION_TIMEOUT) {
                logout();
            }
        };

        const interval = setInterval(checkInactivity, 60000); // Verifica a cada minuto
        return () => clearInterval(interval);
    }, [user, lastActivity]);

    // Atualizar última atividade
    useEffect(() => {
        const updateActivity = () => setLastActivity(Date.now());

        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keypress', updateActivity);
        window.addEventListener('click', updateActivity);

        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keypress', updateActivity);
            window.removeEventListener('click', updateActivity);
        };
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const userRow = await googleSheetsService.validateCredentials(email, password);

            if (!userRow) {
                throw new Error('Email ou senha inválidos');
            }

            const authenticatedUser: User = {
                usuario: userRow.Usuario,
                email: userRow.Email,
            };

            setUser(authenticatedUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
            setLastActivity(Date.now());
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
