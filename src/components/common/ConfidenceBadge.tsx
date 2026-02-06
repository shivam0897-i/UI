import { Chip, type ChipProps } from '@mui/material';
import { getConfidenceColor, getConfidenceLabel, formatConfidence } from '@/utils';

interface ConfidenceBadgeProps {
  score: number;
  size?: ChipProps['size'];
  showLabel?: boolean;
}

export default function ConfidenceBadge({ score, size = 'small', showLabel = false }: ConfidenceBadgeProps) {
  const label = showLabel
    ? `${getConfidenceLabel(score)} (${formatConfidence(score)})`
    : formatConfidence(score);

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        bgcolor: getConfidenceColor(score),
        color: '#fff',
        fontWeight: 600,
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
      }}
    />
  );
}
