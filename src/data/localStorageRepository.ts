import { createDefaultState, STORAGE_VERSION } from './defaultState';
import type { HomeSchoolState } from '../domain/models';

export const HOME_SCHOOL_STORAGE_KEY = 'homeschool.state';

const isHomeSchoolState = (value: unknown): value is HomeSchoolState => {
  if (!value || typeof value !== 'object') return false;

  const state = value as Partial<HomeSchoolState>;
  return (
    state.version === STORAGE_VERSION &&
    Array.isArray(state.projects) &&
    Array.isArray(state.pins) &&
    Array.isArray(state.goals)
  );
};

export interface StateRepository {
  load(): HomeSchoolState;
  save(state: HomeSchoolState): void;
  clear(): void;
}

export const createLocalStorageRepository = (
  storage: Storage = window.localStorage,
  key = HOME_SCHOOL_STORAGE_KEY,
): StateRepository => ({
  load() {
    try {
      const storedValue = storage.getItem(key);
      if (!storedValue) return createDefaultState();

      const parsedValue: unknown = JSON.parse(storedValue);
      return isHomeSchoolState(parsedValue) ? parsedValue : createDefaultState();
    } catch {
      return createDefaultState();
    }
  },
  save(state) {
    storage.setItem(key, JSON.stringify(state));
  },
  clear() {
    storage.removeItem(key);
  },
});