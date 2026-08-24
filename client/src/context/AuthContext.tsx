import { createContext, useContext, useState, type FC, type PropsWithChildren } from 'react';

interface AuthContextValue {
    token: string | null;
    username: string | null;
    email: string | null;
    expiresAt: string | null;
    isAuthenticated: boolean;
    login: (token: string, username: string, email: string, expiresAt: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
    const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
    const [email, setEmail] = useState<string | null>(localStorage.getItem('email'));
    const [expiresAt, setExpiresAt] = useState<string | null>(localStorage.getItem('token_expires_at'));

    const login = (newToken: string, newUsername: string, newEmail: string, newExpiresAt: string) => {
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('username', newUsername);
        localStorage.setItem('email', newEmail);
        localStorage.setItem('token_expires_at', newExpiresAt);
        setToken(newToken);
        setUsername(newUsername);
        setEmail(newEmail);
        setExpiresAt(newExpiresAt);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('token_expires_at');
        setToken(null);
        setUsername(null);
        setEmail(null);
        setExpiresAt(null);
    };

    return (
        <AuthContext.Provider value={{ token, username, email, expiresAt, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
