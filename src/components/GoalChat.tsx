import { useState, type FormEvent } from 'react';
import { CATEGORIES, type CategoryId } from '../domain/categories';
import { toDateKey } from '../domain/dates';
import type { Goal } from '../domain/models';
import { useHomeSchoolState } from '../state/HomeSchoolProvider';

interface GoalChatProps {
  categoryId: CategoryId;
  onOpenPreviousGoals: () => void;
}

function formatDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function formatDueDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

export function GoalChat({ categoryId, onOpenPreviousGoals }: GoalChatProps) {
  const { state, setState } = useHomeSchoolState();
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [modal, setModal] = useState<'complete' | 'remove' | null>(null);
  const [removalReason, setRemovalReason] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  const activeGoals = state.goals
    .filter((goal) => goal.categoryId === categoryId && goal.status === 'active')
    .sort((first, second) => (second.dueAt ?? '').localeCompare(first.dueAt ?? ''));
  const selectedGoal = activeGoals.find((goal) => goal.id === selectedGoalId) ?? null;

  function submitGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const goalDescription = description.trim();
    if (!goalDescription || !selectedDate) {
      setValidationMessage('Add a description and choose a due date.');
      return;
    }

    const now = new Date().toISOString();
    const goal: Goal = {
      id: crypto.randomUUID(),
      categoryId,
      projectId: null,
      title: goalDescription,
      description: goalDescription,
      dueAt: selectedDate,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      deletedAt: null,
      removalReason: null,
    };
    setState({ ...state, goals: [...state.goals, goal] });
    setDescription('');
    setSelectedDate('');
    setValidationMessage('');
    setCalendarOpen(false);
  }

  function completeGoal(goal: Goal) {
    const completedAt = new Date().toISOString();
    setState({
      ...state,
      goals: state.goals.map((item) => item.id === goal.id
        ? { ...item, status: 'completed', completedAt, updatedAt: completedAt }
        : item),
    });
    setSelectedGoalId(null);
    setModal(null);
  }

  function removeGoal(goal: Goal) {
    const reason = removalReason.trim();
    if (!reason) return;

    const deletedAt = new Date().toISOString();
    setState({
      ...state,
      goals: state.goals.map((item) => item.id === goal.id
        ? { ...item, status: 'deleted', deletedAt, removalReason: reason, updatedAt: deletedAt }
        : item),
    });
    setSelectedGoalId(null);
    setModal(null);
    setRemovalReason('');
  }

  function openModal(nextModal: 'complete' | 'remove') {
    setModal(nextModal);
    setRemovalReason('');
  }

  return (
    <section className="goal-window goal-chat-window" aria-labelledby="category-goals-title">
      <div className="side-panel-heading">
        <div>
          <p className="panel-kicker">Your next steps</p>
          <h2 id="category-goals-title">Goals</h2>
        </div>
        <div className="goal-heading-actions">
          <button className="text-link previous-goals-link" onClick={onOpenPreviousGoals} type="button">
            Previous Goals
          </button>
          <span className="goal-count">{String(activeGoals.length).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="goal-chat-scroll" aria-label={`${CATEGORIES.find((item) => item.id === categoryId)?.name} goals`} role="log" aria-relevant="additions text">
        {activeGoals.length ? activeGoals.map((goal) => (
          <div className="goal-chat-entry" key={goal.id}>
            <button
              aria-expanded={selectedGoalId === goal.id}
              className={selectedGoalId === goal.id ? 'goal-bubble is-active' : 'goal-bubble'}
              onClick={() => setSelectedGoalId(selectedGoalId === goal.id ? null : goal.id)}
              type="button"
            >
              <span>{goal.description || goal.title}</span>
              {goal.dueAt && <time dateTime={goal.dueAt}>{formatDueDate(goal.dueAt)}</time>}
            </button>
            {selectedGoalId === goal.id && (
              <div className="goal-actions" aria-label={`Actions for ${goal.title}`}>
                <button aria-label="Mark goal complete" className="goal-action-complete" onClick={() => openModal('complete')} type="button">
                  <span aria-hidden="true">✓</span> Complete
                </button>
                <button aria-label="Remove goal" className="goal-action-remove" onClick={() => openModal('remove')} type="button">
                  <span aria-hidden="true">×</span> Remove
                </button>
              </div>
            )}
          </div>
        )) : (
          <p className="goal-chat-empty">No goals yet. Add a small next step below.</p>
        )}
      </div>

      <form className="goal-composer" onSubmit={submitGoal}>
        <textarea
          aria-label="Goal description"
          onChange={(event) => { setDescription(event.target.value); setValidationMessage(''); }}
          placeholder="Write a goal..."
          rows={2}
          value={description}
        />
        <div className="goal-composer-footer">
          <div className="goal-date-control">
            <button
              aria-expanded={calendarOpen}
              aria-label="Choose goal due date"
              className="calendar-button"
              onClick={() => setCalendarOpen((open) => !open)}
              type="button"
            >
              <span aria-hidden="true">▦</span>
            </button>
            <span className={selectedDate ? 'selected-due-date' : 'selected-due-date is-empty'}>
              {selectedDate ? formatDate(selectedDate) : 'Choose due date'}
            </span>
            {calendarOpen && (
              <CalendarPicker
                displayedMonth={displayedMonth}
                selectedDate={selectedDate}
                onChangeMonth={setDisplayedMonth}
                onSelectDate={(date) => { setSelectedDate(date); setCalendarOpen(false); setValidationMessage(''); }}
              />
            )}
          </div>
          <button aria-label="Send goal" className="goal-send-button" disabled={!description.trim() || !selectedDate} type="submit">
            <span aria-hidden="true">↑</span>
          </button>
        </div>
        {validationMessage && <p className="goal-validation" role="alert">{validationMessage}</p>}
      </form>

      {modal && selectedGoal && (
        <div className="goal-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          {modal === 'complete' ? (
            <section aria-labelledby="complete-goal-title" aria-modal="true" className="goal-modal" role="dialog">
              <p className="panel-kicker">Goal complete</p>
              <h2 id="complete-goal-title">Are you sure you completed this goal?</h2>
              <p className="modal-goal-text">{selectedGoal.description || selectedGoal.title}</p>
              <div className="goal-modal-actions">
                <button className="button-secondary" onClick={() => setModal(null)} type="button">Cancel</button>
                <button className="button-primary" onClick={() => completeGoal(selectedGoal)} type="button">Yes, complete</button>
              </div>
            </section>
          ) : (
            <section aria-labelledby="remove-goal-title" aria-modal="true" className="goal-modal" role="dialog">
              <p className="panel-kicker">Remove goal</p>
              <h2 id="remove-goal-title">Why are you removing this goal?</h2>
              <p className="modal-goal-text">{selectedGoal.description || selectedGoal.title}</p>
              <label className="visually-hidden" htmlFor="removal-reason">Reason for removing this goal</label>
              <textarea
                autoFocus
                id="removal-reason"
                onChange={(event) => setRemovalReason(event.target.value)}
                placeholder="Add a reason..."
                rows={3}
                value={removalReason}
              />
              <div className="goal-modal-actions">
                <button className="button-secondary" onClick={() => setModal(null)} type="button">Cancel</button>
                <button className="button-primary remove-confirm-button" disabled={!removalReason.trim()} onClick={() => removeGoal(selectedGoal)} type="button">Remove</button>
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
}

function CalendarPicker({
  displayedMonth,
  selectedDate,
  onChangeMonth,
  onSelectDate,
}: {
  displayedMonth: Date;
  selectedDate: string;
  onChangeMonth: (date: Date) => void;
  onSelectDate: (date: string) => void;
}) {
  const now = new Date();
  const today = toDateKey(now);
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstWeekday = displayedMonth.getDay();
  const daysInMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0).getDate();
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(displayedMonth);
  const days = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => {
    if (index < firstWeekday) return null;
    const day = index - firstWeekday + 1;
    return new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), day);
  });
  const canGoBack = displayedMonth > currentMonth;

  return (
    <div className="goal-calendar" aria-label="Choose a due date">
      <div className="calendar-heading">
        <button
          aria-label="Previous month"
          disabled={!canGoBack}
          onClick={() => onChangeMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1))}
          type="button"
        >←</button>
        <strong>{monthLabel}</strong>
        <button
          aria-label="Next month"
          onClick={() => onChangeMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1))}
          type="button"
        >→</button>
      </div>
      <div className="calendar-grid calendar-weekdays" aria-hidden="true">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-grid">
        {days.map((date, index) => {
          if (!date) return <span className="calendar-blank" key={`blank-${index}`} />;
          const dateKey = toDateKey(date);
          return (
            <button
              aria-label={new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(date)}
              aria-pressed={selectedDate === dateKey}
              className={selectedDate === dateKey ? 'calendar-day is-selected' : 'calendar-day'}
              disabled={dateKey < today}
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              type="button"
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}