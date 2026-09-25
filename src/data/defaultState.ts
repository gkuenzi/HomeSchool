import type { HomeSchoolState } from '../domain/models';
import { getWeekStartDate } from '../domain/dates';

export const STORAGE_VERSION = 1 as const;

export const createDefaultState = (): HomeSchoolState => ({
  version: STORAGE_VERSION,
  projects: [],
  pins: [],
  goals: [],
  weeklyChecklist: {
    weekStart: getWeekStartDate(),
    completedCategoryIds: [],
  },
});