import type { AdminQueueItem } from '../types/admin';

interface RequestCardProps {
  request: AdminQueueItem;
  onViewDetails: (request: AdminQueueItem) => void;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

function formatDate(value: string | null) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function RequestCard({
  request,
  onViewDetails,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: RequestCardProps) {
  const displayName = request.entity_name ?? 'Unknown entity';
  const isPending = request.decision === null;
  const entityLabel = request.entity_type === 'organization' ? 'Organization' : 'User';

  return (
    <article className="glass-card flex h-full flex-col p-5 transition hover:border-purple-200">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-cc-text)' }}>
            {displayName}
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
            {request.entity_contact ?? 'No contact provided'}
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
            {entityLabel}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            isPending
              ? 'border-violet-200/70 bg-violet-100 text-violet-700'
              : 'border-slate-200 bg-slate-100 text-slate-600'
          }`}
        >
          {isPending ? 'Pending' : 'Resolved'}
        </span>
      </div>

      <dl className="mb-5 flex-1 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt style={{ color: 'var(--color-cc-muted)' }}>Request ID</dt>
          <dd className="text-right" style={{ color: 'var(--color-cc-text)' }}>
            {request.request_id}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt style={{ color: 'var(--color-cc-muted)' }}>Submitted</dt>
          <dd className="text-right" style={{ color: 'var(--color-cc-text)' }}>
            {formatDate(request.submitted_at)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt style={{ color: 'var(--color-cc-muted)' }}>Overdue</dt>
          <dd className="text-right" style={{ color: 'var(--color-cc-text)' }}>
            {request.is_overdue ? 'Yes' : 'No'}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onApprove(request.request_id)}
          disabled={!isPending || isApproving}
          className="btn-accent w-full rounded-xl px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isApproving ? 'Approving…' : 'Approve'}
        </button>
        <button
          type="button"
          onClick={() => onReject(request.request_id)}
          disabled={!isPending || isRejecting}
          className="rounded-xl border border-red-200/60 px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
          style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171' }}
        >
          {isRejecting ? 'Rejecting…' : 'Reject'}
        </button>
        <button
          type="button"
          onClick={() => onViewDetails(request)}
          className="rounded-xl border px-4 py-2.5 text-sm transition"
          style={{
            borderColor: 'rgba(156,124,255,0.25)',
            backgroundColor: 'rgba(156,124,255,0.08)',
            color: 'var(--color-cc-text)',
          }}
        >
          View Details
        </button>
      </div>
    </article>
  );
}
