export interface User {
    usuario: string;
    email: string;
}

export interface UserRow {
    Usuario: string;
    Email: string;
    Senha: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

export interface LoginCredentials {
    email: string;
    password: string;
}
