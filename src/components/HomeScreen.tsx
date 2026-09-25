import { useEffect, useState } from 'react';
import { CATEGORIES, type CategoryId } from '../domain/categories';
import { getWeekStartDate, toDateKey } from '../domain/dates';
import type { Goal, Project } from '../domain/models';
import { useHomeSchoolState } from '../state/HomeSchoolProvider';
import { CategoryTabs } from './CategoryTabs';

interface HomeScreenProps {
  onOpenLearningChart: () => void;
  onSelectCategory: (categoryId: CategoryId) => void;
}

function compareGoals(first: Goal, second: Goal): number {
  const dueDateOrder = (first.dueAt ?? '').localeCompare(second.dueAt ?? '');
  return dueDateOrder || first.title.localeCompare(second.title);
}

function formatDueDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

export function HomeScreen({ onOpenLearningChart, onSelectCategory }: HomeScreenProps) {
  const { state, setState } = useHomeSchoolState();
  const [projectIndex, setProjectIndex] = useState(0);
  const weekStart = getWeekStartDate();
  const today = toDateKey(new Date());
  const checkedCategories = state.weeklyChecklist?.weekStart === weekStart
    ? state.weeklyChecklist.completedCategoryIds
    : [];

  useEffect(() => {
    if (state.weeklyChecklist?.weekStart !== weekStart) {
      setState({
        ...state,
        weeklyChecklist: { weekStart, completedCategoryIds: [] },
      });
    }
  }, [setState, state, weekStart]);

  const projects = state.projects.filter((project) => project.status !== 'completed');
  const goals = state.goals.filter(
    (goal) => goal.status === 'active' && goal.dueAt,
  );
  const dueThisWeek = goals
    .filter((goal) => {
      const dueDate = goal.dueAt!.slice(0, 10);
      return dueDate >= today && dueDate < getNextWeekStart(weekStart);
    })
    .sort(compareGoals);
  const overdueGoals = goals
    .filter((goal) => goal.dueAt!.slice(0, 10) < today)
    .sort(compareGoals);
  const currentProject = projects[projectIndex];

  function toggleCategory(categoryId: CategoryId) {
    const completedCategoryIds = checkedCategories.includes(categoryId)
      ? checkedCategories.filter((checkedId) => checkedId !== categoryId)
      : [...checkedCategories, categoryId];
    setState({
      ...state,
      weeklyChecklist: { weekStart, completedCategoryIds },
    });
  }

  return (
    <section className="home-screen" aria-labelledby="home-title">
      <div className="home-heading">
        <div>
          <p className="page-eyebrow">Your learning workspace</p>
          <h1 id="home-title">HomeSchool</h1>
        </div>
        <button className="text-link chart-link" onClick={onOpenLearningChart} type="button">
          View Learning Chart <span aria-hidden="true">→</span>
        </button>
      </div>

      <CategoryTabs selectedCategory={null} onSelectCategory={onSelectCategory} />

      <div className="dashboard-grid">
        <section className="dashboard-panel projects-panel" aria-labelledby="projects-title">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Build something</p>
              <h2 id="projects-title">Projects in Progress</h2>
            </div>
            {projects.length > 1 && (
              <div className="carousel-controls" aria-label="Project carousel controls">
                <button
                  aria-label="Previous project"
                  disabled={projectIndex === 0}
                  onClick={() => setProjectIndex((index) => Math.max(0, index - 1))}
                  type="button"
                >
                  ←
                </button>
                <span>{projectIndex + 1} / {projects.length}</span>
                <button
                  aria-label="Next project"
                  disabled={projectIndex >= projects.length - 1}
                  onClick={() => setProjectIndex((index) => Math.min(projects.length - 1, index + 1))}
                  type="button"
                >
                  →
                </button>
              </div>
            )}
          </div>
          {currentProject ? (
            <ProjectSlide project={currentProject} goals={state.goals} />
          ) : (
            <p className="empty-projects">
              <span className="empty-mark" aria-hidden="true">+</span>
              No projects in progress yet.
            </p>
          )}
        </section>

        <section className="dashboard-panel checklist-panel" aria-labelledby="checklist-title">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">A little progress, every week</p>
              <h2 id="checklist-title">Weekly Checklist</h2>
            </div>
            <span className="week-label">Week of {formatDueDate(weekStart)}</span>
          </div>
          <ul className="checklist-list">
            {CATEGORIES.map((category, index) => {
              const checked = checkedCategories.includes(category.id);
              return (
                <li className={checked ? 'checklist-item is-checked' : 'checklist-item'} key={category.id}>
                  <span className={`category-index category-index-${index + 1}`}>0{index + 1}</span>
                  <span className="checklist-category">{category.name}</span>
                  <button
                    aria-label={`${checked ? 'Mark' : 'Complete'} ${category.name} for this week`}
                    aria-pressed={checked}
                    className="check-toggle"
                    onClick={() => toggleCategory(category.id)}
                    type="button"
                  >
                    {checked ? 'Done' : 'Mark done'}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <GoalSection goals={dueThisWeek} title="Goals due this week" emptyMessage="Nothing due this week. Make room to explore." />
        <GoalSection goals={overdueGoals} title="Overdue Goals" emptyMessage="You’re all caught up on past due goals." overdue />
      </div>
    </section>
  );
}

function getNextWeekStart(weekStart: string): string {
  const nextMonday = new Date(`${weekStart}T12:00:00`);
  nextMonday.setDate(nextMonday.getDate() + 7);
  return toDateKey(nextMonday);
}

function ProjectSlide({ project, goals }: { project: Project; goals: Goal[] }) {
  const category = CATEGORIES.find((item) => item.id === project.categoryId);
  const activeGoalCount = goals.filter(
    (goal) => goal.projectId === project.id && goal.status === 'active',
  ).length;

  return (
    <article className="project-slide">
      <div className="project-meta">
        <span className="project-category">{category?.name ?? 'Project'}</span>
        <span>{activeGoalCount} active {activeGoalCount === 1 ? 'goal' : 'goals'}</span>
      </div>
      <h3>{project.name}</h3>
      <p>{project.description || 'A new idea taking shape.'}</p>
      <time dateTime={project.updatedAt} className="project-updated">
        Updated {formatDueDate(project.updatedAt)}
      </time>
    </article>
  );
}

function GoalSection({
  goals,
  title,
  emptyMessage,
  overdue = false,
}: {
  goals: Goal[];
  title: string;
  emptyMessage: string;
  overdue?: boolean;
}) {
  return (
    <section className={overdue ? 'dashboard-panel goals-panel overdue-panel' : 'dashboard-panel goals-panel'} aria-labelledby={overdue ? 'overdue-title' : 'due-title'}>
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">{overdue ? 'Pick up where you left off' : 'Coming up'}</p>
          <h2 id={overdue ? 'overdue-title' : 'due-title'}>{title}</h2>
        </div>
        <span className="goal-count">{String(goals.length).padStart(2, '0')}</span>
      </div>
      <div className="goal-scroll" role="region" aria-label={title} tabIndex={0}>
        {goals.length ? (
          <ul className="goal-list">
            {goals.map((goal) => {
              const category = CATEGORIES.find((item) => item.id === goal.categoryId);
              return (
                <li className="goal-item" key={goal.id}>
                  <div>
                    <h3>{goal.title}</h3>
                    <span>{category?.name ?? 'Goal'}</span>
                  </div>
                  <time dateTime={goal.dueAt!.slice(0, 10)}>{formatDueDate(goal.dueAt!)}</time>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-goals">{emptyMessage}</p>
        )}
      </div>
    </section>
  );
}