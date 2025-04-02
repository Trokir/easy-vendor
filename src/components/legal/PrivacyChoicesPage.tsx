import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  List,
  ListItem,
  Grid,
} from '@mui/material';
import { usePrivacySettings } from '../../hooks/usePrivacySettings';
import { PrivacyLegislation } from '../../services/geoLocation.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Информация о законодательстве разных штатов
const LEGISLATION_INFO = {
  [PrivacyLegislation.CCPA]: {
    title: 'California Consumer Privacy Act (CCPA)',
    description: 'The CCPA gives California residents the right to know what personal information is collected, to delete personal information, and to opt-out of the sale of personal information.',
    formTitle: 'Opt-out of selling data',
    rights: [
      'Right to know what personal information is collected',
      'Right to delete personal information',
      'Right to opt-out of sale of personal information',
      'Right to non-discrimination for exercising rights',
    ],
  },
  [PrivacyLegislation.CDPA]: {
    title: 'Virginia Consumer Data Protection Act (CDPA)',
    description: 'The CDPA provides Virginia residents with rights to access, correct, and delete their personal data, as well as to opt out of targeted advertising and the sale of personal data.',
    formTitle: 'Manage your data rights',
    rights: [
      'Right to access personal data',
      'Right to correct inaccuracies',
      'Right to delete personal data',
      'Right to opt out of targeted advertising',
      'Right to opt out of sales of personal data',
      'Right to opt out of profiling',
    ],
  },
  [PrivacyLegislation.CPA]: {
    title: 'Colorado Privacy Act (CPA)',
    description: 'The CPA gives Colorado residents rights to access, correct, and delete their personal data, and to opt out of processing for targeted advertising, sales, and profiling.',
    formTitle: 'Manage data preferences',
    rights: [
      'Right to access personal data',
      'Right to correct inaccuracies',
      'Right to delete personal data',
      'Right to data portability',
      'Right to opt out of targeted advertising',
      'Right to opt out of sale of personal data',
      'Right to opt out of profiling',
    ],
  },
  [PrivacyLegislation.CTDPA]: {
    title: 'Connecticut Data Privacy Act (CTDPA)',
    description: 'The CTDPA provides Connecticut residents with control over their personal information, including rights to access, correction, deletion, and opting out of sales and targeted advertising.',
    formTitle: 'Manage privacy rights',
    rights: [
      'Right to access personal data',
      'Right to correct inaccuracies',
      'Right to delete personal data',
      'Right to data portability',
      'Right to opt out of targeted advertising',
      'Right to opt out of sales of personal data',
      'Right to opt out of profiling',
    ],
  },
  [PrivacyLegislation.UCPA]: {
    title: 'Utah Consumer Privacy Act (UCPA)',
    description: 'The UCPA provides Utah consumers with rights regarding their personal data, including rights to access, delete, and opt out of the sale of sensitive data.',
    formTitle: 'Manage your privacy',
    rights: [
      'Right to access personal data',
      'Right to delete personal data',
      'Right to opt out of sale of sensitive data',
      'Right to opt out of targeted advertising',
    ],
  },
  [PrivacyLegislation.NONE]: {
    title: 'Privacy Choices',
    description: 'We value your privacy. You have control over how your data is used.',
    formTitle: 'Manage your privacy preferences',
    rights: [
      'Right to control use of your data',
      'Right to transparency about data practices',
      'Right to make informed choices',
    ],
  },
};

export const PrivacyChoicesPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [requestType, setRequestType] = useState('optOut');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [dataChoices, setDataChoices] = useState({
    advertising: false,
    sales: false,
    profiling: false,
    analytics: false,
  });
  const [showSnackbar, setShowSnackbar] = useState(false);
  
  const { settings, updateSettings, applicableLegislation, isLoading, error, setCCPAOptOut } = usePrivacySettings();

  const handleDataChoiceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataChoices({
      ...dataChoices,
      [event.target.name]: event.target.checked,
    });
  };

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

  const handleRequestTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestType(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Обработка разных типов запросов в зависимости от законодательства и выбора пользователя
      if (applicableLegislation === PrivacyLegislation.CCPA && requestType === 'optOut') {
        await setCCPAOptOut(true);
      } else {
        // Для других типов запросов просто обновляем настройки в соответствии с выбором пользователя
        await updateSettings({
          email,
          doNotSell: dataChoices.sales,
          // Другие настройки могут быть добавлены здесь в зависимости от выбора
        });
      }
      
      setSubmitStatus('success');
      setShowSnackbar(true);
    } catch (error) {
      setSubmitStatus('error');
      console.error('Failed to submit request:', error);
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

  const content = LEGISLATION_INFO[applicableLegislation];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {content.title}
        </Typography>

        <Typography variant="body1" paragraph>
          {content.description}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box component="section" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your Rights
          </Typography>
          <List sx={{ pl: 2 }}>
            {content.rights.map((right, index) => (
              <ListItem key={index} sx={{ display: 'list-item' }}>
                {right}
              </ListItem>
            ))}
          </List>
        </Box>

        <Box component="section" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {content.formTitle}
          </Typography>
          <Typography variant="body1" paragraph>
            Please fill out this form to exercise your privacy rights:
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  error={!!emailError}
                  helperText={emailError}
                  required
                  disabled={isSubmitting}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <Typography variant="subtitle1" gutterBottom>
                    Request Type
                  </Typography>
                  <RadioGroup
                    aria-label="request-type"
                    name="request-type"
                    value={requestType}
                    onChange={handleRequestTypeChange}
                  >
                    <FormControlLabel value="optOut" control={<Radio />} label="Opt out of selling my data" />
                    <FormControlLabel value="access" control={<Radio />} label="Access my data" />
                    <FormControlLabel value="delete" control={<Radio />} label="Delete my data" />
                    <FormControlLabel value="correct" control={<Radio />} label="Correct my data" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Specific Choices
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataChoices.advertising}
                      onChange={handleDataChoiceChange}
                      name="advertising"
                    />
                  }
                  label="Opt out of targeted advertising"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataChoices.sales}
                      onChange={handleDataChoiceChange}
                      name="sales"
                    />
                  }
                  label="Opt out of selling my data"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataChoices.profiling}
                      onChange={handleDataChoiceChange}
                      name="profiling"
                    />
                  }
                  label="Opt out of profiling"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dataChoices.analytics}
                      onChange={handleDataChoiceChange}
                      name="analytics"
                    />
                  }
                  label="Opt out of analytics"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Information"
                  multiline
                  rows={4}
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Please provide any additional details about your request"
                  disabled={isSubmitting}
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ my: 2 }}>
                {error.message}
              </Alert>
            )}

            {submitStatus === 'success' && (
              <Alert severity="success" sx={{ my: 2 }}>
                Your request has been processed successfully.
              </Alert>
            )}

            {submitStatus === 'error' && (
              <Alert severity="error" sx={{ my: 2 }}>
                An error occurred while processing your request. Please try again later.
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{ minWidth: 200, mt: 2 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} />
              ) : (
                'Submit Request'
              )}
            </Button>
          </Box>
        </Box>

        <Box component="section">
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have questions about your privacy rights, please contact us:
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
        message="Your privacy request has been processed successfully"
      />
    </Container>
  );
}; 