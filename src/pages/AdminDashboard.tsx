import { useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import RequestDetailModal from '../components/RequestDetailModal';
import RequestSection from '../components/RequestSection';
import StatsCard from '../components/StatsCard';
import { useRequests } from '../context/RequestContext';
import type { AdminQueueItem } from '../types/admin';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function AdminDashboard() {
  const {
    queueItems,
    isLoading,
    error,
    stats,
    refreshQueue,
    handleApprove,
    handleReject,
    actionLoadingId,
  } = useRequests();

  const [selectedRequest, setSelectedRequest] = useState<AdminQueueItem | null>(null);

  const sectionStats = useMemo(
    () => ({
      users: queueItems.filter((item) => item.entity_type === 'user').length,
      organizations: queueItems.filter((item) => item.entity_type === 'organization').length,
    }),
    [queueItems],
  );

  return (
    <div className="min-h-screen px-4 pb-12 pt-6 md:px-6">
      <div className="mx-auto max-w-7xl">
        <Navbar />

        <main>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-cc-text)' }}>
                Admin Dashboard
              </h1>
              <p className="mt-2" style={{ color: 'var(--color-cc-muted)' }}>
                Review the pending verification queue from Supabase.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refreshQueue()}
              disabled={isLoading}
              className="btn-accent self-start rounded-xl px-5 py-2.5 text-sm md:self-auto"
            >
              {isLoading ? 'Refreshing...' : 'Refresh Queue'}
            </button>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-6 rounded-3xl border border-violet-200/70 bg-violet-50 px-4 py-3 text-sm text-slate-700">
              Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` to connect
              to your Supabase project.
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard label="Total Pending" value={stats.totalPending} icon="⏳" />
            <StatsCard label="User Requests" value={stats.usersPending} icon="👤" />
            <StatsCard label="Organization Requests" value={stats.organizationsPending} icon="🏢" />
            <StatsCard label="Overdue" value={stats.overdue} icon="⚠️" />
          </section>

          {isLoading && queueItems.length === 0 ? (
            <div className="glass-card px-6 py-16 text-center text-slate-600">
              Loading pending verification queue from Supabase...
            </div>
          ) : (
            <div id="requests" className="space-y-8">
              <RequestSection
                title="Verification Queue"
                icon="📋"
                queueItems={queueItems}
                onViewDetails={setSelectedRequest}
                onApprove={handleApprove}
                onReject={handleReject}
                approvingId={actionLoadingId}
                rejectingId={actionLoadingId}
              />
            </div>
          )}

          <section id="settings" className="glass-card mt-10 p-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-cc-text)' }}>
              Settings
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
              Connected view:{' '}
              <code
                style={{
                  background: 'rgba(156,124,255,0.12)',
                  color: 'var(--color-cc-accent)',
                  borderRadius: '6px',
                  padding: '2px 8px',
                }}
              >
                v_verification_queue
              </code>
            </p>
            <p className="mt-3 text-sm" style={{ color: 'var(--color-cc-muted)' }}>
              Loaded records: {queueItems.length} total ({sectionStats.users} users,{' '}
              {sectionStats.organizations} organizations).
            </p>
          </section>
        </main>
      </div>

      {selectedRequest && (
        <RequestDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      )}
    </div>
  );
}
