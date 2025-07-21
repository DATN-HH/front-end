import { ShiftStatus } from '@/api/v1/publish-shifts';

// Status color configuration
export const STATUS_COLORS = {
  DRAFT: '#9CA3AF',
  PENDING: '#FACC15',
  PUBLISHED: '#22C55E',
  CONFLICTED: '#EF4444',
  REQUEST_CHANGE: '#FB923C',
  APPROVED_LEAVE_VALID: '#3B82F6',
  APPROVED_LEAVE_EXCEEDED: '#8B5CF6',
} as const;

export interface StatusConfig {
  color: string;
  label: string;
  textColor: string;
}

export const getStatusConfig = (status: ShiftStatus): StatusConfig => {
  const configs: Record<ShiftStatus, StatusConfig> = {
    [ShiftStatus.DRAFT]: {
      color: STATUS_COLORS.DRAFT,
      label: 'Draft',
      textColor: '#FFFFFF',
    },
    [ShiftStatus.PENDING]: {
      color: STATUS_COLORS.PENDING,
      label: 'Pending',
      textColor: '#000000',
    },
    [ShiftStatus.PUBLISHED]: {
      color: STATUS_COLORS.PUBLISHED,
      label: 'Published',
      textColor: '#FFFFFF',
    },
    [ShiftStatus.CONFLICTED]: {
      color: STATUS_COLORS.CONFLICTED,
      label: 'Conflicted',
      textColor: '#FFFFFF',
    },
    [ShiftStatus.REQUEST_CHANGE]: {
      color: STATUS_COLORS.REQUEST_CHANGE,
      label: 'Change Requested',
      textColor: '#FFFFFF',
    },
    [ShiftStatus.APPROVED_LEAVE_VALID]: {
      color: STATUS_COLORS.APPROVED_LEAVE_VALID,
      label: 'Approved Leave',
      textColor: '#FFFFFF',
    },
    [ShiftStatus.APPROVED_LEAVE_EXCEEDED]: {
      color: STATUS_COLORS.APPROVED_LEAVE_EXCEEDED,
      label: 'Leave Exceeded',
      textColor: '#FFFFFF',
    },
  };

  return (
    configs[status] || {
      color: '#6B7280',
      label: 'Unknown',
      textColor: '#FFFFFF',
    }
  );
};

// Helper function to check if status should be counted in requirements
// Only these statuses count toward fulfilling shift requirements:
// - DRAFT: Shifts in draft state (being planned)
// - PENDING: Shifts pending approval
// - PUBLISHED: Confirmed shifts
//
// These statuses DO NOT count toward requirements:
// - CONFLICTED: Shifts with conflicts
// - REQUEST_CHANGE: Shifts requested to be changed
// - APPROVED_LEAVE_EXCEEDED: Leave that exceeds allowed limits
// - APPROVED_LEAVE_VALID: Approved leave within limits
export const isStatusCountedInRequirements = (status: ShiftStatus): boolean => {
  return [
    ShiftStatus.DRAFT,
    ShiftStatus.PENDING,
    ShiftStatus.PUBLISHED,
    // ShiftStatus.APPROVED_LEAVE_VALID
  ].includes(status);
};

// Helper function to get hex color for CSS styles
export const getStatusHexColor = (status: ShiftStatus): string => {
  return getStatusConfig(status).color;
};

// Helper function to get contrasting text color
export const getStatusTextColor = (status: ShiftStatus): string => {
  return getStatusConfig(status).textColor;
};
