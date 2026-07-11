import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';
import { getAllVisibleEvents, getCurrentAdminUser, getMyEvents } from '../services/eventService';
import type { Event, EventCategory, EventCategoryOption } from '../types/event';

export default function EventManagement() {
  const navigate = useNavigate();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [browseEvents, setBrowseEvents] = useState<Event[]>([]);
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
        const [currentUser, ownedEvents, visibleEvents] = await Promise.all([
          getCurrentAdminUser(),
          getMyEvents(),
          getAllVisibleEvents(),
        ]);

        if (!isMounted) return;

        setCurrentUserId(currentUser.id);
        setMyEvents(ownedEvents);
        setBrowseEvents(visibleEvents.filter((event) => event.organizer_id !== currentUser.id));
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

  const filterEvents = (items: Event[]) => {
    if (activeFilter === 'All') return items;

    return items.filter((event) => {
      const normalizedCategory = (event.category ?? '').toLowerCase();
      const filterValue = activeFilter.toLowerCase();
      return normalizedCategory === filterValue || normalizedCategory === `${filterValue}s`;
    });
  };

  const filteredMyEvents = useMemo(() => filterEvents(myEvents), [activeFilter, myEvents]);
  const filteredBrowseEvents = useMemo(() => filterEvents(browseEvents), [activeFilter, browseEvents]);

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

          {!isLoading ? (
            <div className="space-y-10">
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-cc-text)' }}>
                    My Events
                  </h2>
                  <span className="text-sm" style={{ color: 'var(--color-cc-muted)' }}>
                    {currentUserId ? 'Owned by you' : ''}
                  </span>
                </div>
                {filteredMyEvents.length > 0 ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {filteredMyEvents.map((event) => (
                      <EventCard
                        key={event.event_id}
                        event={event}
                        onView={(selectedEvent) => navigate(`/events/${selectedEvent.event_id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card px-6 py-16 text-center">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-cc-text)' }}>
                      No events created by Rynixsoft yet.
                    </h3>
                  </div>
                )}
              </section>

              <section>
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-cc-text)' }}>
                    Browse All Events
                  </h2>
                </div>
                {filteredBrowseEvents.length > 0 ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {filteredBrowseEvents.map((event) => (
                      <EventCard
                        key={event.event_id}
                        event={event}
                        onView={(selectedEvent) => navigate(`/events/${selectedEvent.event_id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card px-6 py-16 text-center">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-cc-text)' }}>
                      No events found
                    </h3>
                    <p className="mt-2 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
                      There are no other events available for the selected filter.
                    </p>
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
