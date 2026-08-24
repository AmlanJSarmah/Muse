import { useState, type FC, type SyntheticEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/apiClient';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const { login } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (isLogin) {
                const res = await authService.login({ email, passwordHash: password });
                login(res.token, res.userId);
            } else {
                const res = await authService.register({ email, passwordHash: password, username });
                login(res.token, res.userId);
            }
            onClose();
        } catch {
            alert('Authentication failed. Check your credentials.');
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: '#181818',
                    padding: '24px',
                    borderRadius: '8px',
                    width: '340px',
                    color: '#fff',
                }}
            >
                <h2 style={{ margin: '0 0 16px', fontSize: '20px' }}>
                    {isLogin ? 'Log In' : 'Sign Up'}
                </h2>

                <form
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #333',
                                backgroundColor: '#282828',
                                color: '#fff',
                            }}
                        />
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #333',
                            backgroundColor: '#282828',
                            color: '#fff',
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #333',
                            backgroundColor: '#282828',
                            color: '#fff',
                        }}
                    />

                    <button
                        type="submit"
                        style={{
                            marginTop: '8px',
                            padding: '10px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: '#1db954',
                            color: '#fff',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px' }}>
                    <span style={{ color: '#aaa' }}>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        marginTop: '12px',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '12px',
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};