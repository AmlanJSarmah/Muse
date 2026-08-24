import { createContext, useContext, useState, type FC, type PropsWithChildren } from 'react';

interface AuthContextValue {
    token: string | null;
    userId: string | null;
    isAuthenticated: boolean;
    login: (token: string, userId: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
    const [userId, setUserId] = useState<string | null>(localStorage.getItem('user_id'));

    const login = (newToken: string, newUserId: string) => {
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('user_id', newUserId);
        setToken(newToken);
        setUserId(newUserId);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        setToken(null);
        setUserId(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                userId,
                isAuthenticated: !!token,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};