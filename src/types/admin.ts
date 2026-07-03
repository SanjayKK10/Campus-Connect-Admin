export type UserType = 'student' | 'alumni' | 'business';

export type RequestStatus = 'pending' | 'verified' | 'rejected';

export type StatusFilter = 'all' | RequestStatus;

export interface UserProfile {
  user_id: string;
  account_type: UserType;
  verification_status: RequestStatus;
  name: string | null;
  email: string | null;
  dob: string | null;
  gender: string | null;
  college: string | null;
  department: string | null;
  year_of_study: number | null;
  passout_year: number | null;
  verified_at: string | null;
}

export interface DashboardStats {
  totalPending: number;
  studentsPending: number;
  alumniPending: number;
  businessesPending: number;
}

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

export interface VerificationQueueStats {
  totalPending: number;
  usersPending: number;
  organizationsPending: number;
  overdue: number;
}

export const ADMIN_EMAIL = 'admin@campusconnect.com';
export const ADMIN_PASSWORD = 'Admin@123';

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
};

export const USER_TYPE_LABELS: Record<UserType, string> = {
  student: 'Student',
  alumni: 'Alumni',
  business: 'Business',
};
