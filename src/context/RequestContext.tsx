import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { getPendingQueue, rejectRequest, verifyRequest, type AdminQueueItem } from '../lib/onboardingService';
import type { VerificationQueueStats } from '../types/admin';

interface RequestContextValue {
  queueItems: AdminQueueItem[];
  isLoading: boolean;
  error: string | null;
  stats: VerificationQueueStats;
  refreshQueue: () => Promise<void>;
  handleApprove: (requestId: string) => Promise<void>; // 👈 Simplified (entityId dropped)
  handleReject: (requestId: string, reason?: string) => Promise<void>; // 👈 Enhanced with optional reason note
  actionLoadingId: string | null;
}

const RequestContext = createContext<RequestContextValue | null>(null);

function computeStats(queueItems: AdminQueueItem[]): VerificationQueueStats {
  return {
    totalPending: queueItems.length,
    usersPending: queueItems.filter((item) => item.entity_type === 'user').length,
    organizationsPending: queueItems.filter((item) => item.entity_type === 'organization').length,
    overdue: queueItems.filter((item) => item.is_overdue).length,
  };
}

export function RequestProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [queueItems, setQueueItems] = useState<AdminQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const refreshQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getPendingQueue();
      setQueueItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verification queue.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void refreshQueue();
    } else {
      setQueueItems([]);
      setIsLoading(false);
      setError(null);
    }
  }, [isAuthenticated, refreshQueue]);

  // 👈 Only requires requestId now, making frontend triggers incredibly streamlined
  const handleApprove = useCallback(async (requestId: string) => {
    setActionLoadingId(requestId);
    setError(null);

    try {
      await verifyRequest(requestId);
      setQueueItems((current) => current.filter((item) => item.request_id !== requestId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request.');
      throw err;
    } finally {
      setActionLoadingId(null);
    }
  }, []);

  // 👈 Accepts an optional reason note to pass straight to the database RPC
  const handleReject = useCallback(async (requestId: string, reason?: string) => {
    setActionLoadingId(requestId);
    setError(null);

    try {
      await rejectRequest(requestId, reason || null);
      setQueueItems((current) => current.filter((item) => item.request_id !== requestId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request.');
      throw err;
    } finally {
      setActionLoadingId(null);
    }
  }, []);

  const stats = useMemo(() => computeStats(queueItems), [queueItems]);

  const value = useMemo(
    () => ({
      queueItems,
      isLoading,
      error,
      stats,
      refreshQueue,
      handleApprove,
      handleReject,
      actionLoadingId,
    }),
    [queueItems, isLoading, error, stats, refreshQueue, handleApprove, handleReject, actionLoadingId],
  );

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
}

export function useRequests() {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within RequestProvider');
  }

  return context;
}