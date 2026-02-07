import { useId } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

interface LogoProps {
    variant?: 'mark' | 'full';
    size?: number;
    /** Play draw-in entrance animation on mount (default true) */
    animate?: boolean;
    sx?: SxProps<Theme>;
}

/**
 * AskFrame Brand Logo — Animated
 *
 * Entrance animation sequence:
 *   1. Frame draws itself via stroke-dashoffset  (0 → 0.7s)
 *   2. Sage crosshair fades in                   (0.5 → 0.9s)
 *   3. Crop marks / text fade in                 (0.7 → 1.0s)
 *   4. Sage dot pops in (full variant only)      (0.9 → 1.1s)
 *
 * Uses `currentColor` for the main stroke so it adapts to light / dark theme.
 * Set `animate={false}` for contexts where entrance animation is unwanted.
 */
export default function Logo({ variant = 'mark', size = 32, animate = true, sx }: LogoProps) {
    const uid = useId().replace(/:/g, '');
    const sage = '#3E7A6C';

    const width = variant === 'full' ? size * 5 : size;
    const height = size;

    /* ── Animation CSS (scoped via unique id) ──────────────────────── */
    const markKeyframes = animate
        ? `@keyframes ${uid}-draw{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}` +
          `@keyframes ${uid}-fade{from{opacity:0}to{opacity:1}}` +
          `.${uid}-frame{stroke-dasharray:200;animation:${uid}-draw .7s cubic-bezier(.4,0,.2,1) forwards}` +
          `.${uid}-cross{opacity:0;animation:${uid}-fade .4s ease-out .5s forwards}` +
          `.${uid}-marks{opacity:0;animation:${uid}-fade .3s ease-out .7s forwards}`
        : '';

    const fullKeyframes = animate
        ? `@keyframes ${uid}-draw{from{stroke-dashoffset:120}to{stroke-dashoffset:0}}` +
          `@keyframes ${uid}-fade{from{opacity:0}to{opacity:1}}` +
          `@keyframes ${uid}-pop{from{r:0;opacity:0}to{r:2;opacity:1}}` +
          `.${uid}-frame{stroke-dasharray:120;animation:${uid}-draw .7s cubic-bezier(.4,0,.2,1) forwards}` +
          `.${uid}-cross{opacity:0;animation:${uid}-fade .4s ease-out .5s forwards}` +
          `.${uid}-text{opacity:0;animation:${uid}-fade .4s ease-out .7s forwards}` +
          `.${uid}-dot{opacity:0;animation:${uid}-pop .25s ease-out .95s forwards}`
        : '';

    const a = animate; // shorthand

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
            {variant === 'mark' ? (
                <svg
                    width={width}
                    height={height}
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {a && <style>{markKeyframes}</style>}

                    {/* Frame — draws itself on */}
                    <rect
                        className={a ? `${uid}-frame` : undefined}
                        x="10" y="16" width="44" height="32" rx="2"
                        stroke="currentColor" strokeWidth="2.5"
                    />

                    {/* Sage crosshair — fades in */}
                    <g className={a ? `${uid}-cross` : undefined}>
                        <path d="M32 28V36" stroke={sage} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M28 32H36" stroke={sage} strokeWidth="2.5" strokeLinecap="round" />
                    </g>

                    {/* Crop marks — fade in last */}
                    <g className={a ? `${uid}-marks` : undefined} opacity={a ? undefined : 0.6}>
                        <path d="M8 14L14 14" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 14L8 20" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M56 14L50 14" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M56 14L56 20" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 50L14 50" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 50L8 44" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M56 50L50 50" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M56 50L56 44" stroke="currentColor" strokeWidth="1.5" />
                    </g>
                </svg>
            ) : (
                <svg
                    width={width}
                    height={height}
                    viewBox="0 0 200 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {a && <style>{fullKeyframes}</style>}

                    {/* Icon — frame draws, then crosshair fades */}
                    <g transform="translate(4, 4)">
                        <rect
                            className={a ? `${uid}-frame` : undefined}
                            x="2" y="5" width="28" height="20" rx="1.5"
                            stroke="currentColor" strokeWidth="2"
                        />
                        <g className={a ? `${uid}-cross` : undefined}>
                            <path d="M16 12V18" stroke={sage} strokeWidth="2" strokeLinecap="round" />
                            <path d="M13 15H19" stroke={sage} strokeWidth="2" strokeLinecap="round" />
                        </g>
                    </g>

                    {/* "ASKFRAME" text — fades in */}
                    <text
                        className={a ? `${uid}-text` : undefined}
                        x="44" y="24"
                        fontFamily="system-ui, -apple-system, sans-serif"
                        fontWeight="700"
                        fontSize="18"
                        letterSpacing="0.08em"
                        fill="currentColor"
                    >
                        ASKFRAME
                    </text>

                    {/* Sage dot — pops in last */}
                    <circle
                        className={a ? `${uid}-dot` : undefined}
                        cx="152" cy="24" r={a ? 0 : 2}
                        fill={sage}
                    />
                </svg>
            )}
        </Box>
    );
}
