import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, Download, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';

interface CPDRecord {
  id: string;
  title: string;
  category: string;
  hours: number;
  date: string;
  provider: string;
  status: 'approved' | 'pending' | 'rejected';
  certificateUrl?: string;
}

const CPDUploadForm = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Mock CPD records
  const [cpdRecords] = useState<CPDRecord[]>([
    {
      id: '1',
      title: 'Advanced Trauma Therapy Techniques',
      category: 'Clinical Training',
      hours: 8,
      date: '2024-03-15',
      provider: 'International Trauma Institute',
      status: 'approved',
      certificateUrl: '/certificates/trauma-therapy.pdf'
    },
    {
      id: '2',
      title: 'Ethics in Digital Counseling',
      category: 'Ethics',
      hours: 4,
      date: '2024-02-28',
      provider: 'Digital Health Ethics Council',
      status: 'pending'
    },
    {
      id: '3',
      title: 'Cognitive Behavioral Therapy Workshop',
      category: 'Clinical Training',
      hours: 6,
      date: '2024-01-20',
      provider: 'CBT Training Institute',
      status: 'approved',
      certificateUrl: '/certificates/cbt-workshop.pdf'
    }
  ]);

  const totalHours = cpdRecords
    .filter(record => record.status === 'approved')
    .reduce((sum, record) => sum + record.hours, 0);
  const requiredHours = 40;
  const progressPercentage = Math.min((totalHours / requiredHours) * 100, 100);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    // TODO: Implement Supabase file upload
    console.log('Uploading CPD evidence:', selectedFile);
    setTimeout(() => {
      setIsUploading(false);
      setSelectedFile(null);
      alert('CPD evidence uploaded successfully!');
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            CPD Progress Overview
            <Badge variant="outline">{totalHours}/{requiredHours} hours</Badge>
          </CardTitle>
          <CardDescription>
            Track your Continuing Professional Development progress for the current period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress: {totalHours} hours completed</span>
              <span>{requiredHours - totalHours} hours remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload New CPD Evidence */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New CPD Evidence</CardTitle>
          <CardDescription>
            Upload certificates, transcripts, or other documentation for your continuing education activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Activity Title</label>
                <Input placeholder="e.g., Advanced Therapy Techniques" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinical">Clinical Training</SelectItem>
                    <SelectItem value="ethics">Ethics & Professional Standards</SelectItem>
                    <SelectItem value="research">Research & Evidence-Based Practice</SelectItem>
                    <SelectItem value="supervision">Supervision & Mentoring</SelectItem>
                    <SelectItem value="personal">Personal Development</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Hours Completed</label>
                <Input type="number" placeholder="8" min="0" step="0.5" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Completion Date</label>
                <Input type="date" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Training Provider</label>
                <Input placeholder="Institution or organization" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea 
                placeholder="Brief description of the learning outcomes and content covered"
                className="min-h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload Certificate/Evidence</label>
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
              disabled={isUploading || !selectedFile}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Submit CPD Evidence'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* CPD Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your CPD Records</CardTitle>
          <CardDescription>
            View and manage your submitted CPD evidence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cpdRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.title}</div>
                      <div className="text-sm text-muted-foreground">{record.provider}</div>
                    </div>
                  </TableCell>
                  <TableCell>{record.category}</TableCell>
                  <TableCell>{record.hours} hrs</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      {getStatusBadge(record.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {record.certificateUrl && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CPDUploadForm;