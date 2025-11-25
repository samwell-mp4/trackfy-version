import type { ReactNode } from 'react';
import { createContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthContextType, User } from '@/types/auth.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for saved user in localStorage on load
        const savedUser = localStorage.getItem('videosia_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse saved user', e);
                localStorage.removeItem('videosia_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // Simple query to the 'users' table matching email and password
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .single();

            if (error) {
                throw new Error('Email ou senha inválidos');
            }

            if (data) {
                const userData: User = {
                    id: data.id.toString(),
                    usuario: data.usuario,
                    email: data.email
                };

                // Save to state and localStorage
                setUser(userData);
                localStorage.setItem('videosia_user', JSON.stringify(userData));
            } else {
                throw new Error('Email ou senha inválidos');
            }
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
    };

    const value: AuthContextType = {
        user,
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
