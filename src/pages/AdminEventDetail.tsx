import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RSVPListModal from '../components/events/RSVPListModal';
import { getCurrentAdminUser, getEventAttendees, getEventById, getEventRsvpCount } from '../services/eventService';
import type { Event, EventAttendee } from '../types/event';

function formatEventDateTime(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function AdminEventDetail() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttendeesLoading, setIsAttendeesLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAttendees, setShowAttendees] = useState(false);

  const isOwner = Boolean(event && currentUserId && event.organizer_id === currentUserId);

  useEffect(() => {
    if (!eventId) return;

    let isMounted = true;

    async function loadEvent() {
      setIsLoading(true);
      setError(null);

      try {
        if (!eventId) {
          return;
        }

        const [currentUser, detail] = await Promise.all([getCurrentAdminUser(), getEventById(eventId)]);
        if (!isMounted) return;

        setCurrentUserId(currentUser.id);
        if (!detail) {
          setEvent(null);
          setRsvpCount(0);
          return;
        }

        setEvent(detail);
        const count = await getEventRsvpCount(eventId);
        if (!isMounted) return;
        setRsvpCount(count);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load the event.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const loadAttendees = async () => {
    if (!eventId) return;
    setShowAttendees(true);
    setIsAttendeesLoading(true);

    try {
      const [rows, count] = await Promise.all([getEventAttendees(eventId), getEventRsvpCount(eventId)]);
      setAttendees(rows);
      setRsvpCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load attendees.');
      setShowAttendees(false);
    } finally {
      setIsAttendeesLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pb-12 pt-6 md:px-6">
      <div className="mx-auto max-w-6xl">
        <Navbar />
        <main className="glass-card overflow-hidden p-0 md:p-0">
          <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-400 px-6 py-6 text-white md:px-8">
            <button type="button" onClick={() => navigate('/events')} className="mb-4 text-sm font-semibold text-white/90">
              ← Back to events
            </button>
            <h1 className="text-3xl font-bold">{event?.title || 'Event Details'}</h1>
            <p className="mt-2 text-sm text-white/80">{event?.category || 'Event'} • {event?.status || 'upcoming'}</p>
          </div>

          <div className="p-6 md:p-8">
            {error ? <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            {isLoading ? (
              <div className="py-12 text-center text-sm" style={{ color: 'var(--color-cc-muted)' }}>
                Loading event details...
              </div>
            ) : null}

            {!isLoading && !event ? (
              <div className="py-12 text-center">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-cc-text)' }}>
                  Event not available
                </h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
                  This event may not exist or may not belong to your account.
                </p>
              </div>
            ) : null}

            {!isLoading && event ? (
              <>
                {event.cover_image_url ? (
                  <img src={event.cover_image_url} alt={event.title} className="mb-6 h-64 w-full rounded-3xl object-cover" />
                ) : (
                  <div className="mb-6 flex h-48 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 via-fuchsia-50 to-white text-4xl">
                    📅
                  </div>
                )}

                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--color-cc-text)' }}>
                      {event.title}
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
                      {event.category ?? 'General'} • {event.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isOwner ? (
                      <>
                        <button type="button" onClick={() => navigate(`/events/${event.event_id}/edit`)} className="rounded-xl border border-violet-200/70 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
                          Edit Event
                        </button>
                        <button type="button" onClick={() => void loadAttendees()} className="rounded-xl border border-slate-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700">
                          View Attendees
                        </button>
                      </>
                    ) : (
                      <span className="rounded-xl border border-slate-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700">
                        View information
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-5">
                      <h2 className="text-lg font-semibold" style={{ color: 'var(--color-cc-text)' }}>
                        Details
                      </h2>
                      <p className="mt-3 text-sm leading-7" style={{ color: 'var(--color-cc-muted)' }}>
                        {event.details || 'No additional details provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-5">
                      <h2 className="text-lg font-semibold" style={{ color: 'var(--color-cc-text)' }}>
                        Event Info
                      </h2>
                      <div className="mt-4 space-y-3 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
                        <div className="flex items-center justify-between gap-3"><span>Location</span><span className="font-medium text-slate-700">{event.location || 'TBD'}</span></div>
                        <div className="flex items-center justify-between gap-3"><span>Mode</span><span className="font-medium text-slate-700">{event.event_mode}</span></div>
                        <div className="flex items-center justify-between gap-3"><span>Start</span><span className="font-medium text-slate-700">{formatEventDateTime(event.scheduled_at)}</span></div>
                        {event.ends_at ? <div className="flex items-center justify-between gap-3"><span>End</span><span className="font-medium text-slate-700">{formatEventDateTime(event.ends_at)}</span></div> : null}
                        {event.meeting_url ? <div className="flex items-center justify-between gap-3"><span>URL</span><a href={event.meeting_url} target="_blank" rel="noreferrer" className="font-medium text-violet-600">Open link</a></div> : null}
                        <div className="flex items-center justify-between gap-3"><span>RSVPs</span><span className="font-medium text-slate-700">{rsvpCount}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </main>
      </div>

      {showAttendees ? (
        <RSVPListModal
          isOpen={showAttendees}
          isLoading={isAttendeesLoading}
          attendees={attendees}
          error={error}
          onClose={() => setShowAttendees(false)}
        />
      ) : null}
    </div>
  );
}
