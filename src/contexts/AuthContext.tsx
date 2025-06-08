import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GoogleOAuthProvider, googleLogout, useGoogleLogin } from '@react-oauth/google';

interface User {
  id: string;
  name: string;
}

interface AuthContextProps {
  user: User | null;
  loginWithGoogle: () => void;
  logout: () => void;
  registerManual: (name: string) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      const profile: User = {
        id: tokenResponse.access_token,
        name: 'Google User',
      };
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    },
  });

  const loginWithGoogle = () => login();

  const logout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('user');
  };

  const registerManual = (name: string) => {
    const manualUser: User = { id: crypto.randomUUID(), name };
    setUser(manualUser);
    localStorage.setItem('user', JSON.stringify(manualUser));
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthContext.Provider value={{ user, loginWithGoogle, logout, registerManual }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
