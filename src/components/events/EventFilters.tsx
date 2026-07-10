import type { EventCategory, EventCategoryOption } from '../../types/event';

interface EventFiltersProps {
  activeFilter: EventCategory | EventCategoryOption | 'All';
  onChange: (filter: EventCategory | EventCategoryOption | 'All') => void;
}

const filters: Array<EventCategory | EventCategoryOption | 'All'> = ['All', 'Hackathon', 'Cultural', 'Sports', 'Workshop'];

export default function EventFilters({ activeFilter, onChange }: EventFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChange(filter)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-200/60'
                : 'border border-violet-200/70 bg-white/70 text-slate-700 hover:bg-violet-50'
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
