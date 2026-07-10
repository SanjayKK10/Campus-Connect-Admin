import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EventForm from '../components/events/EventForm';
import { getCurrentAdminUser, getEventById, updateEvent } from '../services/eventService';
import type { Event, EventFormValues } from '../types/event';

export default function EditEvent() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          return;
        }
        if (detail.organizer_id !== currentUser.id) {
          setEvent(detail);
          setError('You can only edit events you organize.');
          return;
        }
        setEvent(detail);
        setError(null);
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

  const handleSubmit = async (values: EventFormValues) => {
    if (!eventId || !event) return;

    const currentUser = await getCurrentAdminUser();
    if (event.organizer_id !== currentUser.id) {
      setError('You can only edit events you organize.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedEvent = await updateEvent(eventId, values);
      navigate(`/events/${updatedEvent.event_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update the event.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pb-12 pt-6 md:px-6">
      <div className="mx-auto max-w-5xl">
        <Navbar />
        <main className="glass-card p-6 md:p-8">
          <div className="mb-8">
            <button type="button" onClick={() => navigate('/events')} className="mb-4 text-sm font-medium text-violet-600">
              ← Back to events
            </button>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-cc-text)' }}>
              Edit Event
            </h1>
          </div>

          {error ? <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          {isLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: 'var(--color-cc-muted)' }}>
              Loading event data...
            </div>
          ) : null}

          {!isLoading && !event ? (
            <div className="py-8 text-center">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--color-cc-text)' }}>
                Event not available
              </h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
                This event may not exist or may not belong to your account.
              </p>
            </div>
          ) : null}

          {!isLoading && event && currentUserId && event.organizer_id === currentUserId ? (
            <EventForm
              initialValues={{
                title: event.title,
                category: event.category ?? '',
                location: event.location ?? '',
                scheduled_at: event.scheduled_at,
                ends_at: event.ends_at?.slice(0, 16) ?? '',
                cover_image_url: event.cover_image_url ?? '',
                event_mode: event.event_mode,
                meeting_url: event.meeting_url ?? '',
                details: event.details ?? '',
                status: event.status,
              }}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/events/${event.event_id}`)}
              submitLabel="Save Changes"
              isSubmitting={isSubmitting}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
