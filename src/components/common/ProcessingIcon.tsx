import { Box, type SxProps, type Theme } from '@mui/material';

interface ProcessingIconProps {
    size?: number;
    sx?: SxProps<Theme>;
}

/**
 * AskFrame Processing Icon (Animated)
 * 
 * Renders the "Mountain & Sun" glyph with a scanning laser animation.
 * Used for loading states, backend waking, and image analysis.
 * 
 * Colors:
 * - Frame/Glyph: Steel (#656D76) - Hardcoded for universal visibility
 * - Scan Line: Sage (#3E7A6C) - Active state
 */
export default function ProcessingIcon({ size = 48, sx }: ProcessingIconProps) {
    const steel = '#656D76';
    const sage = '#3E7A6C';

    return (
        <Box
            component="div"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 0,
                ...sx,
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Frame: Solid Steel */}
                <rect x="10" y="8" width="28" height="32" rx="2" stroke={steel} strokeWidth="1.5" />

                {/* Image Content: Geometric Landscape (Mountain + Sun) */}
                <path d="M12 30L20 20L28 30H12Z" fill="none" stroke={steel} strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M24 30L30 24L36 30" fill="none" stroke={steel} strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="32" cy="16" r="2.5" stroke={steel} strokeWidth="1.5" />

                {/* Scan Line: Sage Laser */}
                <line x1="8" y1="12" x2="40" y2="12" stroke={sage} strokeWidth="2" strokeLinecap="round">
                    <animate attributeName="y1" values="10;38;10" dur="2.5s" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" repeatCount="indefinite" />
                    <animate attributeName="y2" values="10;38;10" dur="2.5s" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;1;1;0" dur="2.5s" keyTimes="0;0.1;0.9;1" repeatCount="indefinite" />
                </line>
            </svg>
        </Box>
    );
}
