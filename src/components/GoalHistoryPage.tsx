import { CATEGORIES, type CategoryId } from '../domain/categories';
import type { Goal } from '../domain/models';
import { useHomeSchoolState } from '../state/HomeSchoolProvider';

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function PreviousGoalsPage({
  categoryId,
  onBack,
}: {
  categoryId: CategoryId;
  onBack: () => void;
}) {
  const { state } = useHomeSchoolState();
  const category = CATEGORIES.find((item) => item.id === categoryId)!;
  const completedGoals = state.goals
    .filter((goal) => goal.categoryId === categoryId && goal.status === 'completed')
    .sort((first, second) => (second.completedAt ?? '').localeCompare(first.completedAt ?? ''));
  const removedGoals = state.goals
    .filter((goal) => goal.categoryId === categoryId && goal.status === 'deleted')
    .sort((first, second) => (second.deletedAt ?? '').localeCompare(first.deletedAt ?? ''));

  return (
    <section className="project-page previous-goals-page" aria-labelledby="previous-goals-title">
      <button className="back-link" onClick={onBack} type="button">← Back to {category.name}</button>
      <header className="project-page-heading history-heading">
        <div>
          <p className="page-eyebrow">{category.name}</p>
          <h1 id="previous-goals-title">Previous Goals</h1>
        </div>
      </header>
      <div className="goal-history-sections">
        <GoalHistorySection goals={completedGoals} title="Completed" mode="completed" />
        <GoalHistorySection goals={removedGoals} title="Removed" mode="removed" />
      </div>
    </section>
  );
}

function GoalHistorySection({
  goals,
  title,
  mode,
}: {
  goals: Goal[];
  title: string;
  mode: 'completed' | 'removed';
}) {
  return (
    <section className="goal-history-section" aria-labelledby={`${mode}-goals-heading`}>
      <header className="goal-history-heading">
        <h2 id={`${mode}-goals-heading`}>{title}</h2>
        <span className="goal-count">{String(goals.length).padStart(2, '0')}</span>
      </header>
      <div className="goal-history-list" role="region" aria-label={`${title} goals`} tabIndex={0}>
        {goals.length ? goals.map((goal) => (
          <article className="goal-history-item" key={goal.id}>
            <h3>{goal.description || goal.title}</h3>
            {goal.dueAt && <p className="history-due-date">Due {formatDateTime(`${goal.dueAt}T12:00:00`)}</p>}
            {mode === 'completed' ? (
              <>
                <p className="goal-history-meta">Written {formatDateTime(goal.createdAt)}</p>
                <p className="goal-history-meta">Completed {goal.completedAt ? formatDateTime(goal.completedAt) : 'date not recorded'}</p>
              </>
            ) : (
              <>
                <p className="goal-history-meta">Written {formatDateTime(goal.createdAt)}</p>
                <p className="goal-history-meta">Removed {goal.deletedAt ? formatDateTime(goal.deletedAt) : 'date not recorded'}</p>
                <p className="goal-removal-reason"><span>Reason</span>{goal.removalReason || 'No reason recorded'}</p>
              </>
            )}
          </article>
        )) : (
          <p className="goal-history-empty">No {title.toLocaleLowerCase()} goals yet.</p>
        )}
      </div>
    </section>
  );
}