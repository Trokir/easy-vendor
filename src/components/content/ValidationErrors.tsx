import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { ValidationError } from '../../services/validation.service';

interface ValidationErrorsProps {
  errors: ValidationError[];
  onErrorClick?: (error: ValidationError) => void;
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({
  errors,
  onErrorClick,
}) => {
  const [expanded, setExpanded] = React.useState(true);

  if (errors.length === 0) {
    return null;
  }

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleErrorClick = (error: ValidationError) => {
    if (onErrorClick) {
      onErrorClick(error);
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        mt: 2, 
        mb: 2, 
        borderLeft: '4px solid #f44336',
        backgroundColor: '#ffebee',
      }}
    >
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ErrorIcon color="error" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" color="error">
            {errors.length} {errors.length === 1 ? 'error' : 'errors'} found
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleToggleExpand}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <List dense>
          {errors.map((error, index) => (
            <ListItem 
              key={index} 
              button={!!onErrorClick}
              onClick={() => handleErrorClick(error)}
              sx={{ 
                cursor: onErrorClick ? 'pointer' : 'default',
                '&:hover': onErrorClick ? { backgroundColor: 'rgba(0, 0, 0, 0.04)' } : {},
              }}
            >
              <ListItemIcon>
                <WarningIcon color="warning" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    <strong>{error.field}</strong>: {error.message}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    Rule: {error.rule}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Paper>
  );
}; 