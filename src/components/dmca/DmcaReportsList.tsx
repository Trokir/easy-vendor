import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

interface DmcaReport {
  id: string;
  claimantName: string;
  claimantEmail: string;
  respondentEmail?: string;
  contentUrl: string;
  originalWorkUrl: string;
  description: string;
  isSwornStatement: boolean;
  status: DmcaReportStatus;
  adminNotes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

enum DmcaReportStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  VALID = 'valid',
  INVALID = 'invalid',
  COUNTER_NOTICE = 'counter_notice',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

const statusLabels: Record<DmcaReportStatus, string> = {
  [DmcaReportStatus.PENDING]: 'В ожидании',
  [DmcaReportStatus.REVIEWING]: 'На рассмотрении',
  [DmcaReportStatus.VALID]: 'Подтверждено',
  [DmcaReportStatus.INVALID]: 'Недействительно',
  [DmcaReportStatus.COUNTER_NOTICE]: 'Получено возражение',
  [DmcaReportStatus.RESOLVED]: 'Разрешено',
  [DmcaReportStatus.REJECTED]: 'Отклонено',
};

const statusColors: Record<DmcaReportStatus, string> = {
  [DmcaReportStatus.PENDING]: 'default',
  [DmcaReportStatus.REVIEWING]: 'primary',
  [DmcaReportStatus.VALID]: 'success',
  [DmcaReportStatus.INVALID]: 'error',
  [DmcaReportStatus.COUNTER_NOTICE]: 'warning',
  [DmcaReportStatus.RESOLVED]: 'success',
  [DmcaReportStatus.REJECTED]: 'error',
};

const DmcaReportsList: React.FC = () => {
  const [reports, setReports] = useState<DmcaReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<DmcaReport | null>(null);
  const [newStatus, setNewStatus] = useState<DmcaReportStatus>(DmcaReportStatus.PENDING);
  const [adminNotes, setAdminNotes] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<DmcaReport[]>('/api/dmca-reports');
      setReports(response.data);
    } catch (error) {
      setError('Не удалось загрузить DMCA отчеты');
      console.error('Error fetching DMCA reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewReport = (reportId: string) => {
    navigate(`/admin/dmca-reports/${reportId}`);
  };

  const handleEditClick = (report: DmcaReport) => {
    setCurrentReport(report);
    setNewStatus(report.status);
    setAdminNotes(report.adminNotes || '');
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (report: DmcaReport) => {
    setCurrentReport(report);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!currentReport) return;
    
    setSaveLoading(true);
    try {
      const response = await axios.patch<DmcaReport>(`/api/dmca-reports/${currentReport.id}`, {
        status: newStatus,
        adminNotes,
      });
      
      // Обновить список отчетов
      setReports(reports.map(report => 
        report.id === currentReport.id ? response.data : report
      ));
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating DMCA report:', error);
      setError('Не удалось обновить DMCA отчет');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentReport) return;
    
    setSaveLoading(true);
    try {
      await axios.delete(`/api/dmca-reports/${currentReport.id}`);
      
      // Обновить список отчетов
      setReports(reports.filter(report => report.id !== currentReport.id));
      
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting DMCA report:', error);
      setError('Не удалось удалить DMCA отчет');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy HH:mm');
    } catch (e) {
      return 'Неверная дата';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        DMCA Отчеты
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Заявитель</TableCell>
                <TableCell>URL контента</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>{report.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      {report.claimantName}
                      <Typography variant="caption" display="block">
                        {report.claimantEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 250,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {report.contentUrl}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[report.status]}
                        color={statusColors[report.status] as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewReport(report.id)}
                        title="Просмотреть"
                      >
                        <VisibilityOutlinedIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(report)}
                        title="Изменить статус"
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(report)}
                        title="Удалить"
                        color="error"
                      >
                        <DeleteOutlineOutlinedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={reports.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} из ${count}`
          }
        />
      </Paper>
      
      {/* Диалог редактирования статуса */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Изменить статус DMCA отчета</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Статус"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as DmcaReportStatus)}
            margin="normal"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            fullWidth
            label="Заметки администратора"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={saveLoading}
          >
            {saveLoading ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить DMCA отчет от {currentReport?.claimantName}?
          Это действие нельзя будет отменить.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={saveLoading}
          >
            {saveLoading ? <CircularProgress size={24} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DmcaReportsList; 