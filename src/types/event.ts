export type EventMode = 'in_person' | 'online' | 'hybrid';
export type EventStatus = 'upcoming' | 'cancelled' | 'completed';
export type EventCategory = 'Hackathons' | 'Cultural' | 'Sports' | 'Workshops';
export type EventCategoryOption = 'Hackathon' | 'Cultural' | 'Workshop' | 'Sports';

export interface Event {
  event_id: string;
  title: string;
  category: string | null;
  location: string | null;
  scheduled_at: string;
  organizer_id: string;
  rsvp_count: number;
  status: EventStatus | string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  ends_at: string | null;
  cover_image_url: string | null;
  event_mode: EventMode | string;
  meeting_url: string | null;
  details: string | null;
}

export interface CreateEventPayload {
  title: string;
  category: string;
  location: string | null;
  scheduled_at: string;
  ends_at: string | null;
  cover_image_url: string | null;
  event_mode: EventMode | string;
  meeting_url: string | null;
  details: string | null;
  status?: EventStatus | string;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}

export interface EventFormValues extends CreateEventPayload {}

export interface RsvpRecord {
  rsvp_id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string | null;
}

export interface EventAttendee {
  user_id: string;
  name: string | null;
  email: string | null;
  account_type: string | null;
  rsvp_status: string;
  rsvp_created_at: string;
}
