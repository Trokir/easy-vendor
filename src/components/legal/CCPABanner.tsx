import React, { useEffect, useState } from 'react';
import { 
  Snackbar, 
  Button, 
  Typography, 
  Box,
  Link,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import { usePrivacySettings } from '../../hooks/usePrivacySettings';

interface CCPABannerProps {
  position?: 'top' | 'bottom';
}

export const CCPABanner: React.FC<CCPABannerProps> = ({ position = 'bottom' }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isCaliforniaUser, setCCPAOptOut, isLoading, error, settings } = usePrivacySettings();

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('ccpaBannerSeen');
    if (isCaliforniaUser && !hasSeenBanner && !isLoading && !settings?.doNotSell) {
      setOpen(true);
    }
  }, [isCaliforniaUser, isLoading, settings?.doNotSell]);

  const handleAccept = () => {
    localStorage.setItem('ccpaBannerSeen', 'true');
    setOpen(false);
  };

  const handleDoNotSell = async () => {
    try {
      await setCCPAOptOut(true);
      localStorage.setItem('ccpaBannerSeen', 'true');
      setOpen(false);
    } catch (error) {
      console.error('Failed to opt out:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!isCaliforniaUser || isLoading || settings?.doNotSell) {
    return null;
  }

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: position, horizontal: 'center' }}
      TransitionComponent={Fade}
      sx={{
        '& .MuiSnackbarContent-root': {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          maxWidth: '600px',
          padding: theme.spacing(2),
          boxShadow: theme.shadows[3],
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error.message}
          </Alert>
        )}
        
        <Typography variant="body1">
          We respect your privacy rights under CCPA.
          We collect and use your data to improve your experience.
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: isMobile ? 'center' : 'flex-start'
        }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAccept}
            size={isMobile ? 'small' : 'medium'}
            sx={{ minWidth: isMobile ? 'auto' : 120 }}
          >
            Accept
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleDoNotSell}
            size={isMobile ? 'small' : 'medium'}
            sx={{ minWidth: isMobile ? 'auto' : 160 }}
          >
            Do Not Sell My Data
          </Button>
          <Link 
            href="/privacy-policy" 
            color="primary"
            sx={{ 
              alignSelf: 'center',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
          >
            Privacy Policy
          </Link>
        </Box>
      </Box>
    </Snackbar>
  );
}; 