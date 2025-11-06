import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type UserContextValue = {
  name: string;
  setName: (value: string) => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState('');
  const value = useMemo(() => ({ name, setName }), [name]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
