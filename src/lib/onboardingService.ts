import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

export interface AdminQueueItem {
  request_id: string;
  entity_type: 'user' | 'organization';
  entity_id: string;
  submitted_at: string;
  decision: string | null;
  rejection_note: string | null;
  entity_name: string;
  entity_contact: string;
  is_overdue: boolean;
}

function ensureSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
    );
  }
}

/**
 * Fetches all pending items from the security-invoked queue view
 */
export async function getPendingQueue(): Promise<AdminQueueItem[]> {
  ensureSupabaseConfigured();

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('v_verification_queue')
    .select('*')
    .is('decision', null);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AdminQueueItem[];
}

/**
 * Approves a verification request and automatically activates the user/org profile via secure database RPC
 */
export async function verifyRequest(requestId: string): Promise<void> {
  ensureSupabaseConfigured();

  const supabase = getSupabaseClient();

  // Calls the custom database trigger function safely
  const { error } = await supabase.rpc('fn_decide_verification', {
    p_request_id: requestId,
    p_decision: 'approved',
    p_rejection_note: null
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Rejects a verification request with an optional note via secure database RPC
 */
export async function rejectRequest(requestId: string, rejectionNote: string | null = null): Promise<void> {
  ensureSupabaseConfigured();

  const supabase = getSupabaseClient();

  // Calls the custom database trigger function safely
  const { error } = await supabase.rpc('fn_decide_verification', {
    p_request_id: requestId,
    p_decision: 'rejected',
    p_rejection_note: rejectionNote
  });

  if (error) {
    throw new Error(error.message);
  }
}