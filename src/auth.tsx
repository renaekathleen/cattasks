import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';

interface AuthState {
  accessToken: string | null;
  userName: string | null;
  userPhoto: string | null;
}

interface AuthContextValue extends AuthState {
  signIn: () => void;
  signOut: () => void;
  isSignedIn: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    accessToken: null,
    userName: null,
    userPhoto: null,
  });

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/tasks',
    onSuccess: async (tokenResponse) => {
      const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      }).then((r) => r.json());

      setAuth({
        accessToken: tokenResponse.access_token,
        userName: userInfo.name ?? userInfo.email ?? 'User',
        userPhoto: userInfo.picture ?? null,
      });
    },
    onError: (error) => {
      console.error('Google login failed:', error);
    },
  });

  const signIn = useCallback(() => login(), [login]);

  const signOut = useCallback(() => {
    googleLogout();
    setAuth({ accessToken: null, userName: null, userPhoto: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        signIn,
        signOut,
        isSignedIn: auth.accessToken !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
