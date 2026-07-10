import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';
import { getAdminEvents, getCurrentAdminUser, softDeleteEvent } from '../services/eventService';
import type { Event, EventCategory, EventCategoryOption } from '../types/event';

export default function EventManagement() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<EventCategory | EventCategoryOption | 'All'>('All');

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      setIsLoading(true);
      setError(null);

      try {
        const [currentUser, data] = await Promise.all([getCurrentAdminUser(), getAdminEvents()]);
        if (!isMounted) return;
        setCurrentUserId(currentUser.id);
        setEvents(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load events.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'All') return events;
    return events.filter((event) => {
      const normalizedCategory = (event.category ?? '').toLowerCase();
      const filterValue = activeFilter.toLowerCase();
      return normalizedCategory === filterValue || normalizedCategory === `${filterValue}s`;
    });
  }, [activeFilter, events]);

  const handleDeactivate = async (event: Event) => {
    const confirmed = window.confirm(`Deactivate “${event.title}”? This will hide it from active listings.`);
    if (!confirmed) return;

    try {
      const result = await softDeleteEvent(event.event_id);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setEvents((current) => current.filter((item) => item.event_id !== event.event_id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to deactivate the event.');
    }
  };

  return (
    <div className="min-h-screen px-4 pb-12 pt-6 md:px-6">
      <div className="mx-auto max-w-7xl">
        <Navbar />

        <main>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-cc-text)' }}>
                Event Management
              </h1>
              <p className="mt-2" style={{ color: 'var(--color-cc-muted)' }}>
                Manage the events you organize and monitor RSVPs from one place.
              </p>
            </div>
            <button type="button" onClick={() => navigate('/events/create')} className="btn-accent rounded-xl px-5 py-2.5 text-sm">
              + Create Event
            </button>
          </div>

          {error ? <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <div className="mb-6">
            <EventFilters activeFilter={activeFilter} onChange={setActiveFilter} />
          </div>

          {isLoading ? (
            <div className="glass-card px-6 py-16 text-center text-sm" style={{ color: 'var(--color-cc-muted)' }}>
              Loading your events from Supabase...
            </div>
          ) : null}

          {!isLoading && filteredEvents.length === 0 ? (
            <div className="glass-card px-6 py-16 text-center">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--color-cc-text)' }}>
                No events found
              </h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
                Create your first event to make it available across CampusConnect.
              </p>
            </div>
          ) : null}

          {!isLoading && filteredEvents.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.event_id}
                  event={event}
                  isOwner={event.organizer_id === currentUserId}
                  onView={(selectedEvent) => navigate(`/events/${selectedEvent.event_id}`)}
                  onEdit={(selectedEvent) => navigate(`/events/${selectedEvent.event_id}/edit`)}
                  onDeactivate={handleDeactivate}
                />
              ))}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
