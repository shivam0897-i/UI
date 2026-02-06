import { useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import type { ImageDocument } from '@/api/types';

interface SuggestedQuestionsProps {
  questions?: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
  metadata?: ImageDocument | null;
}

const DEFAULT_QUESTIONS = [
  'What objects are in this image?',
  'Describe the scene in detail',
  'What colors dominate this image?',
  'Is there any text visible?',
  'What is the mood of this image?',
];

/** Generate context-aware questions based on image perception results. */
function buildDynamicQuestions(metadata: ImageDocument): string[] {
  const questions: string[] = [];

  if (metadata.objects?.length > 0) {
    const labels = metadata.objects.slice(0, 3).map((o) => o.label);
    questions.push(`Tell me more about the ${labels[0]} in this image`);
    if (labels.length > 1) {
      questions.push(`What is the relationship between the ${labels[0]} and the ${labels[1]}?`);
    }
  }

  if (metadata.ocr_text) {
    questions.push('What does the text in this image say?');
  }

  if (metadata.scene_tags?.length > 0) {
    questions.push('Describe the scene and setting in detail');
  }

  questions.push('What colors dominate this image?');
  questions.push('What is the mood or atmosphere of this image?');

  return questions.slice(0, 5);
}

export default function SuggestedQuestions({
  questions,
  onSelect,
  disabled = false,
  metadata,
}: SuggestedQuestionsProps) {
  const displayQuestions = useMemo(() => {
    if (questions && questions.length > 0) return questions;
    if (metadata) return buildDynamicQuestions(metadata);
    return DEFAULT_QUESTIONS;
  }, [questions, metadata]);
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <HelpOutlineIcon fontSize="small" color="action" />
        <Typography variant="caption" color="text.secondary">
          Try asking:
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {displayQuestions.map((q) => (
          <Chip
            key={q}
            label={q}
            size="small"
            variant="outlined"
            onClick={() => onSelect(q)}
            disabled={disabled}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>
    </Box>
  );
}
