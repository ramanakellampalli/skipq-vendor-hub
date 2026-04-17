export const colors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  primary: '#FF7F00',
  primaryDark: '#E06600',
  navy: '#1A2332',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#00B873',
  error: '#FF4444',
  info: '#4DB8FF',
  pending: '#9CA3AF',
};

export const status = {
  PENDING: { color: colors.pending, label: 'Pending' },
  ACCEPTED: { color: colors.info, label: 'Accepted' },
  PREPARING: { color: colors.primary, label: 'Preparing' },
  READY: { color: colors.success, label: 'Ready' },
  COMPLETED: { color: colors.textSecondary, label: 'Completed' },
  REJECTED: { color: colors.error, label: 'Rejected' },
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
