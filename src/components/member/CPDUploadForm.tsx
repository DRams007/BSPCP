import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CPDRecord {
  id: string;
  title: string;
  points: number;
  completion_date: string | null;
  status: 'approved';
  document_path: string | null;
  document_url?: string;
  uploaded_at: string;
}

const CPDUploadForm = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cpdRecords, setCpdRecords] = useState<CPDRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState('');
  const [completionDate, setCompletionDate] = useState('');

  // Fetch CPD records on component mount
  const fetchCpdRecords = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:3001/api/member/cpd', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCpdRecords(data);
    } catch (error) {
      console.error('Error fetching CPD records:', error);
      toast({
        title: "Error",
        description: "Failed to load CPD records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCpdRecords();
  }, [fetchCpdRecords]);

  const totalPoints = cpdRecords.reduce((sum, record) => sum + record.points, 0);
  const requiredPoints = 40;
  const progressPercentage = Math.min((totalPoints / requiredPoints) * 100, 100);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !title || !points) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('title', title);
      formData.append('points', points);
      if (completionDate) {
        formData.append('completionDate', completionDate);
      }

      const response = await fetch('http://localhost:3001/api/member/cpd', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newRecord = await response.json();
      console.log('New CPD record created:', newRecord);

      // Clear form
      setTitle('');
      setPoints('');
      setCompletionDate('');
      setSelectedFile(null);

      // Refresh CPD records
      fetchCpdRecords();

      toast({
        title: "Success",
        description: "CPD evidence uploaded successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error('Error uploading CPD evidence:', error);
      toast({
        title: "Error",
        description: "Failed to upload CPD evidence",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCPD = async (recordId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      setDeletingRecord(recordId);

      const response = await fetch(`http://localhost:3001/api/member/cpd/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh CPD records
      fetchCpdRecords();
      setDeleteDialogOpen(false);

      toast({
        title: "Success",
        description: "CPD record deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting CPD record:', error);
      toast({
        title: "Error",
        description: "Failed to delete CPD record",
        variant: "destructive",
      });
    } finally {
      setDeletingRecord(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      default:
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading CPD records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CPD Progress */}
      <Card>
        <CardHeader>
          <CardTitle>CPD Progress</CardTitle>
          <CardDescription>
            Your Continuing Professional Development progress this year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>CPD Points Earned</span>
              <span>{totalPoints}/{requiredPoints}</span>
            </div>
            <Progress value={progressPercentage} />
            <div className="text-xs text-muted-foreground">
              {progressPercentage.toFixed(1)}% of required CPD completed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New CPD Evidence</CardTitle>
          <CardDescription>
            Upload certificates, transcripts, or other documentation for your continuing education activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                type="text"
                placeholder="e.g., Advanced Trauma Therapy Workshop"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">CPD Points *</label>
                <Input
                  type="number"
                  placeholder="e.g., 10"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Completion Date</label>
                <Input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload Certificate/Evidence *</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <label htmlFor="cpd-file" className="cursor-pointer">
                      <span className="text-primary hover:underline">Click to upload</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </label>
                    <input
                      id="cpd-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, JPG, PNG, DOC files up to 10MB
                  </p>
                  {selectedFile && (
                    <p className="text-sm text-primary mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isUploading || !selectedFile || !title || !points}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Submit CPD Evidence'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* CPD Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>My CPD Records</CardTitle>
          <CardDescription>
            Your uploaded CPD evidence and certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cpdRecords.length === 0 ? (
            <p className="text-muted-foreground">No CPD records yet. Upload your first CPD evidence above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cpdRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.title}</TableCell>
                    <TableCell>{record.points}</TableCell>
                    <TableCell>
                      {record.completion_date
                        ? new Date(record.completion_date).toLocaleDateString()
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {record.document_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={record.document_url} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              View
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCPD(record.id)}
                          disabled={deletingRecord === record.id}
                        >
                          {deletingRecord === record.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CPDUploadForm;
