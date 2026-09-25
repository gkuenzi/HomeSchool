export const CATEGORIES = [
  { id: 'data-analysis', name: 'Data Analysis' },
  { id: 'vibe-coding', name: 'Vibe Coding' },
  { id: 'python-backend', name: 'Python/Backend' },
  { id: 'networking-cyber-security', name: 'Networking/Cyber Security' },
  { id: 'robotics', name: 'Robotics' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];