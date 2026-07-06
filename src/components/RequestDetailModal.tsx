import { useState } from 'react';
import type { AdminQueueItem } from '../types/admin';
import { useRequests } from '../context/RequestContext';

interface RequestDetailModalProps {
  request: AdminQueueItem;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="py-3 last:border-b-0" style={{ borderBottom: '1px solid rgba(156,124,255,0.15)' }}>
      <dt className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-cc-muted)' }}>
        {label}
      </dt>
      <dd className="mt-1 text-sm" style={{ color: 'var(--color-cc-text)' }}>
        {value ?? '—'}
      </dd>
    </div>
  );
}

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
}

export default function RequestDetailModal({ request, onClose }: RequestDetailModalProps) {
  const { handleApprove, handleReject, actionLoadingId } = useRequests();
  const [actionError, setActionError] = useState<string | null>(null);
  const isPending = request.decision === null;
  const isApproving = actionLoadingId === request.request_id && isPending;
  const isRejecting = actionLoadingId === request.request_id && isPending;

  const runApprove = async () => {
    setActionError(null);

    try {
      await handleApprove(request.request_id);
      onClose();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve request.');
    }
  };

  const runReject = async () => {
    setActionError(null);

    try {
      await handleReject(request.request_id);
      onClose();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reject request.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(15,12,26,0.7)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="glass-card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-detail-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-violet-400">
              {request.entity_type === 'organization' ? 'Organization' : 'User'} verification
            </p>
            <h2 id="request-detail-title" className="mt-1 text-2xl font-bold" style={{ color: 'var(--color-cc-text)' }}>
              {request.entity_name ?? 'Unnamed entity'}
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
              Status: {request.decision === null ? 'Pending' : request.decision}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 transition"
            style={{ color: 'var(--color-cc-muted)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <section className="mb-6">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-violet-400">
            Request Details
          </h3>
          <dl>
            <DetailRow label="Request ID" value={request.request_id} />
            <DetailRow label="Entity Type" value={request.entity_type} />
            <DetailRow label="Entity Name" value={request.entity_name} />
            <DetailRow label="Contact" value={request.entity_contact} />
            <DetailRow label="Submitted At" value={formatDate(request.submitted_at)} />
            <DetailRow label="Overdue" value={request.is_overdue ? 'Yes' : 'No'} />
            <DetailRow label="Rejection Note" value={request.rejection_note} />
          </dl>
        </section>

        {actionError && (
          <p
            className="mb-4 rounded-xl border border-red-200/50 px-4 py-3 text-sm"
            style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171' }}
          >
            {actionError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!isPending || isApproving}
            onClick={runApprove}
            className="btn-accent rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60"
          >
            {isApproving ? 'Approving…' : 'Approve'}
          </button>
          <button
            type="button"
            disabled={!isPending || isRejecting}
            onClick={runReject}
            className="rounded-xl border border-red-200/50 px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60"
            style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171' }}
          >
            {isRejecting ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}
