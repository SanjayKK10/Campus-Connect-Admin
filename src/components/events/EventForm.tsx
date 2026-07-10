import { useMemo, useState, type FormEvent } from 'react';
import type { EventFormValues } from '../../types/event';

interface EventFormProps {
  initialValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

const emptyValues: EventFormValues = {
  title: '',
  category: 'Hackathon',
  location: '',
  scheduled_at: '',
  ends_at: null,
  cover_image_url: '',
  event_mode: 'in_person',
  meeting_url: '',
  details: '',
  status: 'upcoming',
};

function sanitizeText(value: string | null | undefined) {
  return value?.trim() ?? '';
}

function toDateTimeLocalValue(value: string | null | undefined): string {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 16);
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16);
}

export default function EventForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save Event',
  isSubmitting = false,
}: EventFormProps) {
  const [values, setValues] = useState<EventFormValues>({
    ...emptyValues,
    ...initialValues,
    title: sanitizeText(initialValues?.title),
    category: sanitizeText(initialValues?.category),
    location: sanitizeText(initialValues?.location),
    scheduled_at: toDateTimeLocalValue(initialValues?.scheduled_at),
    ends_at: sanitizeText(initialValues?.ends_at) || null,
    cover_image_url: sanitizeText(initialValues?.cover_image_url),
    meeting_url: sanitizeText(initialValues?.meeting_url),
    details: sanitizeText(initialValues?.details),
    status: sanitizeText(initialValues?.status) || 'upcoming',
    event_mode: sanitizeText(initialValues?.event_mode) || 'in_person',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const normalizedLocation = (values.location ?? '').trim().toLowerCase();
  const isOnline = normalizedLocation === 'online';

  const validate = useMemo(() => {
    const nextErrors: Record<string, string> = {};
    const title = values.title.trim();
    const category = values.category.trim();
    const scheduledAt = values.scheduled_at.trim();
    const location = (values.location ?? '').trim();

    if (!title) nextErrors.title = 'Title is required.';
    if (!category) nextErrors.category = 'Category is required.';
    if (!scheduledAt) nextErrors.scheduled_at = 'Date and time are required.';
    if (!location) nextErrors.location = 'Location is required.';

    return nextErrors;
  }, [values]);

  const handleChange = (field: keyof EventFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors({});

    const nextErrors = validate;
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: EventFormValues = {
      title: values.title.trim(),
      category: values.category.trim(),
      location: (values.location ?? '').trim() || null,
      scheduled_at: new Date(values.scheduled_at).toISOString(),
      ends_at: null,
      cover_image_url: (values.cover_image_url ?? '').trim() || null,
      event_mode: isOnline ? 'online' : 'in_person',
      meeting_url: null,
      details: (values.details ?? '').trim() || null,
      status: 'upcoming',
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save the event.';
      setErrors({ form: message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.form}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--color-cc-text)' }}>
            Event Title
          </label>
          <input
            value={values.title}
            onChange={(event) => handleChange('title', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none ring-0"
            placeholder="Event title"
          />
          {errors.title ? <p className="mt-2 text-sm text-red-600">{errors.title}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--color-cc-text)' }}>
            Category
          </label>
          <select
            value={values.category}
            onChange={(event) => handleChange('category', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none"
          >
            <option value="Hackathon">Hackathon</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
          </select>
          {errors.category ? <p className="mt-2 text-sm text-red-600">{errors.category}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--color-cc-text)' }}>
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={values.scheduled_at}
            onChange={(event) => handleChange('scheduled_at', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none"
          />
          {errors.scheduled_at ? <p className="mt-2 text-sm text-red-600">{errors.scheduled_at}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--color-cc-text)' }}>
            Location
          </label>
          <input
            value={values.location ?? ''}
            onChange={(event) => handleChange('location', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none"
            placeholder={isOnline ? 'Not needed for online events' : 'Venue name'}
          />
          {errors.location ? <p className="mt-2 text-sm text-red-600">{errors.location}</p> : null}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--color-cc-text)' }}>
            Add Cover
          </label>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm" style={{ color: 'var(--color-cc-muted)' }}>
                Add a cover image later if needed. Posting without a cover is fine.
              </p>
              <button type="button" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                Add Cover
              </button>
            </div>
            {values.cover_image_url ? (
              <img src={values.cover_image_url} alt="Cover preview" className="mt-4 h-40 w-full rounded-2xl object-cover" />
            ) : null}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--color-cc-text)' }}>
            Details
          </label>
          <textarea
            value={values.details ?? ''}
            onChange={(event) => handleChange('details', event.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none"
            placeholder="Describe the event"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-accent rounded-xl px-5 py-2.5 text-sm">
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
