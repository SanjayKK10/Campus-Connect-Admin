import type { AdminQueueItem } from '../types/admin';
import RequestCard from './RequestCard';

interface RequestSectionProps {
  title: string;
  icon: string;
  queueItems: AdminQueueItem[];
  onViewDetails: (request: AdminQueueItem) => void;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  approvingId: string | null;
  rejectingId: string | null;
}

export default function RequestSection({
  title,
  icon,
  queueItems,
  onViewDetails,
  onApprove,
  onReject,
  approvingId,
  rejectingId,
}: RequestSectionProps) {
  return (
    <section className="glass-card p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--color-cc-text)' }}>
            <span>{icon}</span>
            {title}
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
            {queueItems.length} request{queueItems.length === 1 ? '' : 's'} shown
          </p>
        </div>
      </div>

      {queueItems.length === 0 ? (
        <div
          className="rounded-3xl border px-4 py-10 text-center"
          style={{
            borderColor: 'rgba(156,124,255,0.2)',
            backgroundColor: 'rgba(156,124,255,0.06)',
            color: 'var(--color-cc-muted)',
          }}
        >
          No pending verification items found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {queueItems.map((request) => (
            <RequestCard
              key={request.request_id}
              request={request}
              onViewDetails={onViewDetails}
              onApprove={onApprove}
              onReject={onReject}
              isApproving={approvingId === request.request_id}
              isRejecting={rejectingId === request.request_id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
