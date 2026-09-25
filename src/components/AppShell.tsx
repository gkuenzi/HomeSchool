import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  onOpenLearningChart: () => void;
}

export function AppShell({ children, onOpenLearningChart }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="app-brand" href="/">HomeSchool</a>
        <button className="chart-navigation" onClick={onOpenLearningChart} type="button">
          Learning Chart <span aria-hidden="true">↗</span>
        </button>
      </header>
      <main className="app-content">{children}</main>
    </div>
  );
}