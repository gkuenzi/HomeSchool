import { useState, type FormEvent } from 'react';
import { CATEGORIES, type CategoryId } from '../domain/categories';
import type { Pin } from '../domain/models';
import { useHomeSchoolState } from '../state/HomeSchoolProvider';

type PinSort = 'most-recent' | 'oldest';

function formatPinDate(value: string, month: 'short' | 'long' = 'long'): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    month,
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function matchesPinSearch(pin: Pin, query: string): boolean {
  if (!query) return true;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  const pinDate = new Date(pin.createdAt);
  const dateTerms = [
    pin.createdAt,
    pin.createdAt.slice(0, 10),
    formatPinDate(pin.createdAt, 'short'),
    formatPinDate(pin.createdAt, 'long'),
    pinDate.toLocaleDateString(),
  ];
  const searchableText = [pin.title, pin.note, pin.url, ...dateTerms].join(' ').toLocaleLowerCase();
  return searchableText.includes(normalizedQuery);
}

export function PreviousPinsPage({
  categoryId,
  onBack,
}: {
  categoryId: CategoryId;
  onBack: () => void;
}) {
  const { state } = useHomeSchoolState();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<PinSort>('most-recent');
  const [pinIndex, setPinIndex] = useState(0);
  const category = CATEGORIES.find((item) => item.id === categoryId)!;
  const pins = state.pins
    .filter((pin) => pin.categoryId === categoryId && matchesPinSearch(pin, search))
    .sort((first, second) => {
      const dateOrder = first.createdAt.localeCompare(second.createdAt);
      return sort === 'most-recent' ? -dateOrder : dateOrder;
    });
  const currentPin = pins[pinIndex];

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput);
    setPinIndex(0);
  }

  function changeSort(nextSort: PinSort) {
    setSort(nextSort);
    setPinIndex(0);
  }

  return (
    <section className="project-page previous-pins-page" aria-labelledby="previous-pins-title">
      <button className="back-link" onClick={onBack} type="button">← Back to {category.name}</button>
      <header className="project-page-heading history-heading">
        <div>
          <p className="page-eyebrow">{category.name}</p>
          <h1 id="previous-pins-title">Previous Pins</h1>
        </div>
        <span className="result-count">{pins.length} {pins.length === 1 ? 'pin' : 'pins'}</span>
      </header>

      <div className="pin-history-tools">
        <label className="sort-control">
          <span>Sort By</span>
          <select onChange={(event) => changeSort(event.target.value as PinSort)} value={sort}>
            <option value="most-recent">Most recent</option>
            <option value="oldest">Oldest to newest</option>
          </select>
        </label>
        <form className="project-search" onSubmit={submitSearch} role="search">
          <label className="visually-hidden" htmlFor="pin-search-input">Search pins by date or keywords</label>
          <input
            id="pin-search-input"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by date or keywords"
            type="search"
            value={searchInput}
          />
          <button className="button-secondary" type="submit">Search</button>
        </form>
      </div>

      {currentPin ? (
        <article className="pin-card" aria-live="polite">
          <div className="pin-card-heading">
            <p className="panel-kicker">A note from your learning</p>
            <time dateTime={currentPin.createdAt}>{formatPinDate(currentPin.createdAt)}</time>
          </div>
          <h2>{currentPin.title}</h2>
          <p className="pin-note">{currentPin.note || currentPin.title}</p>
          {currentPin.url && (
            <a className="pin-url" href={currentPin.url} rel="noreferrer" target="_blank">{currentPin.url}</a>
          )}
          <div className="pin-navigation" aria-label="Pin navigation">
            <button
              aria-label="Previous pin"
              disabled={pinIndex === 0}
              onClick={() => setPinIndex((index) => Math.max(index - 1, 0))}
              type="button"
            >
              ← <span>Previous</span>
            </button>
            <span className="pin-position">{pinIndex + 1} of {pins.length}</span>
            <button
              aria-label="Next pin"
              disabled={pinIndex >= pins.length - 1}
              onClick={() => setPinIndex((index) => Math.min(index + 1, pins.length - 1))}
              type="button"
            >
              <span>Next</span> →
            </button>
          </div>
        </article>
      ) : (
        <div className="pin-history-empty">
          {search ? 'No pins match your search.' : `No pins saved in ${category.name} yet.`}
        </div>
      )}
    </section>
  );
}