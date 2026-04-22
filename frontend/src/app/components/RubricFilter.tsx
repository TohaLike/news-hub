import { cn } from './ui/utils';
import type { NewsRubric } from '../constants/rubrics';
import { NEWS_RUBRICS } from '../constants/rubrics';

export interface RubricFilterProps {
  selectedRubric: NewsRubric | null;
  onSelectRubric: (rubric: NewsRubric | null) => void;
}

export function RubricFilter({ selectedRubric, onSelectRubric }: RubricFilterProps) {
  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-gray-900">Рубрики</h3>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectRubric(null)}
          className={cn(
            'rounded-full px-4 py-2 text-sm transition-colors',
            selectedRubric === null
              ? 'bg-violet-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          )}
        >
          Все
        </button>

        {NEWS_RUBRICS.map((rubric) => (
          <button
            key={rubric}
            type="button"
            onClick={() => onSelectRubric(rubric)}
            className={cn(
              'rounded-full px-4 py-2 text-sm transition-colors',
              selectedRubric === rubric
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            )}
          >
            {rubric}
          </button>
        ))}
      </div>
    </div>
  );
}
