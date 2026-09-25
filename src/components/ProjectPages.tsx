import { useState, type FormEvent } from 'react';
import { CATEGORIES, type CategoryId } from '../domain/categories';
import type { Project, ProjectDifficulty } from '../domain/models';
import { useHomeSchoolState } from '../state/HomeSchoolProvider';

const DIFFICULTIES: ProjectDifficulty[] = ['easy', 'medium', 'hard'];

const difficultyLabels: Record<ProjectDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

type ProjectSort = 'newest-finished' | 'oldest-finished' | 'easy-to-hard' | 'hard-to-easy';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(`${value.slice(0, 10)}T12:00:00`));
}

function getFinishedDate(project: Project): string {
  return project.finishedAt || project.updatedAt;
}

export function CreateProjectPage({
  categoryId,
  onCancel,
  onCreated,
}: {
  categoryId: CategoryId;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const { state, setState } = useHomeSchoolState();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryId>>(() => new Set([categoryId]));
  const [difficulty, setDifficulty] = useState<ProjectDifficulty | null>(null);
  const [error, setError] = useState('');

  function toggleCategory(selectedId: CategoryId) {
    setSelectedCategories((current) => {
      const next = new Set(current);
      if (next.has(selectedId)) next.delete(selectedId);
      else next.add(selectedId);
      return next;
    });
  }

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError('Enter a project title.');
      return;
    }
    if (!difficulty) {
      setError('Select a difficulty.');
      return;
    }
    if (selectedCategories.size === 0) {
      setError('Select at least one category.');
      return;
    }

    const now = new Date().toISOString();
    const projects: Project[] = [...selectedCategories].map((selectedId) => ({
      id: crypto.randomUUID(),
      categoryId: selectedId,
      name: title.trim(),
      description: description.trim(),
      difficulty,
      status: 'in-progress',
      finishedAt: null,
      createdAt: now,
      updatedAt: now,
    }));

    setState({ ...state, projects: [...state.projects, ...projects] });
    onCreated();
  }

  return (
    <section className="project-page" aria-labelledby="create-project-title">
      <button className="back-link" onClick={onCancel} type="button">← Back to category</button>
      <header className="project-page-heading">
        <p className="page-eyebrow">Add to your learning workspace</p>
        <h1 id="create-project-title">Create New Project</h1>
        <p>A project can belong to more than one category.</p>
      </header>
      <form className="project-form" onSubmit={submitProject}>
        <label className="form-field">
          <span>Project title</span>
          <input
            autoFocus
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Name your project"
            required
            value={title}
          />
        </label>

        <fieldset className="form-field category-choices">
          <legend>Categories</legend>
          <div className="category-checkboxes">
            {CATEGORIES.map((category) => (
              <label className="choice-row" key={category.id}>
                <input
                  checked={selectedCategories.has(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  type="checkbox"
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="form-field difficulty-choices">
          <legend>Difficulty</legend>
          <div className="difficulty-options">
            {DIFFICULTIES.map((level) => (
              <label className={difficulty === level ? 'difficulty-option is-selected' : 'difficulty-option'} key={level}>
                <input
                  checked={difficulty === level}
                  name="project-difficulty"
                  onChange={() => { setDifficulty(level); setError(''); }}
                  required={level === DIFFICULTIES[0]}
                  type="radio"
                  value={level}
                />
                <span>{difficultyLabels[level]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="form-field">
          <span>Description</span>
          <textarea
            maxLength={1000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What are you hoping to make or explore?"
            rows={4}
            value={description}
          />
        </label>

        <div className="project-form-footer">
          <p aria-live="polite" className="form-error">{error}</p>
          <div>
            <button className="button-secondary" onClick={onCancel} type="button">Cancel</button>
            <button className="button-primary" type="submit">Create Project</button>
          </div>
        </div>
      </form>
    </section>
  );
}

export function PreviousProjectsPage({
  categoryId,
  onBack,
}: {
  categoryId: CategoryId;
  onBack: () => void;
}) {
  const { state } = useHomeSchoolState();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftDifficulties, setDraftDifficulties] = useState<Set<ProjectDifficulty>>(
    () => new Set(DIFFICULTIES),
  );
  const [savedDifficulties, setSavedDifficulties] = useState<Set<ProjectDifficulty>>(
    () => new Set(DIFFICULTIES),
  );
  const [sort, setSort] = useState<ProjectSort>('newest-finished');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const category = CATEGORIES.find((item) => item.id === categoryId)!;

  const projects = state.projects
    .filter((project) => project.categoryId === categoryId && project.status === 'completed')
    .filter((project) => project.difficulty && savedDifficulties.has(project.difficulty))
    .filter((project) => {
      const query = search.trim().toLocaleLowerCase();
      return !query || `${project.name} ${project.description}`.toLocaleLowerCase().includes(query);
    })
    .sort((first, second) => compareProjects(first, second, sort));

  function toggleDifficulty(level: ProjectDifficulty) {
    setDraftDifficulties((current) => {
      const next = new Set(current);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput);
  }

  return (
    <section className="project-page previous-projects-page" aria-labelledby="previous-projects-title">
      <button className="back-link" onClick={onBack} type="button">← Back to {category.name}</button>
      <header className="project-page-heading history-heading">
        <div>
          <p className="page-eyebrow">{category.name}</p>
          <h1 id="previous-projects-title">Previous Projects</h1>
        </div>
        <span className="result-count">{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
      </header>

      <div className="project-tools">
        <div className="filter-control">
          <button
            aria-expanded={filtersOpen}
            className="button-secondary filter-button"
            onClick={() => setFiltersOpen((open) => !open)}
            type="button"
          >
            <span aria-hidden="true">☷</span> Filter
          </button>
          {filtersOpen && (
            <div className="filter-popover">
              <fieldset>
                <legend>Difficulty</legend>
                {DIFFICULTIES.map((level) => (
                  <label className="choice-row" key={level}>
                    <input
                      checked={draftDifficulties.has(level)}
                      onChange={() => toggleDifficulty(level)}
                      type="checkbox"
                    />
                    <span>{difficultyLabels[level]}</span>
                  </label>
                ))}
              </fieldset>
              <button
                className="button-primary save-filters"
                onClick={() => { setSavedDifficulties(new Set(draftDifficulties)); setFiltersOpen(false); }}
                type="button"
              >
                Save Filters
              </button>
            </div>
          )}
        </div>

        <label className="sort-control">
          <span>Sort By</span>
          <select onChange={(event) => setSort(event.target.value as ProjectSort)} value={sort}>
            <option value="newest-finished">Newest finished to Oldest finished</option>
            <option value="oldest-finished">Oldest to newest</option>
            <option value="easy-to-hard">Easy to hard</option>
            <option value="hard-to-easy">Hard to easy</option>
          </select>
        </label>

        <form className="project-search" onSubmit={submitSearch} role="search">
          <label className="visually-hidden" htmlFor="project-search-input">Search previous projects</label>
          <input
            id="project-search-input"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search projects"
            type="search"
            value={searchInput}
          />
          <button className="button-secondary" type="submit">Search</button>
        </form>
      </div>

      <div className="previous-project-list" role="region" aria-label="Previous project results" tabIndex={0}>
        {projects.length ? projects.map((project) => (
          <article className="previous-project-row" key={project.id}>
            <div className="previous-project-main">
              <h2>{project.name}</h2>
              <p>{project.description || 'No description'}</p>
            </div>
            <span className={`difficulty-tag difficulty-${project.difficulty}`}>
              {project.difficulty ? difficultyLabels[project.difficulty] : ''}
            </span>
            <time dateTime={getFinishedDate(project)}>
              Finished {formatDate(getFinishedDate(project))}
            </time>
          </article>
        )) : (
          <p className="previous-project-empty">No finished projects match these filters.</p>
        )}
      </div>
    </section>
  );
}

function compareProjects(first: Project, second: Project, sort: ProjectSort): number {
  if (sort === 'newest-finished' || sort === 'oldest-finished') {
    const dateOrder = getFinishedDate(first).localeCompare(getFinishedDate(second));
    return sort === 'newest-finished' ? -dateOrder : dateOrder;
  }

  const difficultyOrder: Record<ProjectDifficulty, number> = sort === 'easy-to-hard'
    ? { easy: 0, medium: 1, hard: 2 }
    : { hard: 0, medium: 1, easy: 2 };
  const levelOrder = difficultyOrder[first.difficulty!] - difficultyOrder[second.difficulty!];
  return levelOrder || first.name.localeCompare(second.name);
}