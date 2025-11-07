import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Team = {
  name: string;
  points: number;
  color: string;
  activity: Activity[];
};

export type Activity = { title: string; timeAgo: string };

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
};

type UserContextValue = {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  isProfileHydrated: boolean;
  isLoading: boolean;
  setUserProfile: (profile: UserProfile) => void;
  logout: () => Promise<void>;
  teams: Team[];
  setTeams: React.Dispatch<SetStateAction<Team[]>>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isProfileHydrated, setProfileHydrated] = useState(false);
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
  ]);

  useEffect(() => {
    AsyncStorage.getItem('cq:user-profile')
      .then((stored) => {
        if (!stored) return;
        try {
          const parsed = JSON.parse(stored) as Partial<UserProfile>;
          setProfile((prev) => ({
            firstName: parsed.firstName ?? prev.firstName,
            lastName: parsed.lastName ?? prev.lastName,
            email: parsed.email ?? prev.email,
          }));
        } catch {
          // ignore malformed cache
        }
      })
      .finally(() => setProfileHydrated(true));
  }, []);

  useEffect(() => {
    if (!isProfileHydrated) return;
    const isEmptyProfile = !profile.firstName && !profile.lastName && !profile.email;
    if (isEmptyProfile) {
      AsyncStorage.removeItem('cq:user-profile').catch(() => {});
      return;
    }
    AsyncStorage.setItem('cq:user-profile', JSON.stringify(profile)).catch(() => {});
  }, [isProfileHydrated, profile]);

  const setUserProfile = useCallback((nextProfile: UserProfile) => {
    setProfile(nextProfile);
  }, []);

  const name = useMemo(() => {
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    return fullName || 'Explorer';
  }, [profile.firstName, profile.lastName]);

  const { firstName, lastName, email } = profile;

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('cq:user-profile');
    setProfile({
      firstName: '',
      lastName: '',
      email: '',
    });
  }, []);

  const value = useMemo(
    () => ({
      name,
      firstName,
      lastName,
      email,
      isProfileHydrated,
      isLoading: !isProfileHydrated,
      setUserProfile,
      logout,
      teams,
      setTeams,
    }),
    [email, firstName, isProfileHydrated, lastName, logout, name, setUserProfile, teams]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
