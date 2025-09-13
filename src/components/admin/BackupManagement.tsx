import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Trash2, BarChart3, Calendar, FileText, Database, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

interface BackupRecord {
  id: string;
  filename: string;
  filesize_formatted: string;
  includes_parsed: string[];
  formats: string[];
  created_at_formatted: string;
  download_url: string;
  status: string;
  backup_type: string;
  file_count: number;
}

interface BackupStats {
  total_backups: number;
  active_backups: number;
  deleted_backups: number;
  total_size_bytes: number;
  total_size_formatted: string;
}

const BackupManagement: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupResult, setBackupResult] = useState<{
    downloadUrl: string;
    filename: string;
    size: number;
    created: string;
  } | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
    fetchStats();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/backups?status=active');
      if (!response.ok) {
        throw new Error('Failed to fetch backups');
      }
      const data = await response.json();
      setBackups(data);
      setError(null);
    } catch (err) {
      setError('Failed to load backup history');
      console.error('Error fetching backups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/backups/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch backup stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching backup stats:', err);
    }
  };

  const handleDownload = async (backup: BackupRecord) => {
    try {
      toast.loading('Preparing download...', { id: 'download' });
      const response = await fetch(`/api/backups/${backup.id}/download`);

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      toast.success('Download started successfully!', { id: 'download' });
    } catch (err) {
      console.error('Error downloading backup:', err);
      toast.error('Failed to download backup', { id: 'download' });
    }
  };

  const handleDelete = async (backupId: string) => {
    try {
      const response = await fetch(`/api/backups/${backupId}/delete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark backup as deleted');
      }

      toast.success('Backup marked as deleted');
      fetchBackups(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (err) {
      console.error('Error deleting backup:', err);
      toast.error('Failed to delete backup');
    }
  };

  const handleBackup = async () => {
    if (isBackingUp) return;

    setIsBackingUp(true);
    setBackupResult(null);
    setBackupError(null);

    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      const result = await response.json();
      setBackupResult(result);

      toast.success("Backup completed successfully!");

      // Refresh the backups list and stats
      fetchBackups();
      fetchStats();
    } catch (error) {
      console.error('Backup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setBackupError(errorMessage);

      toast.error(`Backup failed: ${errorMessage}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const formatBackupType = (type: string) => {
    switch (type) {
      case 'comprehensive':
        return 'Complete (Database + Files)';
      case 'database':
        return 'Database Only';
      default:
        return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Backup Management</h1>
          <p className="text-gray-600 mt-2">Manage and download database backups</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleBackup}
            disabled={isBackingUp}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isBackingUp ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Backup...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Create Backup
              </>
            )}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Statistics
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Backup Statistics</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.total_backups || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Backups</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.active_backups || 0}
                  </div>
                  <div className="text-sm text-gray-600">Active Backups</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats?.deleted_backups || 0}
                  </div>
                  <div className="text-sm text-gray-600">Deleted Backups</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.total_size_formatted || '0 B'}
                  </div>
                  <div className="text-sm text-gray-600">Total Size</div>
                </div>
              </div>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_backups || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_size_formatted || '0 B'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Backups</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_backups || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No backups found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first backup using the "Create Backup" button above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Formats</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{backup.filename}</span>
                          <span className="text-xs text-gray-500 mt-1">
                            Format: {formatBackupType(backup.backup_type)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{backup.backup_type}</Badge>
                      </TableCell>
                      <TableCell>{backup.filesize_formatted}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {backup.includes_parsed.map((file, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {file}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {backup.formats.map((format, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              .{format}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-1 h-3 w-3" />
                          {backup.created_at_formatted}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(backup)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Backup</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this backup? This action cannot be undone.
                                  The backup will be marked as deleted but the actual file will remain on the server.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(backup.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManagement;
