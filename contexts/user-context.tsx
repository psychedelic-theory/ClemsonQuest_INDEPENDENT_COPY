import { createContext, SetStateAction, useContext, useMemo, useState, type ReactNode } from 'react';

export type Team = {
  name: string;
  points: number;
  color: string;
  activity: Activity[];
}

export type Activity = { title: string, timeAgo: string };

type UserContextValue = {
  name: string;
  setName: (value: string) => void;
  teams: Team[];
  setTeams: React.Dispatch<SetStateAction<Team[]>>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState('');
  const [teams, setTeams] = useState<Team[]>([
  {
      name: 'Orange Team',
      points: 3050,
      color: '#F56600',
      activity: [
        { title: 'Sarah completed "Library Photo"', timeAgo: '2m ago' },
      ]
    },
  {
      name: 'Blue Team',
      points: 2850,
      color: '#2979FF',
      activity: [
        { title: 'Blue Team gained 200 pts', timeAgo: '5m ago' },
      ]
    },
    {
      name: 'Purple Team',
      points: 2720,
      color: '#9C27B0',
      activity: [

      ]
    },
])
  const value = useMemo(() => ({
    name,
    setName,
    teams,
    setTeams
  }), [name, teams]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
