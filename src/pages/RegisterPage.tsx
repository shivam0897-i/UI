import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Link,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '@/contexts/AuthContext';

// ─── Validation helpers ─────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /\d/.test(pw) },
  { label: 'One special character (!@#$...)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function getPasswordStrength(pw: string): number {
  if (!pw) return 0;
  return PASSWORD_RULES.filter((r) => r.test(pw)).length / PASSWORD_RULES.length;
}

function strengthColor(value: number): 'error' | 'warning' | 'info' | 'success' {
  if (value < 0.4) return 'error';
  if (value < 0.6) return 'warning';
  if (value < 1) return 'info';
  return 'success';
}

function strengthLabel(value: number): string {
  if (value < 0.4) return 'Weak';
  if (value < 0.6) return 'Fair';
  if (value < 1) return 'Good';
  return 'Strong';
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useAuth();

  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  // Redirect away if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Track whether fields have been interacted with (show errors only after blur)
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Validation state
  const emailValid = EMAIL_REGEX.test(email.trim());
  const emailError = emailTouched && email.trim().length > 0 && !emailValid;

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const allPasswordRulesMet = passwordStrength === 1;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit =
    emailValid &&
    allPasswordRulesMet &&
    password === confirmPassword &&
    confirmPassword.length > 0 &&
    !loading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      await register(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper sx={{ maxWidth: 420, width: '100%', p: 4, borderRadius: 3 }}>
        {/* Back link */}
        <Box sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" underline="hover" variant="body2" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            ← Back to home
          </Link>
        </Box>

        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '3px',
              border: (t) => `2px solid ${t.palette.text.primary}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Box sx={{ width: 10, height: 10, bgcolor: 'primary.main', borderRadius: '2px' }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            Create an account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Get started with AskFrame
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <TextField
            id="register-email"
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            autoComplete="email"
            autoFocus
            error={emailError}
            helperText={emailError ? 'Enter a valid email address' : undefined}
            sx={{ mb: 2 }}
          />

          {/* Password */}
          <TextField
            id="register-password"
            label="Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            autoComplete="new-password"
            error={passwordTouched && !allPasswordRulesMet && password.length > 0}
            sx={{ mb: 0.5 }}
          />

          {/* Password strength meter + rules (shown once user starts typing) */}
          {password.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, mb: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength * 100}
                  color={strengthColor(passwordStrength)}
                  sx={{ flex: 1, height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" color={`${strengthColor(passwordStrength)}.main`} fontWeight={600}>
                  {strengthLabel(passwordStrength)}
                </Typography>
              </Box>
              <List dense disablePadding sx={{ mt: 0.5 }}>
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <ListItem key={rule.label} disableGutters disablePadding sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        {passed ? (
                          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : (
                          <CancelIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={rule.label}
                        slotProps={{
                          primary: {
                            variant: 'caption',
                            color: passed ? 'text.primary' : 'text.disabled',
                          },
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}

          {/* Confirm Password */}
          <TextField
            id="register-confirm-password"
            label="Confirm Password"
            type="password"
            fullWidth
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            error={passwordMismatch}
            helperText={passwordMismatch ? 'Passwords do not match' : undefined}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={!canSubmit}
            sx={{ py: 1.3 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover">
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
