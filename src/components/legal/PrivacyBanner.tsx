import React, { useEffect, useState } from 'react';
import { 
  Snackbar, 
  Button, 
  Typography, 
  Box,
  Link,
  useTheme,
  useMediaQuery,
  Alert,
  Fade
} from '@mui/material';
import { usePrivacySettings } from '../../hooks/usePrivacySettings';
import { PrivacyLegislation } from '../../services/geoLocation.service';

interface PrivacyBannerProps {
  position?: 'top' | 'bottom';
}

// Информация о законодательстве разных штатов
const LEGISLATION_INFO = {
  [PrivacyLegislation.CCPA]: {
    title: 'California Consumer Privacy Act Notice',
    description: 'We respect your privacy rights under CCPA. We collect and use your data to improve your experience.',
    primaryButton: 'Accept',
    secondaryButton: 'Do Not Sell My Data',
    learnMoreLink: '/do-not-sell',
  },
  [PrivacyLegislation.CDPA]: {
    title: 'Virginia Privacy Notice',
    description: 'Under Virginia\'s CDPA, you have the right to access, correct, and delete your personal data.',
    primaryButton: 'Accept',
    secondaryButton: 'Manage My Data',
    learnMoreLink: '/privacy-choices',
  },
  [PrivacyLegislation.CPA]: {
    title: 'Colorado Privacy Notice',
    description: 'Colorado\'s CPA gives you rights over your personal data. Learn how you can exercise these rights.',
    primaryButton: 'Accept',
    secondaryButton: 'Manage Preferences',
    learnMoreLink: '/privacy-choices',
  },
  [PrivacyLegislation.CTDPA]: {
    title: 'Connecticut Privacy Notice',
    description: 'Connecticut\'s privacy law provides you with control over your personal information.',
    primaryButton: 'Accept',
    secondaryButton: 'Privacy Choices',
    learnMoreLink: '/privacy-choices',
  },
  [PrivacyLegislation.UCPA]: {
    title: 'Utah Privacy Notice',
    description: 'Utah\'s Consumer Privacy Act gives you control over your personal data.',
    primaryButton: 'Accept',
    secondaryButton: 'Privacy Choices',
    learnMoreLink: '/privacy-choices',
  },
  [PrivacyLegislation.NONE]: {
    title: 'Privacy Notice',
    description: 'We value your privacy. This site collects data to enhance your experience.',
    primaryButton: 'Accept',
    secondaryButton: 'Privacy Choices',
    learnMoreLink: '/privacy-policy',
  }
};

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ position = 'bottom' }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { 
    isCaliforniaUser, 
    applicableLegislation, 
    setCCPAOptOut, 
    isLoading, 
    error, 
    settings 
  } = usePrivacySettings();

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('privacyBannerSeen');
    if (!hasSeenBanner && !isLoading && !settings?.doNotSell) {
      setOpen(true);
    }
  }, [isLoading, settings?.doNotSell]);

  const handleAccept = () => {
    localStorage.setItem('privacyBannerSeen', 'true');
    setOpen(false);
  };

  const handlePrivacyChoices = async () => {
    try {
      // Для пользователей Калифорнии используем CCPA opt-out, для других - перенаправляем на страницу
      if (isCaliforniaUser) {
        await setCCPAOptOut(true);
      }
      
      localStorage.setItem('privacyBannerSeen', 'true');
      setOpen(false);
      
      // Если это не пользователь из Калифорнии, перенаправляем на соответствующую страницу
      if (!isCaliforniaUser) {
        window.location.href = LEGISLATION_INFO[applicableLegislation].learnMoreLink;
      }
    } catch (error) {
      console.error('Failed to handle privacy choices:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (isLoading || settings?.doNotSell) {
    return null;
  }

  const content = LEGISLATION_INFO[applicableLegislation];

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
        
        <Typography variant="h6">{content.title}</Typography>
        
        <Typography variant="body1">
          {content.description}
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
            {content.primaryButton}
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handlePrivacyChoices}
            size={isMobile ? 'small' : 'medium'}
            sx={{ minWidth: isMobile ? 'auto' : 160 }}
          >
            {content.secondaryButton}
          </Button>
          <Link 
            href={content.learnMoreLink}
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