export interface User {
    id: string;
    usuario: string;
    email: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface UserRow {
    Usuario: string;
    Email: string;
    Senha: string;
}
