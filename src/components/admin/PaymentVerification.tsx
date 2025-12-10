import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Eye,
  Check,
  X,
  Clock,
  Download,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  FileText,
  Calendar,
  User,
  CreditCard
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  membershipType: 'professional' | 'student';
  paymentStatus: 'not_requested' | 'requested' | 'uploaded' | 'verified' | 'rejected';
  paymentUploadToken: string;
  paymentProofUrl: string;
  paymentRequestedAt: string;
  paymentUploadedAt?: string;
  paymentVerifiedAt?: string;
  paymentVerifiedBy?: string;
  paymentReference?: string;
  paymentAmount?: number;
  paymentDate?: string;
  bankName?: string;
  additionalNotes?: string;
  uploadLogs: PaymentUploadLog[];
}

interface PaymentUploadLog {
  id: string;
  originalFilename: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  ipAddress?: string;
}

const PaymentVerification = () => {
  const { toast } = useToast();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationAction, setVerificationAction] = useState<'verify' | 'reject'>('verify');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'uploaded' | 'rejected'>('uploaded');

  const fetchPaymentRecords = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/payment-records`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view payment records.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payment records:', error);
      toast({
        title: "Error",
        description: "Failed to load payment records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPaymentRecords();
  }, [fetchPaymentRecords]);

  const handleVerification = async (paymentId: string, action: 'verify' | 'reject', notes: string) => {
    setIsVerifying(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const endpoint = action === 'verify' ? 'verify-payment' : 'reject-payment';

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/${endpoint}/${paymentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: notes.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: `Payment ${action === 'verify' ? 'Verified' : 'Rejected'}`,
        description: result.message,
        variant: "default",
      });

      // Close dialog and reset
      setShowVerificationDialog(false);
      setSelectedPayment(null);
      setVerificationNotes('');

      // Refresh data and notify other components
      fetchPaymentRecords();
      window.dispatchEvent(new CustomEvent('paymentVerified'));

    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === '' ||
      payment.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.memberEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'not_requested': return 'bg-gray-100 text-gray-800';
      case 'requested': return 'bg-blue-100 text-blue-800';
      case 'uploaded': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded': return <Clock className="w-4 h-4" />;
      case 'verified': return <Check className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading payment records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Payment Verification Dashboard
              </CardTitle>
              <CardDescription>
                Review and verify member payment proofs
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={fetchPaymentRecords} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filter and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status-filter">Status Filter</Label>
              <select
                id="status-filter"
                title="Filter payments by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'uploaded' | 'rejected')}
                className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="uploaded">Uploaded (Needs Review)</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Payment Records ({filteredPayments.length})
          </CardTitle>
          <CardDescription>
            Review member payment submissions requiring verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No payment records found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Details</TableHead>
                    <TableHead>Payment Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{payment.memberName}</p>
                          <p className="text-sm text-muted-foreground">{payment.memberEmail}</p>
                          <Badge variant={payment.membershipType === 'professional' ? 'default' : 'secondary'}>
                            {payment.membershipType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {payment.paymentReference && (
                            <p><strong>Ref:</strong> {payment.paymentReference}</p>
                          )}
                          {payment.paymentAmount && (
                            <p><strong>Amount:</strong> BWP {payment.paymentAmount}</p>
                          )}
                          {payment.bankName && (
                            <p><strong>Bank:</strong> {payment.bankName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(payment.paymentStatus)}>
                          {getStatusIcon(payment.paymentStatus)}
                          <span className="ml-1">{payment.paymentStatus.replace('_', ' ').toUpperCase()}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {payment.paymentUploadedAt ? formatDate(payment.paymentUploadedAt) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {payment.paymentProofUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`${import.meta.env.VITE_API_URL}${payment.paymentProofUrl}`, '_blank')}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <User className="w-5 h-5" />
                                  Payment Review - {selectedPayment?.memberName}
                                </DialogTitle>
                                <DialogDescription>
                                  Review payment proof and member details
                                </DialogDescription>
                              </DialogHeader>

                              {selectedPayment && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                                  {/* Member and Payment Info */}
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Member Details
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                      <div><strong>Name:</strong> {selectedPayment.memberName}</div>
                                      <div><strong>Email:</strong> {selectedPayment.memberEmail}</div>
                                      <div><strong>Type:</strong> {selectedPayment.membershipType.charAt(0).toUpperCase() + selectedPayment.membershipType.slice(1)}</div>
                                      <div><strong>Status:</strong>
                                        <Badge className={`${getStatusBadgeColor(selectedPayment.paymentStatus)} ml-2`}>
                                          {selectedPayment.paymentStatus.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Payment Details */}
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        Payment Details
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                      {selectedPayment.paymentReference && (
                                        <div><strong>Reference:</strong> {selectedPayment.paymentReference}</div>
                                      )}
                                      {selectedPayment.paymentAmount && (
                                        <div><strong>Amount:</strong> BWP {selectedPayment.paymentAmount}</div>
                                      )}
                                      {selectedPayment.paymentDate && (
                                        <div><strong>Date:</strong> {new Date(selectedPayment.paymentDate).toLocaleDateString()}</div>
                                      )}
                                      {selectedPayment.bankName && (
                                        <div><strong>Bank:</strong> {selectedPayment.bankName}</div>
                                      )}
                                      {selectedPayment.paymentUploadedAt && (
                                        <div><strong>Uploaded:</strong> {formatDate(selectedPayment.paymentUploadedAt)}</div>
                                      )}
                                      {selectedPayment.additionalNotes && (
                                        <div className="pt-2 border-t">
                                          <div className="text-xs font-medium mb-1">ADDITIONAL NOTES:</div>
                                          <div className="text-xs bg-gray-50 p-2 rounded">{selectedPayment.additionalNotes}</div>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>

                                  {/* Payment Proof */}
                                  {selectedPayment.paymentProofUrl && (
                                    <Card className="lg:col-span-2">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center justify-between">
                                          <span className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Payment Proof Document
                                          </span>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(`${import.meta.env.VITE_API_URL}${selectedPayment.paymentProofUrl}`, '_blank')}
                                          >
                                            <Download className="w-4 h-4 mr-2" />
                                            View Document
                                          </Button>
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                          <FileText className="w-12 h-12 text-blue-500" />
                                          <div>
                                            <p className="font-medium">Payment Receipt</p>
                                            <p className="text-sm text-muted-foreground">
                                              Uploaded {formatDate(selectedPayment.paymentUploadedAt || selectedPayment.paymentRequestedAt)}
                                            </p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Upload Logs */}
                                  {selectedPayment.uploadLogs.length > 0 && (
                                    <Card className="lg:col-span-2">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <Calendar className="w-4 h-4" />
                                          Upload History
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-2">
                                          {selectedPayment.uploadLogs.map((log, index) => (
                                            <div key={log.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm">
                                              <div>
                                                <p className="font-medium">{log.originalFilename}</p>
                                                <p className="text-muted-foreground">{formatFileSize(log.fileSize)} • {log.fileType.toUpperCase()}</p>
                                              </div>
                                              <div className="text-right text-xs text-muted-foreground">
                                                <p>{formatDate(log.uploadedAt)}</p>
                                                {log.ipAddress && <p>{log.ipAddress}</p>}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Verification Actions */}
                                  <Card className="lg:col-span-2">
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-lg">Verification Decision</CardTitle>
                                      {selectedPayment.paymentStatus === 'rejected' && (
                                        <Alert className="mt-2">
                                          <AlertCircle className="h-4 w-4" />
                                          <AlertDescription>
                                            This payment was previously rejected. Review carefully before re-verifying.
                                          </AlertDescription>
                                        </Alert>
                                      )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div>
                                        <Label htmlFor="verification-notes">Verification Notes</Label>
                                        <Textarea
                                          id="verification-notes"
                                          placeholder="Add any notes about this verification decision..."
                                          value={verificationNotes}
                                          onChange={(e) => setVerificationNotes(e.target.value)}
                                          rows={3}
                                        />
                                      </div>

                                      <div className="flex gap-3 flex-wrap">
                                        <Button
                                          onClick={() => handleVerification(selectedPayment.id, 'verify', verificationNotes)}
                                          className="bg-green-600 hover:bg-green-700"
                                          disabled={isVerifying}
                                        >
                                          {isVerifying ? (
                                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <Check className="w-4 h-4 mr-2" />
                                          )}
                                          Verify Payment
                                        </Button>

                                        <Button
                                          variant="destructive"
                                          onClick={() => handleVerification(selectedPayment.id, 'reject', verificationNotes)}
                                          disabled={isVerifying || !verificationNotes.trim()}
                                        >
                                          <X className="w-4 h-4 mr-2" />
                                          Reject Payment
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
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

export default PaymentVerification;
