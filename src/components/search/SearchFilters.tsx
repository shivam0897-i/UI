import { Box, Chip, Typography, Slider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';

interface SearchFiltersProps {
  minConfidence: number;
  onMinConfidenceChange: (val: number) => void;
  objectFilters: string[];
  availableObjects: string[];
  onObjectToggle: (obj: string) => void;
  sceneFilters: string[];
  availableScenes: string[];
  onSceneToggle: (scene: string) => void;
}

export default function SearchFilters({
  minConfidence,
  onMinConfidenceChange,
  objectFilters,
  availableObjects,
  onObjectToggle,
  sceneFilters,
  availableScenes,
  onSceneToggle,
}: SearchFiltersProps) {
  return (
    <Accordion sx={{ borderRadius: 2, '&::before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneIcon fontSize="small" />
          <Typography variant="subtitle2">Filters</Typography>
          {(objectFilters.length > 0 || sceneFilters.length > 0 || minConfidence > 0) && (
            <Chip
              label={objectFilters.length + sceneFilters.length + (minConfidence > 0 ? 1 : 0)}
              size="small"
              color="primary"
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {/* Confidence slider */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Min Confidence: {(minConfidence * 100).toFixed(0)}%
          </Typography>
          <Slider
            value={minConfidence}
            onChange={(_, v) => onMinConfidenceChange(v as number)}
            min={0}
            max={1}
            step={0.05}
            size="small"
          />
        </Box>

        {/* Object filters */}
        {availableObjects.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Objects
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {availableObjects.map((obj) => (
                <Chip
                  key={obj}
                  label={obj}
                  size="small"
                  variant={objectFilters.includes(obj) ? 'filled' : 'outlined'}
                  color={objectFilters.includes(obj) ? 'primary' : 'default'}
                  onClick={() => onObjectToggle(obj)}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Scene filters */}
        {availableScenes.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Scenes
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {availableScenes.map((scene) => (
                <Chip
                  key={scene}
                  label={scene}
                  size="small"
                  variant={sceneFilters.includes(scene) ? 'filled' : 'outlined'}
                  color={sceneFilters.includes(scene) ? 'secondary' : 'default'}
                  onClick={() => onSceneToggle(scene)}
                />
              ))}
            </Box>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
