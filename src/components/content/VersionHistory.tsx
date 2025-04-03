import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Tooltip,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Compare as CompareIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { FixedSizeList as VirtualList } from 'react-window';
import { api } from '../../services/api';
import { VersionComparison } from './VersionComparison';
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

interface VersionHistoryProps {
  contentId: string;
  onVersionSelect?: (version: Version) => void;
  onVersionRestore?: (version: Version) => void;
  onVersionDelete?: (version: Version) => void;
}

const ITEMS_PER_PAGE = 20;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface CachedVersions {
  data: Version[];
  total: number;
  timestamp: number;
}

const versionCache = new Map<string, CachedVersions>();

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
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });

  const cacheKey = useMemo(() => {
    return `${contentId}-${page}-${filterType}-${sortOrder}-${searchQuery}-${dateRange.start}-${dateRange.end}`;
  }, [contentId, page, filterType, sortOrder, searchQuery, dateRange]);

  const loadVersions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check cache
      const cached = versionCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
        setVersions(cached.data);
        setTotalPages(Math.ceil(cached.total / ITEMS_PER_PAGE));
        setLoading(false);
        return;
      }

      const response = await api.get(`/content/${contentId}/versions`, {
        params: {
          page,
          limit: ITEMS_PER_PAGE,
          type: filterType !== 'all' ? filterType : undefined,
          sort: sortOrder,
          search: searchQuery || undefined,
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      });

      // Update cache
      versionCache.set(cacheKey, {
        data: response.data.items,
        total: response.data.total,
        timestamp: Date.now(),
      });

      setVersions(response.data.items);
      setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
    } catch (err) {
      setError('Не удалось загрузить историю версий');
      console.error('Ошибка загрузки версий:', err);
    } finally {
      setLoading(false);
    }
  }, [contentId, page, filterType, sortOrder, searchQuery, dateRange, cacheKey]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

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

  const handleExportHistory = async () => {
    try {
      const response = await api.get(`/content/${contentId}/versions/export`, {
        params: {
          type: filterType !== 'all' ? filterType : undefined,
          sort: sortOrder,
          search: searchQuery || undefined,
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `version-history-${contentId}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Не удалось экспортировать историю версий');
      console.error('Ошибка экспорта версий:', err);
    }
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

  const renderFilters = () => (
    <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          label="Тип версии"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">Все версии</MenuItem>
          <MenuItem value="auto">Автосохранение</MenuItem>
          <MenuItem value="manual">Ручное сохранение</MenuItem>
          <MenuItem value="publish">Публикация</MenuItem>
        </TextField>

        <TextField
          label="Поиск"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />

        <TextField
          label="Начальная дата"
          type="date"
          value={dateRange.start || ''}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DateRangeIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Конечная дата"
          type="date"
          value={dateRange.end || ''}
          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DateRangeIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportHistory}
        >
          Экспорт
        </Button>
      </Stack>
    </Paper>
  );

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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {renderFilters()}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedVersions.size === versions.length}
                  onChange={handleSelectAll}
                />
              }
              label="Выбрать все"
            />
            {selectedVersions.size > 0 && (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<RestoreIcon />}
                  onClick={handleBulkRestore}
                >
                  Восстановить выбранные
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                >
                  Удалить выбранные
                </Button>
              </Stack>
            )}
          </Box>

          <Paper elevation={0}>
            <VirtualList
              height={400}
              width="100%"
              itemCount={versions.length}
              itemSize={72}
            >
              {renderVersionItem}
            </VirtualList>
          </Paper>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </>
      )}

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