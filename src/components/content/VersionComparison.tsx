import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { diffWords, Change } from 'diff';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Version {
  id: string;
  content: Record<string, any>;
  versionType: string;
  comment?: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
  };
}

interface VersionComparisonProps {
  currentVersion: Version;
  compareVersion: Version;
}

interface ChangeGroup {
  path: string;
  changes: {
    type: 'add' | 'remove' | 'modify';
    oldValue: any;
    newValue: any;
  }[];
}

export const VersionComparison: React.FC<VersionComparisonProps> = ({
  currentVersion,
  compareVersion,
}) => {
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

  const formatDate = (date: Date) => {
    return format(parseISO(date.toString()), 'PPP p', { locale: ru });
  };

  const renderVersionType = (type: string) => {
    switch (type) {
      case 'auto':
        return <Chip label="Автосохранение" size="small" color="default" />;
      case 'manual':
        return <Chip label="Ручное сохранение" size="small" color="primary" />;
      case 'publish':
        return <Chip label="Публикация" size="small" color="success" />;
      default:
        return <Chip label={type} size="small" />;
    }
  };

  const renderDiff = (oldText: string, newText: string) => {
    const differences = diffWords(oldText, newText);
    return (
      <Box sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
        {differences.map((part: Change, index: number) => (
          <span
            key={index}
            style={{
              backgroundColor: part.added
                ? '#e6ffe6'
                : part.removed
                ? '#ffe6e6'
                : 'transparent',
              textDecoration: part.removed ? 'line-through' : 'none',
              padding: '0 2px',
              borderRadius: '2px',
            }}
          >
            {part.value}
          </span>
        ))}
      </Box>
    );
  };

  const compareObjects = (obj1: any, obj2: any, path: string = ''): ChangeGroup[] => {
    const groups: ChangeGroup[] = [];

    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    allKeys.forEach((key) => {
      const currentPath = path ? `${path}.${key}` : key;
      const value1 = obj1[key];
      const value2 = obj2[key];

      if (typeof value1 === 'object' && typeof value2 === 'object' && value1 !== null && value2 !== null) {
        groups.push(...compareObjects(value1, value2, currentPath));
      } else if (value1 !== value2) {
        const existingGroup = groups.find(g => g.path === currentPath);
        if (existingGroup) {
          existingGroup.changes.push({
            type: value1 === undefined ? 'add' : value2 === undefined ? 'remove' : 'modify',
            oldValue: value1,
            newValue: value2,
          });
        } else {
          groups.push({
            path: currentPath,
            changes: [{
              type: value1 === undefined ? 'add' : value2 === undefined ? 'remove' : 'modify',
              oldValue: value1,
              newValue: value2,
            }],
          });
        }
      }
    });

    return groups;
  };

  const changeGroups = useMemo(() => 
    compareObjects(currentVersion.content, compareVersion.content),
    [currentVersion.content, compareVersion.content]
  );

  const toggleGroup = (path: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedGroups(newExpanded);
  };

  const renderChangeIcon = (type: 'add' | 'remove' | 'modify') => {
    switch (type) {
      case 'add':
        return <AddIcon color="success" fontSize="small" />;
      case 'remove':
        return <RemoveIcon color="error" fontSize="small" />;
      case 'modify':
        return <Chip label="Изм." size="small" color="warning" />;
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Текущая версия
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              {renderVersionType(currentVersion.versionType)}
              <Typography variant="body2" color="text.secondary">
                {formatDate(currentVersion.createdAt)}
              </Typography>
            </Box>
            <Typography variant="body2" gutterBottom>
              Автор: {currentVersion.author.name}
            </Typography>
            {currentVersion.comment && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentVersion.comment}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Сравниваемая версия
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              {renderVersionType(compareVersion.versionType)}
              <Typography variant="body2" color="text.secondary">
                {formatDate(compareVersion.createdAt)}
              </Typography>
            </Box>
            <Typography variant="body2" gutterBottom>
              Автор: {compareVersion.author.name}
            </Typography>
            {compareVersion.comment && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {compareVersion.comment}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Изменения ({changeGroups.length})
        </Typography>
        {changeGroups.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Нет изменений между версиями
          </Typography>
        ) : (
          <Box>
            {changeGroups.map((group, index) => (
              <Paper key={index} elevation={1} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => toggleGroup(group.path)}
                >
                  <IconButton size="small">
                    {expandedGroups.has(group.path) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    {group.path}
                  </Typography>
                  <Box display="flex" gap={1}>
                    {group.changes.map((change, i) => (
                      <Tooltip key={i} title={change.type === 'add' ? 'Добавлено' : change.type === 'remove' ? 'Удалено' : 'Изменено'}>
                        {renderChangeIcon(change.type)}
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
                <Collapse in={expandedGroups.has(group.path)}>
                  <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                    {group.changes.map((change, i) => (
                      <Box key={i} mb={2}>
                        {typeof change.oldValue === 'string' && typeof change.newValue === 'string' ? (
                          renderDiff(change.oldValue, change.newValue)
                        ) : (
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="error" gutterBottom>
                                Удалено:
                              </Typography>
                              <Paper elevation={0} sx={{ p: 1, bgcolor: '#fff5f5' }}>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                  {JSON.stringify(change.oldValue, null, 2)}
                                </pre>
                              </Paper>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="success.main" gutterBottom>
                                Добавлено:
                              </Typography>
                              <Paper elevation={0} sx={{ p: 1, bgcolor: '#f5fff5' }}>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                  {JSON.stringify(change.newValue, null, 2)}
                                </pre>
                              </Paper>
                            </Grid>
                          </Grid>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}; 