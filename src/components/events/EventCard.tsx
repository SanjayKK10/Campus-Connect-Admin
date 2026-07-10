import type { Event } from '../../types/event';

interface EventCardProps {
  event: Event;
  isOwner: boolean;
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDeactivate: (event: Event) => void;
}

function formatEventDateTime(value: string | null | undefined) {
  if (!value) return 'TBD';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function EventCard({ event, isOwner, onView, onEdit, onDeactivate }: EventCardProps) {
  return (
    <article className="glass-card overflow-hidden">
      {event.cover_image_url ? (
        <img
          src={event.cover_image_url}
          alt={event.title}
          className="h-40 w-full object-cover"
        />
      ) : null}

      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--color-cc-text)' }}>
              {event.title}
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
              {event.category ?? 'General'}
            </p>
          </div>
          <span className="rounded-full border border-violet-200/70 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
            {event.status}
          </span>
        </div>

        <div className="grid gap-3 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
          <div className="flex items-center justify-between">
            <span>Date</span>
            <span className="font-medium" style={{ color: 'var(--color-cc-text)' }}>
              {formatEventDateTime(event.scheduled_at)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Time</span>
            <span className="font-medium" style={{ color: 'var(--color-cc-text)' }}>
              {formatEventDateTime(event.scheduled_at)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Location</span>
            <span className="font-medium" style={{ color: 'var(--color-cc-text)' }}>
              {event.location ?? 'TBD'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Mode</span>
            <span className="font-medium" style={{ color: 'var(--color-cc-text)' }}>
              {event.event_mode}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>RSVPs</span>
            <span className="font-medium" style={{ color: 'var(--color-cc-text)' }}>
              {event.rsvp_count}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => onView(event)}
            className="rounded-xl border border-violet-200/70 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700"
          >
            View
          </button>
          {isOwner ? (
            <>
              <button
                type="button"
                onClick={() => onEdit(event)}
                className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDeactivate(event)}
                className="rounded-xl border border-rose-200/70 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
              >
                Deactivate
              </button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
