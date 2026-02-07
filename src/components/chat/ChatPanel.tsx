import { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, InputAdornment, Typography, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import type { ChatMessage, ImageDocument } from '@/api/types';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import SuggestedQuestions from './SuggestedQuestions';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (question: string) => void;
  isLoading: boolean;
  imageId?: string;
  metadata?: ImageDocument | null;
}

export default function ChatPanel({ messages, onSendMessage, isLoading, metadata }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed && !isLoading) {
      onSendMessage(trimmed);
      setInput('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ px: 2, py: 1.5 }}>
        Ask a Question
      </Typography>
      <Divider />

      {/* Messages area */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 2,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.length === 0 && !isLoading && (
          <SuggestedQuestions onSelect={onSendMessage} disabled={isLoading} metadata={metadata} />
        )}

        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}
      </Box>

      <Divider />

      {/* Input */}
      <Box sx={{ p: 1.5 }}>
        <TextField
          id="ask-question"
          fullWidth
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          disabled={isLoading}
          size="small"
          multiline
          maxRows={3}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSend} disabled={!input.trim() || isLoading} color="primary" size="small">
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    </Box>
  );
}
