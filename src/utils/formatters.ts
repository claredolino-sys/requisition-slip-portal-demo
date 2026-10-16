import { RISStatus } from '../types';

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadgeClass(status: RISStatus | string): string {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'issued':
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'under_review':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pending':
    default:
      return 'bg-amber-100 text-amber-800 border-amber-200';
  }
}

export function formatStatusLabel(status: RISStatus | string): string {
  if (!status) return 'Pending';
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
