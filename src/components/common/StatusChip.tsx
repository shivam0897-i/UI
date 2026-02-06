import { Chip, type ChipProps } from '@mui/material';
import type { ImageStatus } from '@/api/types';

const STATUS_CONFIG: Record<ImageStatus, { label: string; color: ChipProps['color'] }> = {
  completed: { label: 'Completed', color: 'success' },
  processing: { label: 'Processing', color: 'warning' },
  pending: { label: 'Pending', color: 'info' },
  failed: { label: 'Failed', color: 'error' },
};

interface StatusChipProps {
  status: ImageStatus;
  size?: ChipProps['size'];
}

export default function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'default' as const };
  return <Chip label={config.label} color={config.color} size={size} variant="outlined" />;
}
