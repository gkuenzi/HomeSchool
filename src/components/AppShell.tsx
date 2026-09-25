import type { ReactNode } from 'react';
import { CATEGORIES } from '../domain/categories';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="app-brand" href="/">HomeSchool</a>
        <span className="app-header-label">Progress workspace</span>
      </header>
      <div className="app-body">
        <aside className="category-navigation" aria-label="Categories">
          <p className="navigation-label">Categories</p>
          <nav>
            <ul>
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <button type="button" disabled>{category.name}</button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}