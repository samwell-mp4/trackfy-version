import type { ReactNode } from 'react';
import { createContext, useState, useEffect } from 'react';
import type { AuthContextType, User } from '@/types/auth.types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:8052' : '');

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for saved user and token in localStorage on load
        const savedUser = localStorage.getItem('videosia_user');
        const savedToken = localStorage.getItem('videosia_token');

        if (savedUser && savedToken) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse saved user', e);
                localStorage.removeItem('videosia_user');
                localStorage.removeItem('videosia_token');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // Call backend API for login
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Email ou senha inválidos');
            }

            const { token, user: userData } = await response.json();

            const userToSave: User = {
                id: userData.id.toString(),
                usuario: userData.usuario,
                email: userData.email
            };

            // Save to state and localStorage
            setUser(userToSave);
            localStorage.setItem('videosia_user', JSON.stringify(userToSave));
            localStorage.setItem('videosia_token', token);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('videosia_user');
        localStorage.removeItem('videosia_token');
    };

    const value: AuthContextType = {
        user,
        token: localStorage.getItem('videosia_token'),
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
