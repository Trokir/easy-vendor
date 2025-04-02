import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import axios from 'axios';

interface DmcaFormData {
  claimantName: string;
  claimantEmail: string;
  respondentEmail: string;
  contentUrl: string;
  originalWorkUrl: string;
  description: string;
  isSwornStatement: boolean;
}

const initialFormData: DmcaFormData = {
  claimantName: '',
  claimantEmail: '',
  respondentEmail: '',
  contentUrl: '',
  originalWorkUrl: '',
  description: '',
  isSwornStatement: false,
};

const DmcaReportForm: React.FC = () => {
  const [formData, setFormData] = useState<DmcaFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Очистить ошибку при вводе
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.claimantName.trim()) {
      newErrors.claimantName = 'Имя заявителя обязательно';
    }
    
    if (!formData.claimantEmail.trim()) {
      newErrors.claimantEmail = 'Email заявителя обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.claimantEmail)) {
      newErrors.claimantEmail = 'Некорректный формат email';
    }
    
    if (formData.respondentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.respondentEmail)) {
      newErrors.respondentEmail = 'Некорректный формат email';
    }
    
    if (!formData.contentUrl.trim()) {
      newErrors.contentUrl = 'URL содержимого обязателен';
    } else if (!/^https?:\/\//.test(formData.contentUrl)) {
      newErrors.contentUrl = 'URL должен начинаться с http:// или https://';
    }
    
    if (!formData.originalWorkUrl.trim()) {
      newErrors.originalWorkUrl = 'URL оригинального произведения обязателен';
    } else if (!/^https?:\/\//.test(formData.originalWorkUrl)) {
      newErrors.originalWorkUrl = 'URL должен начинаться с http:// или https://';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    } else if (formData.description.length < 30) {
      newErrors.description = 'Описание должно содержать не менее 30 символов';
    }
    
    if (!formData.isSwornStatement) {
      newErrors.isSwornStatement = 'Необходимо подтвердить под присягой';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setSubmitError(null);
    
    try {
      await axios.post('/api/dmca-reports', formData);
      setSubmitSuccess(true);
      setFormData(initialFormData);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setSubmitError(error.response.data.message || 'Произошла ошибка при отправке отчета');
      } else {
        setSubmitError('Произошла ошибка при отправке отчета');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSubmitSuccess(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Форма отправки DMCA-отчета
      </Typography>
      
      <Typography variant="body1" paragraph>
        Используйте эту форму для отправки отчета о нарушении авторских прав согласно Digital Millennium Copyright Act (DMCA).
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Ваше имя *"
              name="claimantName"
              value={formData.claimantName}
              onChange={handleChange}
              margin="normal"
              error={!!errors.claimantName}
              helperText={errors.claimantName}
            />
            
            <TextField
              fullWidth
              label="Ваш email *"
              name="claimantEmail"
              type="email"
              value={formData.claimantEmail}
              onChange={handleChange}
              margin="normal"
              error={!!errors.claimantEmail}
              helperText={errors.claimantEmail}
            />
            
            <TextField
              fullWidth
              label="Email ответчика (если известен)"
              name="respondentEmail"
              type="email"
              value={formData.respondentEmail}
              onChange={handleChange}
              margin="normal"
              error={!!errors.respondentEmail}
              helperText={errors.respondentEmail}
            />
            
            <TextField
              fullWidth
              label="URL содержимого, нарушающего авторские права *"
              name="contentUrl"
              value={formData.contentUrl}
              onChange={handleChange}
              margin="normal"
              placeholder="https://example.com/content"
              error={!!errors.contentUrl}
              helperText={errors.contentUrl}
            />
            
            <TextField
              fullWidth
              label="URL оригинального произведения *"
              name="originalWorkUrl"
              value={formData.originalWorkUrl}
              onChange={handleChange}
              margin="normal"
              placeholder="https://example.com/original"
              error={!!errors.originalWorkUrl}
              helperText={errors.originalWorkUrl}
            />
            
            <TextField
              fullWidth
              label="Описание нарушения *"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description || 'Подробно опишите, как нарушены ваши авторские права'}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  name="isSwornStatement"
                  checked={formData.isSwornStatement}
                  onChange={handleChange}
                />
              }
              label="Я подтверждаю под присягой, что информация в этом уведомлении является точной, и я являюсь владельцем авторских прав или уполномочен действовать от имени владельца *"
              sx={{ mt: 2, mb: 1 }}
            />
            
            {errors.isSwornStatement && (
              <Typography variant="caption" color="error" display="block" sx={{ mb: 2 }}>
                {errors.isSwornStatement}
              </Typography>
            )}
            
            {submitError && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {submitError}
              </Alert>
            )}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Отправить отчет'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Typography variant="body2" color="textSecondary">
        * Обязательные поля
      </Typography>
      
      <Snackbar
        open={submitSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="DMCA-отчет успешно отправлен"
      />
    </Box>
  );
};

export default DmcaReportForm; 