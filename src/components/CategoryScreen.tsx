import { useState } from 'react';
import { CATEGORIES, type CategoryId } from '../domain/categories';
import type { Pin, Project, ProjectDifficulty, ProjectStatus } from '../domain/models';
import { useHomeSchoolState } from '../state/HomeSchoolProvider';
import { CategoryTabs } from './CategoryTabs';
import { GoalChat } from './GoalChat';

interface CategoryScreenProps {
  categoryId: CategoryId;
  onSelectCategory: (categoryId: CategoryId) => void;
  onCreateProject: () => void;
  onOpenPreviousProjects: () => void;
  onOpenPreviousPins: () => void;
  onOpenPreviousGoals: () => void;
}

const difficultyLabels: Record<ProjectDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const statusLabels: Record<ProjectStatus, string> = {
  'in-progress': 'In progress',
  'on-hold': 'On hold',
  completed: 'Completed',
};

function formatDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

export function CategoryScreen({
  categoryId,
  onSelectCategory,
  onCreateProject,
  onOpenPreviousProjects,
  onOpenPreviousPins,
  onOpenPreviousGoals,
}: CategoryScreenProps) {
  const { state, setState } = useHomeSchoolState();
  const [projectIndex, setProjectIndex] = useState(0);
  const [learningNote, setLearningNote] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const category = CATEGORIES.find((item) => item.id === categoryId)!;
  const projects = state.projects.filter((project) => project.categoryId === categoryId);
  const pins = state.pins
    .filter((pin) => pin.categoryId === categoryId)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  const currentProject = projects[projectIndex];

  function pinLearningNote() {
    const note = learningNote.trim();
    if (!note) return;

    const pin: Pin = {
      id: crypto.randomUUID(),
      categoryId,
      title: note.replace(/\s+/g, ' ').slice(0, 72),
      url: '',
      note,
      createdAt: new Date().toISOString(),
    };
    setState({ ...state, pins: [...state.pins, pin] });
    setLearningNote('');
    setPinMessage('Pinned to this category');
  }

  return (
    <section className="category-screen" aria-labelledby="category-title">
      <CategoryTabs selectedCategory={categoryId} onSelectCategory={onSelectCategory} />
      <header className="category-heading">
        <div>
          <p className="page-eyebrow">Your learning category</p>
          <h1 id="category-title">{category.name}</h1>
        </div>
      </header>

      <div className="category-layout">
        <div className="category-main-column">
          <section className="category-panel category-projects" aria-labelledby="category-projects-title">
            <div className="category-panel-heading">
              <div>
                <p className="panel-kicker">Make ideas real</p>
                <h2 id="category-projects-title">Projects</h2>
              </div>
              <div className="category-project-actions">
                <button className="button-primary" onClick={onCreateProject} type="button">
                  + Create New Project
                </button>
                <button className="text-link" onClick={onOpenPreviousProjects} type="button">Previous Projects →</button>
              </div>
            </div>
            {currentProject ? (
              <ProjectCarousel
                project={currentProject}
                index={projectIndex}
                total={projects.length}
                onPrevious={() => setProjectIndex((index) => Math.max(0, index - 1))}
                onNext={() => setProjectIndex((index) => Math.min(projects.length - 1, index + 1))}
              />
            ) : (
              <p className="category-empty-projects">No projects in {category.name} yet.</p>
            )}
          </section>

          <section className="category-panel learning-panel" aria-labelledby="learning-title">
            <div className="category-panel-heading">
              <div>
                <p className="panel-kicker">Keep a record of your progress</p>
                <h2 id="learning-title">What Did We Learn Today?</h2>
              </div>
              <button className="text-link" onClick={onOpenPreviousPins} type="button">Previous Pins →</button>
            </div>
            <form className="learning-form" onSubmit={(event) => { event.preventDefault(); pinLearningNote(); }}>
              <label className="visually-hidden" htmlFor="learning-note">What did you learn today?</label>
              <textarea
                id="learning-note"
                onChange={(event) => { setLearningNote(event.target.value); setPinMessage(''); }}
                placeholder="Capture a discovery, a question, or a small win..."
                value={learningNote}
              />
              <div className="learning-form-footer">
                <span aria-live="polite">{pinMessage || 'Saved with this category'}</span>
                <button className="button-primary pin-button" disabled={!learningNote.trim()} type="submit">
                  Pin <span aria-hidden="true">⌖</span>
                </button>
              </div>
            </form>
            {pins[0] && (
              <p className="latest-pin"><span>Latest pin</span>{pins[0].title}</p>
            )}
          </section>
        </div>

        <aside className="category-side-panel" aria-label={`${category.name} goals and chat`}>
          <GoalChat categoryId={categoryId} onOpenPreviousGoals={onOpenPreviousGoals} />
          <section className="chat-window" aria-labelledby="chat-title">
            <div className="side-panel-heading">
              <div>
                <p className="panel-kicker">A space to think out loud</p>
                <h2 id="chat-title">Learning Chat</h2>
              </div>
              <span className="chat-status" aria-label="Chat unavailable" />
            </div>
            <div className="chat-placeholder">
              <span className="chat-mark" aria-hidden="true">✳</span>
              <p>Chat isn’t connected yet.</p>
              <span>Your {category.name} goals are ready when you are.</span>
            </div>
            <div className="chat-compose" aria-disabled="true">
              <span>Chat will be available here</span>
              <button aria-label="Send message" disabled type="button">↑</button>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function ProjectCarousel({
  project,
  index,
  total,
  onPrevious,
  onNext,
}: {
  project: Project;
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <article className="category-project-slide">
      <div className="category-carousel-controls">
        <button aria-label="Previous project" disabled={index === 0} onClick={onPrevious} type="button">←</button>
        <span>{index + 1} / {total}</span>
        <button aria-label="Next project" disabled={index >= total - 1} onClick={onNext} type="button">→</button>
      </div>
      <p className="project-overline">Project {String(index + 1).padStart(2, '0')}</p>
      <h3>{project.name}</h3>
      <p className="category-project-description">{project.description || 'No project description yet.'}</p>
      <div className="project-facts">
        <span><small>Difficulty</small>{project.difficulty ? difficultyLabels[project.difficulty] : 'Not set'}</span>
        <span><small>Status</small>{project.status ? statusLabels[project.status] : 'Not set'}</span>
        <span><small>Updated</small>{formatDate(project.updatedAt)}</span>
      </div>
      <button className="details-button" disabled title="Project details are not available yet" type="button">
        Details <span aria-hidden="true">↗</span>
      </button>
    </article>
  );
}
