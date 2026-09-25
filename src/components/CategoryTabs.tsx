import { CATEGORIES, type CategoryId } from '../domain/categories';

interface CategoryTabsProps {
  selectedCategory: CategoryId | null;
  onSelectCategory: (categoryId: CategoryId) => void;
}

export function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  return (
    <nav className="category-tabs" aria-label="Learning categories">
      {CATEGORIES.map((category) => (
        <button
          aria-current={selectedCategory === category.id ? 'page' : undefined}
          className={selectedCategory === category.id ? 'category-tab is-selected' : 'category-tab'}
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          type="button"
        >
          {category.name}
        </button>
      ))}
    </nav>
  );
}