import React from 'react';
import {
  Snackbar,
  Button,
  Box,
  Typography,
  Link,
  SnackbarContent,
} from '@mui/material';

interface CookieBannerProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
  message?: string;
  policyLink?: string;
  acceptButtonText?: string;
  declineButtonText?: string;
  learnMoreButtonText?: string;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({
  open,
  onAccept,
  onDecline,
  message = 'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.',
  policyLink = '/cookies',
  acceptButtonText = 'Accept all cookies',
  declineButtonText = 'Decline',
  learnMoreButtonText = 'Learn more',
}) => {
  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 16, sm: 24 } }}
    >
      <SnackbarContent
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {message}{' '}
              <Link
                href={policyLink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textDecoration: 'underline' }}
              >
                {learnMoreButtonText}
              </Link>
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={onDecline}
                sx={{ minWidth: 100 }}
              >
                {declineButtonText}
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={onAccept}
                sx={{ minWidth: 100 }}
              >
                {acceptButtonText}
              </Button>
            </Box>
          </Box>
        }
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 3,
          '& .MuiSnackbarContent-message': {
            p: 0,
          },
        }}
      />
    </Snackbar>
  );
}; 