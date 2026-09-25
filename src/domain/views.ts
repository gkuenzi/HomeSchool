export const VIEWS = [
  'overview',
  'projects',
  'pins',
  'goals',
  'completed-goals',
  'deleted-goals',
] as const;

export type ViewId = (typeof VIEWS)[number];