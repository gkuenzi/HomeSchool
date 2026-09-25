import type { HomeSchoolState } from '../domain/models';

export const STORAGE_VERSION = 1 as const;

export const createDefaultState = (): HomeSchoolState => ({
  version: STORAGE_VERSION,
  projects: [],
  pins: [],
  goals: [],
});