import { Box, Typography, Paper, Link as MuiLink } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '@/api/types';
import { ConfidenceBadge } from '@/components/common';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 1.5,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: '80%',
          p: 1.5,
          borderRadius: 1,
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          color: isUser ? '#fff' : 'text.primary',
          border: isUser ? 'none' : 1,
          borderColor: 'divider',
          borderBottomRightRadius: isUser ? 4 : undefined,
          borderBottomLeftRadius: !isUser ? 4 : undefined,
        }}
      >
        {isUser ? (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>
        ) : (
          <Box
            sx={{
              '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
              '& strong': { fontWeight: 700 },
              '& em': { fontStyle: 'italic' },
              '& ul, & ol': { m: 0, mb: 1, pl: 2.5, '&:last-child': { mb: 0 } },
              '& li': { mb: 0.25 },
              '& code': {
                fontFamily: 'monospace',
                fontSize: '0.85em',
                bgcolor: 'action.hover',
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
              },
              '& pre': {
                bgcolor: 'action.hover',
                p: 1.5,
                borderRadius: 1,
                overflow: 'auto',
                mb: 1,
                '&:last-child': { mb: 0 },
                '& code': { bgcolor: 'transparent', p: 0 },
              },
              '& a': { color: 'primary.main' },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                mt: 0,
                mb: 0.5,
                fontWeight: 600,
                lineHeight: 1.3,
              },
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}
          >
            <ReactMarkdown
              components={{
                a: ({ href, children }) => (
                  <MuiLink href={href} target="_blank" rel="noopener noreferrer" underline="hover">
                    {children}
                  </MuiLink>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </Box>
        )}
        {message.confidence != null && (
          <Box sx={{ mt: 0.75 }}>
            <ConfidenceBadge score={message.confidence} showLabel />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
