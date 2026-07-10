import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabaseClient';
import type {
  CreateEventPayload,
  Event,
  EventAttendee,
  EventCategory,
  RsvpRecord,
  UpdateEventPayload,
} from '../types/event';

function normalizeEventCategory(category: string): EventCategory {
  const lower = (category || '').toLowerCase().trim();
  if (lower === 'hackathon' || lower === 'hackathons') return 'Hackathons';
  if (lower === 'cultural') return 'Cultural';
  if (lower === 'workshop' || lower === 'workshops') return 'Workshops';
  if (lower === 'sports') return 'Sports';
  return 'Workshops';
}

function normalizeEventMode(location: string | null | undefined): 'in_person' | 'online' | 'hybrid' {
  const trimmed = (location ?? '').trim().toLowerCase();
  if (trimmed === 'online') return 'online';
  if (trimmed === 'hybrid') return 'hybrid';
  return 'in_person';
}

export async function getCurrentAdminUser(): Promise<User> {
  const supabase = getSupabaseClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message || 'Unable to access your authentication session.');
  }

  if (!session?.user?.id) {
    throw new Error('You must be signed in to manage events.');
  }

  return session.user;
}

export async function getAdminEvents(): Promise<Event[]> {
  await getCurrentAdminUser();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_deleted', false)
    .order('scheduled_at', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Unable to load events.');
  }

  return (data ?? []) as Event[];
}

export async function getEventById(eventId: string): Promise<Event | null> {
  await getCurrentAdminUser();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_deleted', false)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message || 'Unable to load this event.');
  }

  return data ? (data as Event) : null;
}

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  const user = await getCurrentAdminUser();
  const supabase = getSupabaseClient();

  const normalizedPayload = {
    ...payload,
    title: payload.title.trim(),
    category: normalizeEventCategory(payload.category),
    location: payload.location?.trim() || null,
    ...(payload.scheduled_at !== undefined ? { scheduled_at: payload.scheduled_at } : {}),
    ends_at: null,
    cover_image_url: payload.cover_image_url?.trim() || null,
    details: payload.details?.trim() || null,
    status: 'upcoming',
    event_mode: normalizeEventMode(payload.location),
    meeting_url: null,
    organizer_id: user.id,
    rsvp_count: 0,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('events')
    .insert(normalizedPayload)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message || 'Unable to create the event.');
  }

  return data as Event;
}

export async function updateEvent(eventId: string, updates: UpdateEventPayload): Promise<Event> {
  const user = await getCurrentAdminUser();
  const supabase = getSupabaseClient();

  const normalizedUpdates = {
    ...updates,
    ...(updates.title ? { title: updates.title.trim() } : {}),
    ...(updates.category ? { category: normalizeEventCategory(updates.category) } : {}),
    ...(updates.location !== undefined ? { location: updates.location?.trim() || null } : {}),
    ...(updates.scheduled_at !== undefined ? { scheduled_at: updates.scheduled_at } : {}),
    ...(updates.location !== undefined ? { event_mode: normalizeEventMode(updates.location) } : {}),
    ...(updates.details !== undefined ? { details: updates.details?.trim() || null } : {}),
    ...(updates.cover_image_url !== undefined ? { cover_image_url: updates.cover_image_url?.trim() || null } : {}),
    ends_at: null,
    meeting_url: null,
    status: 'upcoming',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('events')
    .update(normalizedUpdates)
    .eq('event_id', eventId)
    .eq('organizer_id', user.id)
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Unable to update the event.');
  }

  if (!data) {
    throw new Error('Event not found or you do not have permission to edit it.');
  }

  return data as Event;
}

export async function softDeleteEvent(eventId: string): Promise<{ success: boolean; message: string }> {
  const user = await getCurrentAdminUser();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('events')
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq('event_id', eventId)
    .eq('organizer_id', user.id)
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Unable to deactivate the event.');
  }

  if (!data) {
    return {
      success: false,
      message: 'Event not found or you do not have permission to deactivate it.',
    };
  }

  return {
    success: true,
    message: 'Event deactivated successfully.',
  };
}

export async function getEventRsvpCount(eventId: string): Promise<number> {
  const user = await getCurrentAdminUser();
  const supabase = getSupabaseClient();

  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('rsvp_count')
    .eq('event_id', eventId)
    .eq('organizer_id', user.id)
    .eq('is_deleted', false)
    .maybeSingle();

  if (eventError) {
    throw new Error(eventError.message || 'Unable to load RSVP count.');
  }

  if (typeof eventData?.rsvp_count === 'number' && eventData.rsvp_count >= 0) {
    return eventData.rsvp_count;
  }

  const { count, error: countError } = await supabase
    .from('rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  if (countError) {
    throw new Error(countError.message || 'Unable to count RSVPs.');
  }

  return count ?? 0;
}

export async function getEventAttendees(eventId: string): Promise<EventAttendee[]> {
  const user = await getCurrentAdminUser();
  const supabase = getSupabaseClient();

  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('event_id')
    .eq('event_id', eventId)
    .eq('organizer_id', user.id)
    .eq('is_deleted', false)
    .maybeSingle();

  if (eventError) {
    throw new Error(eventError.message || 'Unable to load attendees.');
  }

  if (!eventData) {
    throw new Error('Event not found or you do not have permission to view attendees.');
  }

  const { data: rsvpRows, error: rsvpError } = await supabase
    .from('rsvps')
    .select('user_id, status, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (rsvpError) {
    throw new Error(rsvpError.message || 'Unable to load attendees.');
  }

  const rows = (rsvpRows ?? []) as RsvpRecord[];
  const userIds = Array.from(new Set(rows.map((row) => row.user_id).filter(Boolean)));

  let profiles: Array<{ user_id: string; name: string | null; email: string | null; account_type: string | null }> = [];

  if (userIds.length > 0) {
    const { data: profileRows, error: profileError } = await supabase
      .from('users')
      .select('user_id, name, email, account_type')
      .in('user_id', userIds);

    if (profileError) {
      throw new Error(profileError.message || 'Unable to load attendee details.');
    }

    profiles = (profileRows ?? []) as Array<{
      user_id: string;
      name: string | null;
      email: string | null;
      account_type: string | null;
    }>;
  }

  const profileMap = new Map(profiles.map((profile) => [profile.user_id, profile]));

  return rows.map((row) => {
    const profile = profileMap.get(row.user_id);

    return {
      user_id: row.user_id,
      name: profile?.name ?? null,
      email: profile?.email ?? null,
      account_type: profile?.account_type ?? null,
      rsvp_status: row.status,
      rsvp_created_at: row.created_at,
    } satisfies EventAttendee;
  });
}
