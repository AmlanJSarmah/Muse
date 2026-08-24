import { useState, type FC, type SyntheticEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/apiClient';
import { useToast } from '../context/ToastContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = isLogin
                ? await authService.login(email, password)
                : await authService.register(username, email, password);

            login(response.token, response.username, response.email, response.expiresAt);
            showToast(isLogin ? 'Logged in successfully.' : 'Account created successfully.', 'success');
            onClose();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Authentication failed.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#181818', padding: 24, borderRadius: 8, width: 340, color: '#fff' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: 20 }}>{isLogin ? 'Log In' : 'Sign Up'}</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            minLength={1}
                            required
                            style={{ padding: 10, borderRadius: 4, border: '1px solid #333', backgroundColor: '#282828', color: '#fff' }}
                        />
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: 10, borderRadius: 4, border: '1px solid #333', backgroundColor: '#282828', color: '#fff' }}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                        style={{ padding: 10, borderRadius: 4, border: '1px solid #333', backgroundColor: '#282828', color: '#fff' }}
                    />

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{ marginTop: 8, padding: 10, borderRadius: 20, border: 'none', backgroundColor: '#1db954', color: '#fff', fontWeight: 'bold', cursor: submitting ? 'wait' : 'pointer' }}
                    >
                        {submitting ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13 }}>
                    <span style={{ color: '#aaa' }}>{isLogin ? "Don't have an account? " : 'Already have an account? '}</span>
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ background: 'none', border: 'none', color: '#fff', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    style={{ marginTop: 12, width: '100%', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12 }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};
