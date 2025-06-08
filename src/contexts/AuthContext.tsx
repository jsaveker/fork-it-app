import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import {
  GoogleOAuthProvider,
  googleLogout,
  useGoogleLogin,
} from '@react-oauth/google'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextProps {
  user: User | null;
  loginWithGoogle: () => void;
  logout: () => void;
  registerManual: (name: string) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthInnerProvider>{children}</AuthInnerProvider>
    </GoogleOAuthProvider>
  )
}

const AuthInnerProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) {
      setUser(JSON.parse(saved))
    }
  }, [])

  const login = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        })
        const data = await res.json()
        const profile: User = {
          id: tokenResponse.access_token,
          name: data.name || 'Google User',
          email: data.email || ''
        }
        setUser(profile)
        localStorage.setItem('user', JSON.stringify(profile))
      } catch (err) {
        console.error('Failed to fetch Google profile', err)
      }
    },
  })

  const loginWithGoogle = () => login()

  const logout = () => {
    googleLogout()
    setUser(null)
    localStorage.removeItem('user')
  }

  const registerManual = (name: string) => {
    const manualUser: User = { id: crypto.randomUUID(), name, email: '' }
    setUser(manualUser)
    localStorage.setItem('user', JSON.stringify(manualUser))
  }

  return (
    <AuthContext.Provider
      value={{ user, loginWithGoogle, logout, registerManual }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
