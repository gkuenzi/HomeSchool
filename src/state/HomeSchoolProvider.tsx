import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createLocalStorageRepository, type StateRepository } from '../data/localStorageRepository';
import { createDefaultState } from '../data/defaultState';
import type { HomeSchoolState } from '../domain/models';

interface HomeSchoolContextValue {
  state: HomeSchoolState;
  setState: (state: HomeSchoolState) => void;
}

const HomeSchoolContext = createContext<HomeSchoolContextValue | null>(null);

interface HomeSchoolProviderProps {
  children: ReactNode;
  repository?: StateRepository;
}

export function HomeSchoolProvider({ children, repository }: HomeSchoolProviderProps) {
  const [state, setState] = useState<HomeSchoolState>(() => {
    if (repository) return repository.load();

    try {
      return createLocalStorageRepository().load();
    } catch {
      return createDefaultState();
    }
  });

  useEffect(() => {
    try {
      (repository ?? createLocalStorageRepository()).save(state);
    } catch {
      // Persistence is best effort; the in-memory state remains usable.
    }
  }, [repository, state]);

  return (
    <HomeSchoolContext.Provider value={{ state, setState }}>
      {children}
    </HomeSchoolContext.Provider>
  );
}

export function useHomeSchoolState(): HomeSchoolContextValue {
  const context = useContext(HomeSchoolContext);
  if (!context) throw new Error('useHomeSchoolState must be used within HomeSchoolProvider');
  return context;
}