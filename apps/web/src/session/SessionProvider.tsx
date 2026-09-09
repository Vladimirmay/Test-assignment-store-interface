import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createSession } from '../api/endpoints';

const STORAGE_KEY = 'checkout.sessionToken';

type SessionContextValue = { token: string };

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    if (token) return;
    let cancelled = false;
    createSession().then((session) => {
      if (cancelled) return;
      localStorage.setItem(STORAGE_KEY, session.token);
      setToken(session.token);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) return <p role="status">Загрузка…</p>;
  return <SessionContext.Provider value={{ token }}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}
