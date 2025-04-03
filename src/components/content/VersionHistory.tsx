import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  TextField,
  MenuItem,
  Pagination,
  Stack,
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Compare as CompareIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { FixedSizeList as VirtualList } from 'react-window';
import { api } from '../../services/api';
import { VersionComparison } from './VersionComparison';

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

interface VersionHistoryProps {
  contentId: string;
  onVersionSelect?: (version: Version) => void;
  onVersionRestore?: (version: Version) => void;
  onVersionDelete?: (version: Version) => void;
}

const ITEMS_PER_PAGE = 20;

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  contentId,
  onVersionSelect,
  onVersionRestore,
  onVersionDelete,
}) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [compareVersion, setCompareVersion] = useState<Version | null>(null);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadVersions();
  }, [contentId, page, filterType, sortOrder]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/content/${contentId}/versions`, {
        params: {
          page,
          limit: ITEMS_PER_PAGE,
          type: filterType !== 'all' ? filterType : undefined,
          sort: sortOrder,
          search: searchQuery || undefined,
        },
      });
      setVersions(response.data.items);
      setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
    } catch (err) {
      setError('Не удалось загрузить историю версий');
      console.error('Ошибка загрузки версий:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (version: Version) => {
    setSelectedVersion(version);
    if (onVersionSelect) {
      onVersionSelect(version);
    }
  };

  const handleVersionRestore = (version: Version) => {
    if (onVersionRestore) {
      onVersionRestore(version);
    }
  };

  const handleVersionDelete = (version: Version) => {
    setSelectedVersion(version);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedVersion && onVersionDelete) {
      try {
        await onVersionDelete(selectedVersion);
        await loadVersions();
        setShowDeleteDialog(false);
      } catch (err) {
        setError('Не удалось удалить версию');
        console.error('Ошибка удаления версии:', err);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVersions.size === 0) return;

    try {
      await api.post(`/content/${contentId}/versions/bulk-delete`, {
        versionIds: Array.from(selectedVersions),
      });
      await loadVersions();
      setSelectedVersions(new Set());
    } catch (err) {
      setError('Не удалось удалить выбранные версии');
      console.error('Ошибка удаления версий:', err);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedVersions.size === 0) return;

    try {
      await api.post(`/content/${contentId}/versions/bulk-restore`, {
        versionIds: Array.from(selectedVersions),
      });
      await loadVersions();
      setSelectedVersions(new Set());
    } catch (err) {
      setError('Не удалось восстановить выбранные версии');
      console.error('Ошибка восстановления версий:', err);
    }
  };

  const handleSelectAll = () => {
    if (selectedVersions.size === versions.length) {
      setSelectedVersions(new Set());
    } else {
      setSelectedVersions(new Set(versions.map(v => v.id)));
    }
  };

  const handleSelectVersion = (versionId: string) => {
    const newSelected = new Set(selectedVersions);
    if (newSelected.has(versionId)) {
      newSelected.delete(versionId);
    } else {
      newSelected.add(versionId);
    }
    setSelectedVersions(newSelected);
  };

  const handleCompare = (version: Version) => {
    setCompareVersion(version);
    setShowCompareDialog(true);
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderVersionItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const version = versions[index];
    return (
      <ListItem
        style={style}
        button
        onClick={() => handleVersionSelect(version)}
        selected={selectedVersion?.id === version.id}
      >
        <Checkbox
          checked={selectedVersions.has(version.id)}
          onChange={() => handleSelectVersion(version.id)}
          onClick={(e) => e.stopPropagation()}
        />
        <ListItemText
          primary={
            <Box display="flex" alignItems="center" gap={1}>
              {renderVersionType(version.versionType)}
              <Typography variant="body2" color="text.secondary">
                {formatDate(version.createdAt)}
              </Typography>
            </Box>
          }
          secondary={
            <>
              <Typography variant="body2">
                Автор: {version.author.name}
              </Typography>
              {version.comment && (
                <Typography variant="body2" color="text.secondary">
                  {version.comment}
                </Typography>
              )}
            </>
          }
        />
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            aria-label="сравнить"
            onClick={() => handleCompare(version)}
          >
            <CompareIcon />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="восстановить"
            onClick={() => handleVersionRestore(version)}
          >
            <RestoreIcon />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="удалить"
            onClick={() => handleVersionDelete(version)}
          >
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (versions.length === 0) {
    return (
      <Box p={2}>
        <Typography variant="body1" color="text.secondary">
          История версий пуста
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          История версий
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            select
            size="small"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label="Тип версии"
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="auto">Автосохранение</MenuItem>
            <MenuItem value="manual">Ручное сохранение</MenuItem>
            <MenuItem value="publish">Публикация</MenuItem>
          </TextField>
          <TextField
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            label="Поиск"
            placeholder="Поиск по комментариям..."
          />
          <Button
            variant="outlined"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? 'Сначала новые' : 'Сначала старые'}
          </Button>
        </Box>
      </Box>

      {selectedVersions.size > 0 && (
        <Box mb={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBulkRestore}
            sx={{ mr: 1 }}
          >
            Восстановить выбранные
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBulkDelete}
          >
            Удалить выбранные
          </Button>
        </Box>
      )}

      <Box mb={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedVersions.size === versions.length}
              onChange={handleSelectAll}
            />
          }
          label="Выбрать все"
        />
      </Box>

      <VirtualList
        height={400}
        width="100%"
        itemCount={versions.length}
        itemSize={100}
      >
        {renderVersionItem}
      </VirtualList>

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Диалог подтверждения удаления */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Удалить версию?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить эту версию? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Отмена</Button>
          <Button onClick={confirmDelete} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог сравнения версий */}
      <Dialog
        open={showCompareDialog}
        onClose={() => setShowCompareDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Сравнение версий</DialogTitle>
        <DialogContent>
          {compareVersion && selectedVersion && (
            <VersionComparison
              currentVersion={selectedVersion}
              compareVersion={compareVersion}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompareDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 