import { useState, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ClearIcon from '@mui/icons-material/Clear';
import { useDropzone } from 'react-dropzone';

type SearchMode = 'text' | 'image';

interface SearchBarProps {
  onTextSearch: (query: string) => void;
  onImageSearch: (file: File) => void;
  isSearching: boolean;
}

export default function SearchBar({ onTextSearch, onImageSearch, isSearching }: SearchBarProps) {
  const [mode, setMode] = useState<SearchMode>('text');
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Submit on debounced value change when length > 2
  const handleTextSubmit = useCallback(() => {
    if (query.trim().length > 0) {
      onTextSearch(query.trim());
    }
  }, [query, onTextSearch]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (file) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        onImageSearch(file);
      }
    },
    [onImageSearch],
  );

  const { getRootProps, getInputProps: getDropInputProps, open: openFilePicker } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  });

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, v) => v && setMode(v as SearchMode)}
          size="small"
        >
          <ToggleButton value="text">
            <Tooltip title="Text search"><TextFieldsIcon /></Tooltip>
          </ToggleButton>
          <ToggleButton value="image">
            <Tooltip title="Image search"><ImageSearchIcon /></Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        {mode === 'text' && (
          <TextField
            id="search-query"
            ref={inputRef}
            fullWidth
            placeholder="Search images by description, objects, or scenes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
                  </InputAdornment>
                ),
                endAdornment: query && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setQuery('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}

        {mode === 'image' && (
          <Box
            {...getRootProps()}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1.5,
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' },
            }}
            onClick={openFilePicker}
          >
            <input {...getDropInputProps()} id="search-image-input" name="search-image" />
            {imagePreview ? (
              <>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Search image"
                  sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }}
                />
                <Box sx={{ flex: 1, typography: 'body2' }}>{imageFile?.name}</Box>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); clearImage(); }}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                <ImageSearchIcon color="action" />
                <Box sx={{ flex: 1, typography: 'body2', color: 'text.secondary' }}>
                  Drop an image or click to search by visual similarity
                </Box>
              </>
            )}
            {isSearching && <CircularProgress size={24} />}
          </Box>
        )}
      </Box>
    </Box>
  );
}
