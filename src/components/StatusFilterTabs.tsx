import type { StatusFilter } from '../types/admin';
import { STATUS_LABELS } from '../types/admin';

interface StatusFilterTabsProps {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}

const filters: StatusFilter[] = ['all', 'pending', 'verified', 'rejected'];

export default function StatusFilterTabs({ value, onChange }: StatusFilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const label = filter === 'all' ? 'All' : STATUS_LABELS[filter];
        const active = value === filter;

        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChange(filter)}
            className="rounded-full px-4 py-1.5 text-sm font-medium transition"
            style={
              active
                ? {
                    background: 'linear-gradient(to right, #9c7cff, #e7dcff)',
                    color: '#1f2937',
                    boxShadow: '0 4px 14px rgba(156,124,255,0.3)',
                  }
                : {
                    border: '1px solid rgba(156,124,255,0.25)',
                    backgroundColor: 'rgba(156,124,255,0.08)',
                    color: 'var(--color-cc-muted)',
                  }
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}