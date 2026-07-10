interface RSVPListModalProps {
  isOpen: boolean;
  isLoading: boolean;
  attendees: Array<{
    user_id: string;
    name: string | null;
    email: string | null;
    account_type: string | null;
    rsvp_status: string;
    rsvp_created_at: string;
  }>;
  error?: string | null;
  onClose: () => void;
}

export default function RSVPListModal({
  isOpen,
  isLoading,
  attendees,
  error,
  onClose,
}: RSVPListModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
      <div className="glass-card w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-cc-text)' }}>
              Attendee List
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-cc-muted)' }}>
              RSVP details for the selected event
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700">
            Close
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto px-6 py-5">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="py-10 text-center text-sm" style={{ color: 'var(--color-cc-muted)' }}>
              Loading attendees...
            </div>
          ) : null}

          {!isLoading && attendees.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: 'var(--color-cc-muted)' }}>
              No attendees yet.
            </div>
          ) : null}

          {!isLoading && attendees.length > 0 ? (
            <div className="space-y-3">
              {attendees.map((attendee) => (
                <div key={attendee.user_id} className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-cc-text)' }}>
                        {attendee.name || 'Anonymous attendee'}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-cc-muted)' }}>
                        {attendee.email || 'No email available'}
                      </p>
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-cc-muted)' }}>
                      <p>{attendee.account_type || 'Unknown'}</p>
                      <p className="text-xs">{attendee.rsvp_status}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs" style={{ color: 'var(--color-cc-muted)' }}>
                    RSVP on {new Date(attendee.rsvp_created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
