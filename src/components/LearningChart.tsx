import { CATEGORIES } from '../domain/categories';
import { useHomeSchoolState } from '../state/HomeSchoolProvider';

interface LearningChartProps {
  onBack: () => void;
}

export function LearningChart({ onBack }: LearningChartProps) {
  const { state } = useHomeSchoolState();

  return (
    <section className="learning-chart" aria-labelledby="chart-title">
      <button className="back-link" onClick={onBack} type="button">← Back to HomeSchool</button>
      <header className="chart-heading">
        <p className="page-eyebrow">Your progress at a glance</p>
        <h1 id="chart-title">Learning Chart</h1>
        <p>Completed goals across your learning categories.</p>
      </header>
      <div className="chart-rows">
        {CATEGORIES.map((category, index) => {
          const categoryGoals = state.goals.filter(
            (goal) => goal.categoryId === category.id && goal.status !== 'deleted',
          );
          const completed = categoryGoals.filter((goal) => goal.status === 'completed').length;
          const progress = categoryGoals.length ? Math.round((completed / categoryGoals.length) * 100) : 0;

          return (
            <div className="chart-row" key={category.id}>
              <div className="chart-row-label">
                <span className={`category-index category-index-${index + 1}`}>0{index + 1}</span>
                <span>{category.name}</span>
              </div>
              <div className="chart-track" aria-label={`${progress}% complete`} role="img">
                <span style={{ width: `${progress}%` }} />
              </div>
              <span className="chart-progress">{completed}/{categoryGoals.length}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}