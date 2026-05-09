import { createContext, useContext, useState, type ReactNode } from 'react';
import { loginApi } from '@/api/auth.api';
import type { UserResponse } from '@/types/auth.types';

interface AuthContextValue {
    user: UserResponse | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('eoms_token'));
    const [user, setUser] = useState<UserResponse | null>(() => {
        const stored = sessionStorage.getItem('eoms_user');
        return stored ? JSON.parse(stored) as UserResponse : null;
    });

    const login = async (email: string, password: string) => {
        const response = await loginApi(email, password);
        sessionStorage.setItem('eoms_token', response.token);
        sessionStorage.setItem('eoms_user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
    };

    const logout = () => {
        sessionStorage.removeItem('eoms_token');
        sessionStorage.removeItem('eoms_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}