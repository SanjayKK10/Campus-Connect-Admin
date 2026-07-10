import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EventForm from '../components/events/EventForm';
import { createEvent } from '../services/eventService';
import type { EventFormValues } from '../types/event';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    try {
      const createdEvent = await createEvent(values);
      navigate(`/events/${createdEvent.event_id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pb-12 pt-6 md:px-6">
      <div className="mx-auto max-w-5xl">
        <Navbar />
        <main className="glass-card overflow-hidden p-0 md:p-0">
          <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-400 px-6 py-6 text-white md:px-8">
            <button type="button" onClick={() => navigate('/events')} className="mb-4 text-sm font-semibold text-white/90">
              ← Back to events
            </button>
            <h1 className="text-3xl font-bold">New Event</h1>
            <p className="mt-2 text-sm text-white/80">
              Publish an event that will be visible to the CampusConnect apps.
            </p>
          </div>

          <div className="p-6 md:p-8">
            <EventForm onSubmit={handleSubmit} onCancel={() => navigate('/events')} submitLabel="Post Event" isSubmitting={isSubmitting} />
          </div>
        </main>
      </div>
    </div>
  );
}
