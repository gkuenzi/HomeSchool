import type { CategoryId } from './categories';

export type EntityId = string;

export type GoalStatus = 'active' | 'completed' | 'deleted';
export type ProjectDifficulty = 'easy' | 'medium' | 'hard';
export type ProjectStatus = 'in-progress' | 'on-hold' | 'completed';

export interface Project {
  id: EntityId;
  categoryId: CategoryId;
  name: string;
  description: string;
  difficulty?: ProjectDifficulty;
  status?: ProjectStatus;
  finishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pin {
  id: EntityId;
  categoryId: CategoryId;
  title: string;
  url: string;
  note: string;
  createdAt: string;
}

export interface Goal {
  id: EntityId;
  categoryId: CategoryId;
  projectId: EntityId | null;
  title: string;
  description: string;
  dueAt?: string | null;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  deletedAt: string | null;
  removalReason?: string | null;
}

export interface HomeSchoolState {
  version: 1;
  projects: Project[];
  pins: Pin[];
  goals: Goal[];
  weeklyChecklist: {
    weekStart: string;
    completedCategoryIds: CategoryId[];
  };
}

export type SortDirection = 'asc' | 'desc';
export type SortField = 'createdAt' | 'updatedAt' | 'name' | 'title';

export interface CollectionQuery {
  categoryId?: CategoryId;
  projectId?: EntityId;
  status?: GoalStatus;
  sortBy?: SortField;
  sortDirection?: SortDirection;
}