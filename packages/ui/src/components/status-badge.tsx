import { cn } from '../lib/utils';
import type { ComponentType } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; icon: ComponentType<{ className?: string }>; color: string }> = {
  DRAFT: { label: 'Draft', icon: HelpCircle, color: 'bg-gray-100 text-gray-700' },
  PENDING: { label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: 'Disetujui', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Ditolak', icon: XCircle, color: 'bg-red-100 text-red-700' },
  ACTIVE: { label: 'Aktif', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Tidak Aktif', icon: XCircle, color: 'bg-gray-100 text-gray-700' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toUpperCase()] ?? { label: status, icon: HelpCircle, color: 'bg-gray-100 text-gray-700' };
  const Icon = config.icon;

  return (
    <span
      className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.color, className)}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}