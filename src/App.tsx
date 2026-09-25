import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { CategoryScreen } from './components/CategoryScreen';
import { HomeScreen } from './components/HomeScreen';
import { LearningChart } from './components/LearningChart';
import { PreviousPinsPage } from './components/PinPages';
import { PreviousGoalsPage } from './components/GoalHistoryPage';
import { CreateProjectPage, PreviousProjectsPage } from './components/ProjectPages';
import type { CategoryId } from './domain/categories';

type AppPage =
  | { type: 'home' }
  | { type: 'category'; categoryId: CategoryId }
  | { type: 'create-project'; categoryId: CategoryId }
  | { type: 'previous-projects'; categoryId: CategoryId }
  | { type: 'previous-pins'; categoryId: CategoryId }
  | { type: 'previous-goals'; categoryId: CategoryId }
  | { type: 'learning-chart' };

export function App() {
  const [page, setPage] = useState<AppPage>({ type: 'home' });

  return (
    <AppShell onOpenLearningChart={() => setPage({ type: 'learning-chart' })}>
      {page.type === 'learning-chart' ? (
        <LearningChart onBack={() => setPage({ type: 'home' })} />
      ) : page.type === 'create-project' ? (
        <CreateProjectPage
          categoryId={page.categoryId}
          onCancel={() => setPage({ type: 'category', categoryId: page.categoryId })}
          onCreated={() => setPage({ type: 'category', categoryId: page.categoryId })}
        />
      ) : page.type === 'previous-projects' ? (
        <PreviousProjectsPage
          categoryId={page.categoryId}
          onBack={() => setPage({ type: 'category', categoryId: page.categoryId })}
        />
      ) : page.type === 'previous-pins' ? (
        <PreviousPinsPage
          categoryId={page.categoryId}
          onBack={() => setPage({ type: 'category', categoryId: page.categoryId })}
        />
      ) : page.type === 'previous-goals' ? (
        <PreviousGoalsPage
          categoryId={page.categoryId}
          onBack={() => setPage({ type: 'category', categoryId: page.categoryId })}
        />
      ) : page.type === 'category' ? (
        <CategoryScreen
          categoryId={page.categoryId}
          key={page.categoryId}
          onSelectCategory={(categoryId) => setPage({ type: 'category', categoryId })}
          onCreateProject={() => setPage({ type: 'create-project', categoryId: page.categoryId })}
          onOpenPreviousProjects={() => setPage({ type: 'previous-projects', categoryId: page.categoryId })}
          onOpenPreviousPins={() => setPage({ type: 'previous-pins', categoryId: page.categoryId })}
          onOpenPreviousGoals={() => setPage({ type: 'previous-goals', categoryId: page.categoryId })}
        />
      ) : (
        <HomeScreen
          onOpenLearningChart={() => setPage({ type: 'learning-chart' })}
          onSelectCategory={(categoryId) => setPage({ type: 'category', categoryId })}
        />
      )}
    </AppShell>
  );
}