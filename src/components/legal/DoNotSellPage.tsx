import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Snackbar,
  List,
  ListItem,
} from '@mui/material';
import { usePrivacySettings } from '../../hooks/usePrivacySettings';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DoNotSellPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const { settings, setCCPAOptOut, isLoading, error } = usePrivacySettings();

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (emailError) {
      validateEmail(newEmail);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await setCCPAOptOut(true);
      setSubmitStatus('success');
      setShowSnackbar(true);
    } catch (error) {
      setSubmitStatus('error');
      console.error('Failed to submit opt-out request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Do Not Sell My Personal Information
        </Typography>

        <Typography variant="body1" paragraph>
          In accordance with the California Consumer Privacy Act (CCPA), 
          you have the right to opt-out of the sale of your personal information.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box component="section" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            What data we collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect the following categories of personal information:
          </Typography>
          <List sx={{ pl: 2 }}>
            <ListItem sx={{ display: 'list-item' }}>Identifying information (name, email, address)</ListItem>
            <ListItem sx={{ display: 'list-item' }}>Information about purchases and transactions</ListItem>
            <ListItem sx={{ display: 'list-item' }}>Information about interactions with our site</ListItem>
            <ListItem sx={{ display: 'list-item' }}>Technical data (IP address, device type)</ListItem>
          </List>
        </Box>

        <Box component="section" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            How we use your data
          </Typography>
          <Typography variant="body1" paragraph>
            We may sell or transfer your data to the following categories of third parties:
          </Typography>
          <List sx={{ pl: 2 }}>
            <ListItem sx={{ display: 'list-item' }}>Advertising networks</ListItem>
            <ListItem sx={{ display: 'list-item' }}>Analytical services</ListItem>
            <ListItem sx={{ display: 'list-item' }}>Marketing partners</ListItem>
          </List>
        </Box>

        <Box component="section" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Opt-out of selling data
          </Typography>
          <Typography variant="body1" paragraph>
            Fill out the form below to opt-out of selling your personal information:
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              error={!!emailError}
              helperText={emailError}
              required
              disabled={isSubmitting || settings?.doNotSell}
              sx={{ mb: 2 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error.message}
              </Alert>
            )}

            {submitStatus === 'success' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Your request to opt-out of selling data has been processed successfully.
              </Alert>
            )}

            {submitStatus === 'error' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                An error occurred while processing your request. Please try again later.
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || settings?.doNotSell || !!emailError}
              sx={{ minWidth: 200 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} />
              ) : settings?.doNotSell ? (
                'Opt-out already completed'
              ) : (
                'Opt-out of selling data'
              )}
            </Button>
          </Box>
        </Box>

        <Box component="section">
          <Typography variant="h6" gutterBottom>
            Additional information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have questions about your rights under CCPA or how we process your personal information, 
            please contact us:
          </Typography>
          <Typography variant="body1">
            Email: privacy@easyvendor.com<br />
            Phone: (555) 123-4567
          </Typography>
        </Box>
      </Paper>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Your opt-out request has been processed successfully"
      />
    </Container>
  );
}; 