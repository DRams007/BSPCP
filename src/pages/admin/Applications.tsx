import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import {
  Eye,
  Check,
  X,
  Clock,
  FileText,
  Download,
  AlertCircle,
  User,
  Building,
  GraduationCap,
  Mail,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Receipt,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface Application {
  id: number;
  name: string;
  email: string;
  occupation: string;
  nationality: string;
  qualification: string;
  experience: string;
  organization: string;
  documents: { name: string; uploaded: boolean; url?: string }[];
  application_status: string;
  created_at: Date;
  membershipType: string;
  payment_status?: string;
  reviewComment?: string;
  personalInfo: {
    dateOfBirth: string;
    idNumber: string;
    physicalAddress: string;
    postalAddress: string;
    membershipNumber?: string;
  };
  phone: string;
  // Payment verification data
  paymentInfo?: {
    reference?: string;
    amount?: number;
    paymentDate?: string;
    bankName?: string;
    proofOfPaymentUrl?: string;
    uploadDate?: string;
    verificationStatus?: 'verified' | 'rejected' | 'uploaded' | 'not_requested';
    rejectionReason?: string;
  };
  paymentHistory?: {
    id: string;
    action: string;
    details: string;
    timestamp: string;
    adminName?: string;
    adminEmail?: string;
    reason?: string;
    uploadInfo?: {
      originalFilename: string;
      storedFilename: string;
      fileSize?: number;
      fileType?: string;
      fileUrl?: string;
    };
  }[];
}

const Applications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isReapproving, setIsReapproving] = useState(false);
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isRejectingPayment, setIsRejectingPayment] = useState(false);
  const [paymentVerificationNotes, setPaymentVerificationNotes] = useState("");

  // Sorting state
  const [sortField, setSortField] = useState<'membershipType' | 'application_status' | 'created_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // Default to newest first

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get admin token for authentication
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast({
        title: "Error",
        description: `Failed to fetch applications: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateApplicationStatus = async (id: number, status: string, comment: string = "", loadingSetter: (value: boolean) => void) => {
    loadingSetter(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: status, reviewComment: comment }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        description: `The membership application has been ${status} successfully.`,
      });
      setReviewComment("");
      setSelectedApplication(null);
      fetchApplications(); // Re-fetch applications to update the list
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: `Failed to update application status: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      loadingSetter(false);
    }
  };

  const handleApprove = (applicationId: number) => {
    updateApplicationStatus(applicationId, "approved", "", setIsApproving);
  };

  const handleReject = (applicationId: number) => {
    if (!reviewComment) {
      toast({
        title: "Comment Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    updateApplicationStatus(applicationId, "rejected", reviewComment, setIsRejecting);
  };

  const handleReApprove = (applicationId: number) => {
    const reason = reviewComment || `Re-approved application for ${selectedApplication?.name}. Previous concerns have been addressed.`;
    updateApplicationStatus(applicationId, "approved", reason, setIsReapproving);
  };

  const handleRequestPayment = async (memberId: number) => {
    setIsRequestingPayment(true);
    const adminToken = localStorage.getItem('admin_token');

    if (!adminToken) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      setIsRequestingPayment(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/request-payment/${memberId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Payment Request Sent",
        description: `Payment request email has been sent to ${selectedApplication?.name}. They have been provided with a secure link to upload proof of payment.`,
      });

      setSelectedApplication(null);
      fetchApplications(); // Re-fetch applications to update payment status

    } catch (err) {
      const error = err as Error;
      console.error('Error requesting payment:', error);
      toast({
        title: "Error Requesting Payment",
        description: `Failed to request payment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsRequestingPayment(false);
    }
  };

  const handleRequestMoreInfo = () => {
    if (!selectedApplication) return;

    setEmailSubject(`Regarding your Membership Application - ${selectedApplication.name}`);
    setEmailBody(`Dear ${selectedApplication.name},

Thank you for your application to the Botswana Wellbeing Pathways. We are currently reviewing your application and require some additional information. Please provide further details regarding...

Sincerely,
Botswana Wellbeing Pathways Admin Team`);
    setShowEmailDialog(true);
  };

  const handleSendEmail = async () => {
    if (!selectedApplication) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/send-applicant-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicantEmail: selectedApplication.email,
          applicantName: selectedApplication.name,
          subject: emailSubject,
          body: emailBody,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Email Sent Successfully",
        description: `Email sent to ${selectedApplication.email} requesting more information.`,
      });

      console.log("Email sent successfully:", result);
      setShowEmailDialog(false);
      setEmailSubject("");
      setEmailBody("");

    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error Sending Email",
        description: "Failed to send email to applicant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteApplication = async (application: Application) => {
    setApplicationToDelete(application);
    setShowDeleteDialog(true);
  };

  const confirmDeleteApplication = async () => {
    if (!applicationToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/${applicationToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Application Deleted",
        description: result.message,
        variant: "destructive",
      });

      setShowDeleteDialog(false);
      setApplicationToDelete(null);
      setSelectedApplication(null);
      fetchApplications(); // Re-fetch applications to update the list

    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: `Failed to delete application: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!selectedApplication) return;

    setIsVerifyingPayment(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/payment-records/${selectedApplication.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
        body: JSON.stringify({ reviewComment: paymentVerificationNotes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Payment Verified",
        description: `Payment has been verified successfully.`,
      });

      setPaymentVerificationNotes("");
      fetchApplications(); // Re-fetch applications to update payment status

    } catch (err) {
      const error = err as Error;
      console.error('Error verifying payment:', error);
      toast({
        title: "Verification Failed",
        description: `Failed to verify payment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedApplication) return;

    if (!paymentVerificationNotes.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting the payment.",
        variant: "destructive",
      });
      return;
    }

    setIsRejectingPayment(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/payment-records/${selectedApplication.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
        body: JSON.stringify({ reviewComment: paymentVerificationNotes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Payment Rejected",
        description: `Payment has been rejected.`,
        variant: "destructive",
      });

      setPaymentVerificationNotes("");
      fetchApplications(); // Re-fetch applications to update payment status

    } catch (err) {
      const error = err as Error;
      console.error('Error rejecting payment:', error);
      toast({
        title: "Rejection Failed",
        description: `Failed to reject payment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsRejectingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "under_review":
        return <Eye className="w-4 h-4" />;
      case "approved":
        return <Check className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Sorting functionality
  const handleSort = (field: 'membershipType' | 'application_status' | 'created_at') => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to appropriate direction
      setSortField(field);
      setSortDirection(field === 'created_at' ? 'desc' : 'asc'); // Newest dates first, others ascending
    }
  };

  // Sort applications based on current sort state
  const sortedApplications = [...applications].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'membershipType':
        aValue = a.membershipType;
        bValue = b.membershipType;
        break;
      case 'application_status':
        // Custom status ordering: pending -> under_review -> approved -> rejected
        const statusOrder = { 'pending': 1, 'under_review': 2, 'approved': 3, 'rejected': 4 };
        aValue = statusOrder[a.application_status as keyof typeof statusOrder] || 5;
        bValue = statusOrder[b.application_status as keyof typeof statusOrder] || 5;
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Get sort icon and aria label
  const getSortIcon = (field: 'membershipType' | 'application_status' | 'created_at') => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const getSortAriaLabel = (field: 'membershipType' | 'application_status' | 'created_at') => {
    const fieldName = field === 'membershipType' ? 'Application Type' :
                     field === 'application_status' ? 'Status' : 'Application Date';
    const direction = sortDirection === 'asc' ? 'ascending' : 'descending';
    return sortField === field ? `Sort by ${fieldName} ${direction}` : `Sort by ${fieldName}`;
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Date-only formatting for payment history timestamps
  const formatPaymentHistoryDate = (timestamp: any) => {
    try {
      // Check for null or undefined timestamp first
      if (timestamp === null || timestamp === undefined || timestamp === '' || timestamp === 'undefined') {
        return 'N/A';
      }

      // Debug: Log what we're receiving - commenting out to reduce console noise in production
      // console.log('Processing timestamp:', timestamp, 'Type:', typeof timestamp);

      let date: Date;

      if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'number') {
        // Handle Unix timestamp - assume seconds, convert if too large for milliseconds
        date = timestamp > 1e12 ? new Date(timestamp) : new Date(timestamp * 1000);
      } else if (typeof timestamp === 'string') {
        // Handle ISO string or other string formats
        date = new Date(timestamp);
      } else {
        // Try to convert whatever else we get
        date = new Date(timestamp);
      }

      // Check if the date is valid after creation
      if (isNaN(date.getTime())) {
        // console.log('Invalid date created from:', timestamp);
        return 'N/A';
      }

      // PostgreSQL TIMESTAMPTZ returns valid ISO strings, so this should format correctly
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      // console.log('Successfully formatted date:', formatted);
      return formatted;
    } catch (error) {
      // Debug logging is still left in case of unexpected errors
      console.log('Error formatting timestamp:', timestamp, 'Error:', error);
      // Fallback for any unexpected errors
      return 'N/A';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Membership Applications</h1>
            <p className="text-muted-foreground">Review and process membership applications</p>
          </div>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Applications ({applications.length})</CardTitle>
            <CardDescription>
              Applications requiring review and approval
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            {/* Mobile Card Layout */}
            <div className="block md:hidden">
              {sortedApplications.map((application) => (
                <div key={application.id} className="p-4 border-b border-border last:border-b-0">
                  <div className="space-y-3">
                    {/* Applicant Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{application.name}</h3>
                        <p className="text-sm text-muted-foreground">{application.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={`${
                              application.membershipType === 'professional'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            } text-xs`}
                          >
                            {application.membershipType === 'professional' ? 'Professional' : 'Student'}
                          </Badge>
                          <Badge className={getStatusColor(application.application_status)} variant="outline">
                            {getStatusIcon(application.application_status)}
                            <span className="ml-1">
                              {application.application_status.replace('_', ' ').charAt(0).toUpperCase() + application.application_status.replace('_', ' ').slice(1)}
                            </span>
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                        className="flex-shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Key Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Occupation</p>
                        <p>{application.occupation}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Date Applied</p>
                        <p>{formatDate(application.created_at)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Payment Status</p>
                        <Badge
                          className={`text-xs ${
                            application.payment_status === 'verified'
                              ? 'bg-green-100 text-green-800'
                              : application.payment_status === 'uploaded'
                              ? 'bg-blue-100 text-blue-800'
                              : application.payment_status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : application.payment_status === 'not_requested'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {application.payment_status?.replace('_', ' ').toUpperCase() || 'N/A'}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Documents</p>
                        <p>{application.documents.filter(doc => doc.uploaded).length}/{application.documents.length} uploaded</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Application Review - {application.name}</DialogTitle>
                            <DialogDescription>
                              Complete application details and supporting documents
                            </DialogDescription>
                          </DialogHeader>

                          {selectedApplication && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                              {/* Personal Information */}
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Personal Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                  <div><strong>Full Name:</strong> {selectedApplication.name}</div>
                                  <div><strong>Email:</strong> {selectedApplication.email}</div>
                                  <div><strong>Phone:</strong> {selectedApplication.phone}</div>
                                  <div><strong>Application Type:</strong>
                                    <Badge
                                      className={`ml-2 ${
                                        selectedApplication.membershipType === 'professional'
                                          ? 'bg-purple-100 text-purple-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }`}
                                    >
                                      {selectedApplication.membershipType === 'professional' ? 'Professional' : 'Student'}
                                    </Badge>
                                  </div>
                                  <div><strong>Nationality:</strong> {selectedApplication.nationality}</div>
                                  <div><strong>Date of Birth:</strong> {selectedApplication.personalInfo.dateOfBirth}</div>
                                  <div><strong>ID Number:</strong> {selectedApplication.personalInfo.idNumber}</div>
                                  {selectedApplication.personalInfo.membershipNumber && (
                                    <div><strong>Membership Number:</strong> {selectedApplication.personalInfo.membershipNumber}</div>
                                  )}
                                  <div><strong>Physical Address:</strong> {selectedApplication.personalInfo.physicalAddress}</div>
                                </CardContent>
                              </Card>

                              {/* Professional Information */}
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg flex items-center">
                                    <GraduationCap className="w-5 h-5 mr-2" />
                                    Professional Details
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                  <div><strong>Occupation:</strong> {selectedApplication.occupation}</div>
                                  <div><strong>Organization:</strong> {selectedApplication.organization}</div>
                                  <div><strong>Qualification:</strong> {selectedApplication.qualification}</div>
                                  <div><strong>Experience:</strong> {selectedApplication.experience}</div>
                                </CardContent>
                              </Card>

                              {/* Documents */}
                              <Card className="md:col-span-2">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg flex items-center">
                                    <FileText className="w-5 h-5 mr-2" />
                                    Supporting Documents
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-4">
                                    {selectedApplication.documents
                                      .filter(doc => doc.name !== 'Proof of Payment') // Exclude payment proof from general documents
                                      .map((doc, index) => (
                                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center">
                                          {doc.uploaded ? (
                                            <Check className="w-4 h-4 text-green-500 mr-2" />
                                          ) : (
                                            <X className="w-4 h-4 text-red-500 mr-2" />
                                          )}
                                          <span className="text-sm">{doc.name}</span>
                                        </div>
                                        {doc.uploaded && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              if (doc.url) {
                                                window.open(doc.url, "_blank");
                                              }
                                            }}
                                          >
                                            <Download className="w-3 h-3" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Application Rejection Reason */}
                              {selectedApplication.application_status === 'rejected' && selectedApplication.reviewComment && (
                                <Card className="md:col-span-2">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center">
                                      <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                                      Application Rejection Details
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                      <div className="flex items-start">
                                        <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-1 flex-shrink-0" />
                                        <div className="text-sm text-red-800">
                                          <p className="font-medium mb-2">Previous Rejection Reason:</p>
                                          <div className="bg-white rounded-md p-3 border">
                                            <p className="text-red-700 whitespace-pre-wrap">{selectedApplication.reviewComment}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Payment Verification */}
                              {selectedApplication.payment_status && selectedApplication.payment_status !== 'not_requested' && (
                                <Card className="md:col-span-2">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                      <span className="flex items-center">
                                        <FileText className="w-5 h-5 mr-2" />
                                        Payment Verification
                                      </span>
                                      <Badge
                                        className={`${
                                          selectedApplication.payment_status === 'verified'
                                            ? 'bg-green-100 text-green-800'
                                            : selectedApplication.payment_status === 'uploaded'
                                            ? 'bg-blue-100 text-blue-800'
                                            : selectedApplication.payment_status === 'rejected'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                      >
                                        {selectedApplication.payment_status.replace('_', ' ').toUpperCase()}
                                      </Badge>
                                    </CardTitle>
                                    {selectedApplication.payment_status === 'rejected' && selectedApplication.paymentInfo?.rejectionReason && (
                                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                                        <div className="flex items-center">
                                          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                          <div className="text-sm">
                                            <p className="font-medium text-red-800">
                                              Previous Rejection Reason: {selectedApplication.paymentInfo.rejectionReason}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      {/* Find and display payment proof document from documents array - PLACE ON LEFT */}
                                      {(() => {
                                        const paymentProofDoc = selectedApplication.documents.find(doc => doc.name === 'Proof of Payment');
                                        return paymentProofDoc?.uploaded && paymentProofDoc.url ? (
                                          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border">
                                            <Receipt className="w-12 h-12 text-blue-500" />
                                            <div className="flex-1">
                                              <p className="font-medium">Payment Proof Document</p>
                                              <p className="text-sm text-muted-foreground">
                                                Uploaded {selectedApplication.paymentInfo?.uploadDate ? new Date(selectedApplication.paymentInfo.uploadDate).toLocaleDateString() : 'recently'}
                                              </p>
                                            </div>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                window.open(paymentProofDoc.url, '_blank');
                                              }}
                                            >
                                              <Download className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        ) : null;
                                      })()}

                                      {/* Payment Information - PLACE ON RIGHT */}
                                      <div className="space-y-3 text-sm">
                                        {selectedApplication.paymentInfo?.reference && (
                                          <div><strong>Reference:</strong> {selectedApplication.paymentInfo.reference}</div>
                                        )}
                                        {selectedApplication.paymentInfo?.amount && (
                                          <div><strong>Amount:</strong> BWP {selectedApplication.paymentInfo.amount}</div>
                                        )}
                                        {selectedApplication.paymentInfo?.paymentDate && (
                                          <div><strong>Payment Date:</strong> {new Date(selectedApplication.paymentInfo.paymentDate).toLocaleDateString()}</div>
                                        )}
                                        {selectedApplication.paymentInfo?.bankName && (
                                          <div><strong>Bank:</strong> {selectedApplication.paymentInfo.bankName}</div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Payment Verification Actions */}
                                    {selectedApplication.payment_status === 'uploaded' && (
                                      <div className="mt-6 pt-6 border-t">
                                        <div className="space-y-4">
                                          <div>
                                            <Label htmlFor="payment-notes">Verification Notes</Label>
                                            <Textarea
                                              id="payment-notes"
                                              placeholder="Enter verification notes or rejection reason..."
                                              value={paymentVerificationNotes}
                                              onChange={(e) => setPaymentVerificationNotes(e.target.value)}
                                              rows={3}
                                            />
                                          </div>
                                          <div className="flex gap-3">
                                            <Button
                                              onClick={handleVerifyPayment}
                                              className="bg-green-600 hover:bg-green-700"
                                              disabled={isVerifyingPayment || isRejectingPayment}
                                            >
                                              {isVerifyingPayment ? (
                                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                              ) : (
                                                <Check className="w-4 h-4 mr-2" />
                                              )}
                                              {isVerifyingPayment ? "Verifying..." : "Verify Payment"}
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              onClick={handleRejectPayment}
                                              disabled={isVerifyingPayment || isRejectingPayment || !paymentVerificationNotes.trim()}
                                            >
                                              {isRejectingPayment ? (
                                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                              ) : (
                                                <X className="w-4 h-4 mr-2" />
                                              )}
                                              {isRejectingPayment ? "Rejecting..." : "Reject Payment"}
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )}

                              {/* Review Actions */}
                              <Card className="md:col-span-2">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg">Review & Decision</CardTitle>
                                  {selectedApplication.application_status === 'rejected' && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                                      <div className="flex items-center">
                                        <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                                        <p className="text-sm text-amber-800 font-medium">
                                          This application was previously rejected. You can re-approve if the applicant has addressed the issues.
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div>
                                    <Label htmlFor="comment">Review Comments</Label>
                                    <Textarea
                                      id="comment"
                                      placeholder="Enter your review comments or feedback..."
                                      value={reviewComment}
                                      onChange={(e) => setReviewComment(e.target.value)}
                                      rows={4}
                                    />
                                  </div>
                                  <div className="flex gap-3 flex-wrap">
                                    {(selectedApplication.application_status === 'pending' || selectedApplication.application_status === 'under_review') ? (
                                      <>
                                        <Button
                                          onClick={() => handleRequestPayment(selectedApplication.id)}
                                          className="bg-blue-600 hover:bg-blue-700"
                                          disabled={isRequestingPayment || isApproving || isRejecting}
                                        >
                                          {isRequestingPayment ? (
                                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <FileText className="w-4 h-4 mr-2" />
                                          )}
                                          {isRequestingPayment ? "Requesting..." : "Request Proof of Payment"}
                                        </Button>
                                        <Button
                                          onClick={() => handleApprove(selectedApplication.id)}
                                          className="bg-green-600 hover:bg-green-700"
                                          disabled={isRequestingPayment || isApproving || isRejecting}
                                        >
                                          {isApproving ? (
                                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <Check className="w-4 h-4 mr-2" />
                                          )}
                                          {isApproving ? "Approving..." : "Approve Application"}
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleReject(selectedApplication.id)}
                                          disabled={isRequestingPayment || isApproving || isRejecting}
                                        >
                                          <X className="w-4 h-4 mr-2" />
                                          {isRejecting ? "Rejecting..." : "Reject Application"}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => handleDeleteApplication(selectedApplication)}
                                          className="bg-red-600 hover:bg-red-700 text-white"
                                          disabled={isRequestingPayment || isApproving || isRejecting}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete Application
                                        </Button>
                                        <Button variant="outline" onClick={handleRequestMoreInfo} disabled={isRequestingPayment || isApproving || isRejecting}>
                                          <Mail className="w-4 h-4 mr-2" />
                                          Request More Info
                                        </Button>
                                      </>
                                    ) : selectedApplication.application_status === 'rejected' ? (
                                      <>
                                        <Button
                                          onClick={() => handleReApprove(selectedApplication.id)}
                                          className="bg-green-600 hover:bg-green-700 text-white"
                                          disabled={isApproving || isRejecting || isReapproving}
                                        >
                                          {isReapproving ? (
                                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <Check className="w-4 h-4 mr-2" />
                                          )}
                                          {isReapproving ? "Re-Approving..." : "Re-Approve Application"}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => handleDeleteApplication(selectedApplication)}
                                          className="bg-red-600 hover:bg-red-700 text-white"
                                          disabled={isApproving || isRejecting || isReapproving}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete Application
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={handleRequestMoreInfo}
                                          disabled={isApproving || isRejecting || isReapproving}
                                        >
                                          <Mail className="w-4 h-4 mr-2" />
                                          Contact Applicant
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          variant="outline"
                                          onClick={() => handleDeleteApplication(selectedApplication)}
                                          className="bg-red-600 hover:bg-red-700 text-white"
                                          disabled={isApproving || isRejecting}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete Application
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={handleRequestMoreInfo}
                                          disabled={isApproving || isRejecting}
                                        >
                                          <Mail className="w-4 h-4 mr-2" />
                                          Contact Applicant
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {/* Email Dialog for Mobile */}
                      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                        <DialogContent className="max-w-full mx-4">
                          <DialogHeader>
                            <DialogTitle>Send Email to {selectedApplication?.name}</DialogTitle>
                            <DialogDescription>
                              Compose an email to request additional information from the applicant.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="emailTo">To</Label>
                              <Input id="emailTo" value={selectedApplication?.email} readOnly />
                            </div>
                            <div>
                              <Label htmlFor="emailSubject">Subject</Label>
                              <Input
                                id="emailSubject"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="emailBody">Body</Label>
                              <Textarea
                                id="emailBody"
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                rows={8}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button>
                            <Button onClick={handleSendEmail}>Send Email</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant Details</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('membershipType')}
                        className="h-auto p-0 font-semibold hover:bg-muted/50"
                        aria-label={getSortAriaLabel('membershipType')}
                      >
                        Application<br/>Type
                        {getSortIcon('membershipType')}
                      </Button>
                    </TableHead>
                    <TableHead>Qualification<br/>& Experience</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('application_status')}
                        className="h-auto p-0 font-semibold hover:bg-muted/50"
                        aria-label={getSortAriaLabel('application_status')}
                      >
                        Application<br/>Status
                        {getSortIcon('application_status')}
                      </Button>
                    </TableHead>
                    <TableHead>Payment<br/>Status</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('created_at')}
                        className="h-auto p-0 font-semibold hover:bg-muted/50"
                        aria-label={getSortAriaLabel('created_at')}
                      >
                        Application Date
                        {getSortIcon('created_at')}
                      </Button>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {sortedApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{application.name}</p>
                        <p className="text-sm text-muted-foreground">{application.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {application.occupation} • {application.nationality}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          application.membershipType === 'professional'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {application.membershipType === 'professional' ? 'Professional' : 'Student'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{application.qualification}</p>
                        <p className="text-xs text-muted-foreground">
                          {application.experience} experience
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {application.organization}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {application.documents.map((doc, index) => (
                          <div key={index} className="flex items-center text-xs">
                            {doc.uploaded ? (
                              <Check className="w-3 h-3 text-green-500 mr-1" />
                            ) : (
                              <X className="w-3 h-3 text-red-500 mr-1" />
                            )}
                            {doc.name}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.application_status)}>
                        <span className="mr-1">{getStatusIcon(application.application_status)}</span>
                        {application.application_status.replace('_', ' ').charAt(0).toUpperCase() + application.application_status.replace('_', ' ').slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {application.payment_status ? (
                          <Badge
                            className={`${
                              application.payment_status === 'verified'
                                ? 'bg-green-100 text-green-800'
                                : application.payment_status === 'uploaded'
                                ? 'bg-blue-100 text-blue-800'
                                : application.payment_status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : application.payment_status === 'not_requested'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {application.payment_status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(application.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedApplication(application)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Application Review - {application.name}</DialogTitle>
                              <DialogDescription>
                                Complete application details and supporting documents
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedApplication && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                {/* Personal Information */}
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center">
                                      <User className="w-5 h-5 mr-2" />
                                      Personal Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div><strong>Full Name:</strong> {selectedApplication.name}</div>
                                    <div><strong>Email:</strong> {selectedApplication.email}</div>
                                    <div><strong>Phone:</strong> {selectedApplication.phone}</div>
                                    <div><strong>Application Type:</strong>
                                      <Badge
                                        className={`ml-2 ${
                                          selectedApplication.membershipType === 'professional'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                        }`}
                                      >
                                        {selectedApplication.membershipType === 'professional' ? 'Professional' : 'Student'}
                                      </Badge>
                                    </div>
                                    <div><strong>Nationality:</strong> {selectedApplication.nationality}</div>
                                    <div><strong>Date of Birth:</strong> {selectedApplication.personalInfo.dateOfBirth}</div>
                                    <div><strong>ID Number:</strong> {selectedApplication.personalInfo.idNumber}</div>
                                    {selectedApplication.personalInfo.membershipNumber && (
                                      <div><strong>Membership Number:</strong> {selectedApplication.personalInfo.membershipNumber}</div>
                                    )}
                                    <div><strong>Physical Address:</strong> {selectedApplication.personalInfo.physicalAddress}</div>
                                  </CardContent>
                                </Card>

                                {/* Professional Information */}
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center">
                                      <GraduationCap className="w-5 h-5 mr-2" />
                                      Professional Details
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div><strong>Occupation:</strong> {selectedApplication.occupation}</div>
                                    <div><strong>Organization:</strong> {selectedApplication.organization}</div>
                                    <div><strong>Qualification:</strong> {selectedApplication.qualification}</div>
                                    <div><strong>Experience:</strong> {selectedApplication.experience}</div>
                                  </CardContent>
                                </Card>

                                {/* Documents */}
                                <Card className="md:col-span-2">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center">
                                      <FileText className="w-5 h-5 mr-2" />
                                      Supporting Documents
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                      {selectedApplication.documents
                                        .filter(doc => doc.name !== 'Proof of Payment') // Exclude payment proof from general documents
                                        .map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                          <div className="flex items-center">
                                            {doc.uploaded ? (
                                              <Check className="w-4 h-4 text-green-500 mr-2" />
                                            ) : (
                                              <X className="w-4 h-4 text-red-500 mr-2" />
                                            )}
                                            <span className="text-sm">{doc.name}</span>
                                          </div>
                                          {doc.uploaded && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                if (doc.url) {
                                                  window.open(doc.url, "_blank");
                                                  toast({
                                                    title: "Document Opened",
                                                    description: `Opening ${doc.name} in a new tab.`,
                                                  });
                                                } else {
                                                  toast({
                                                    title: "Document Not Available",
                                                    description: `No URL found for ${doc.name}.`,
                                                    variant: "destructive",
                                                  });
                                                }
                                              }}
                                            >
                                              <Download className="w-3 h-3" />
                                            </Button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Application Rejection Reason */}
                                {selectedApplication.application_status === 'rejected' && selectedApplication.reviewComment && (
                                  <Card className="md:col-span-2">
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-lg flex items-center">
                                        <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                                        Application Rejection Details
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-1 flex-shrink-0" />
                                          <div className="text-sm text-red-800">
                                            <p className="font-medium mb-2">Previous Rejection Reason:</p>
                                            <div className="bg-white rounded-md p-3 border">
                                              <p className="text-red-700 whitespace-pre-wrap">{selectedApplication.reviewComment}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Payment Verification */}
                                {selectedApplication.payment_status && selectedApplication.payment_status !== 'not_requested' && (
                                  <Card className="md:col-span-2">
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-lg flex items-center justify-between">
                                        <span className="flex items-center">
                                          <FileText className="w-5 h-5 mr-2" />
                                          Payment Verification
                                        </span>
                                        <Badge
                                          className={`${
                                            selectedApplication.payment_status === 'verified'
                                              ? 'bg-green-100 text-green-800'
                                              : selectedApplication.payment_status === 'uploaded'
                                              ? 'bg-blue-100 text-blue-800'
                                              : selectedApplication.payment_status === 'rejected'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                          }`}
                                        >
                                          {selectedApplication.payment_status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                      </CardTitle>
                                      {selectedApplication.payment_status === 'rejected' && selectedApplication.paymentInfo?.rejectionReason && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                                          <div className="flex items-center">
                                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                            <div className="text-sm">
                                              <p className="font-medium text-red-800">
                                                Previous Rejection Reason: {selectedApplication.paymentInfo.rejectionReason}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* Find and display payment proof document from documents array - PLACE ON LEFT */}
                                        {(() => {
                                          const paymentProofDoc = selectedApplication.documents.find(doc => doc.name === 'Proof of Payment');
                                          return paymentProofDoc?.uploaded && paymentProofDoc.url ? (
                                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border">
                                              <Receipt className="w-12 h-12 text-blue-500" />
                                              <div className="flex-1">
                                                <p className="font-medium">Payment Proof Document</p>
                                                <p className="text-sm text-muted-foreground">
                                                  Uploaded {selectedApplication.paymentInfo?.uploadDate ? new Date(selectedApplication.paymentInfo.uploadDate).toLocaleDateString() : 'recently'}
                                                </p>
                                              </div>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  window.open(paymentProofDoc.url, '_blank');
                                                  toast({
                                                    title: "Document Opened",
                                                    description: "Payment proof opened in a new tab.",
                                                  });
                                                }}
                                              >
                                                <Download className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          ) : null;
                                        })()}

                                        {/* Payment Information - PLACE ON RIGHT */}
                                        <div className="space-y-3 text-sm">
                                          {selectedApplication.paymentInfo?.reference && (
                                            <div><strong>Reference:</strong> {selectedApplication.paymentInfo.reference}</div>
                                          )}
                                          {selectedApplication.paymentInfo?.amount && (
                                            <div><strong>Amount:</strong> BWP {selectedApplication.paymentInfo.amount}</div>
                                          )}
                                          {selectedApplication.paymentInfo?.paymentDate && (
                                            <div><strong>Payment Date:</strong> {new Date(selectedApplication.paymentInfo.paymentDate).toLocaleDateString()}</div>
                                          )}
                                          {selectedApplication.paymentInfo?.bankName && (
                                            <div><strong>Bank:</strong> {selectedApplication.paymentInfo.bankName}</div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Payment History - Expandable Review Cards */}
                                      {selectedApplication.paymentHistory && selectedApplication.paymentHistory.length > 0 && (() => {
                                        const rejectedPayments = selectedApplication.paymentHistory
                                          .filter(entry => entry.action === 'payment_rejected')
                                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                                        return rejectedPayments.length > 0 ? (
                                          <div className="mt-6 pt-6 border-t">
                                            <h4 className="text-lg font-semibold mb-4 flex items-center">
                                              <Receipt className="w-5 h-5 mr-2" />
                                              Rejected Payment History ({rejectedPayments.length} entries)
                                            </h4>
                                            <div className="space-y-3">
                                              {rejectedPayments.map((entry, index) => (
                                                <Collapsible key={entry.id}>
                                                  <CollapsibleTrigger asChild>
                                                    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                                                      <CardContent className="p-4">
                                                        <div className="flex items-center justify-between">
                                                          <div className="flex items-center space-x-3">
                                                            <Badge
                                                              className={`${
                                                                entry.action === 'payment_verified'
                                                                  ? 'bg-green-100 text-green-800'
                                                                  : entry.action === 'payment_rejected'
                                                                  ? 'bg-red-100 text-red-800'
                                                                  : entry.action === 'payment_uploaded'
                                                                  ? 'bg-blue-100 text-blue-800'
                                                                  : 'bg-gray-100 text-gray-800'
                                                              }`}
                                                            >
                                                              {entry.action.replace('payment_', '').charAt(0).toUpperCase() + entry.action.replace('payment_', '').slice(1)}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                              {formatPaymentHistoryDate(entry.timestamp)}
                                                            </span>
                                                            {entry.adminName && (
                                                              <span className="text-xs text-muted-foreground">
                                                                by {entry.adminName}
                                                              </span>
                                                            )}
                                                          </div>
                                                          <div className="flex items-center space-x-2">
                                                            {/* Show preview of key info */}
                                                            {entry.reason && (
                                                              <span className={`text-sm px-2 py-1 rounded text-left ${
                                                                entry.action === 'payment_rejected'
                                                                  ? 'bg-red-100 text-red-700 max-w-xs truncate'
                                                                  : 'bg-green-100 text-green-700 max-w-xs truncate'
                                                              }`}>
                                                                {entry.reason}
                                                              </span>
                                                            )}
                                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                          </div>
                                                        </div>
                                                      </CardContent>
                                                    </Card>
                                                  </CollapsibleTrigger>

                                                  <CollapsibleContent>
                                                    <Card className="border-l-4 border-l-blue-200 bg-gray-50 mt-1 mb-3">
                                                      <CardContent className="p-4">
                                                        {/* Upload Information - Full Details */}
                                                        {entry.uploadInfo && (
                                                          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                            <h5 className="font-medium text-blue-900 mb-3 flex items-center">
                                                              <FileText className="w-4 h-4 mr-2" />
                                                              Previous Payment Upload
                                                            </h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                              <div>
                                                                <p className="text-sm font-medium text-blue-800">File Details:</p>
                                                                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                                                                  <li><strong>Name:</strong> {entry.uploadInfo.originalFilename}</li>
                                                                  <li><strong>Type:</strong> {entry.uploadInfo.fileType?.toUpperCase() || 'Unknown'}</li>
                                                                  <li><strong>Size:</strong> {entry.uploadInfo.fileSize ? `${(entry.uploadInfo.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}</li>
                                                                </ul>
                                                              </div>
                                                              <div className="flex items-end">
                                                                {entry.uploadInfo.fileUrl && (
                                                                  <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                      e.preventDefault();
                                                                      try {
                                                                        window.open(entry.uploadInfo.fileUrl, '_blank');
                                                                        toast({
                                                                          title: "Document Opened",
                                                                          description: `Opening ${entry.uploadInfo.originalFilename} in a new tab.`,
                                                                        });
                                                                      } catch (error) {
                                                                        toast({
                                                                          variant: "destructive",
                                                                          title: "Download Failed",
                                                                          description: "Unable to download the file. It may have been deleted or is corrupt.",
                                                                        });
                                                                      }
                                                                    }}
                                                                  >
                                                                    <Download className="w-4 h-4 mr-2" />
                                                                    Download File
                                                                  </Button>
                                                                )}
                                                              </div>
                                                            </div>
                                                          </div>
                                                        )}



                                                        {/* General Action Details */}
                                                        {entry.details && !entry.reason && (
                                                          <div className="p-4 bg-gray-100 rounded-lg border">
                                                            <h5 className="font-medium text-gray-900 mb-2">Details:</h5>
                                                            <p className="text-sm text-gray-800">{entry.details}</p>
                                                          </div>
                                                        )}

                                                        {/* Admin Contact Info */}
                                                        {entry.adminEmail && (
                                                          <div className="mt-3 pt-3 border-t border-gray-200">
                                                            <p className="text-xs text-muted-foreground">
                                                              Processed by: {entry.adminName} ({entry.adminEmail})
                                                            </p>
                                                          </div>
                                                        )}
                                                      </CardContent>
                                                    </Card>
                                                  </CollapsibleContent>
                                                </Collapsible>
                                              ))}
                                            </div>
                                          </div>
                                        ) : null;
                                      })()}

                                      {/* Payment Verification Actions */}
                                      {selectedApplication.payment_status === 'uploaded' && (
                                        <div className="mt-6 pt-6 border-t">
                                          <div className="space-y-4">
                                            <div>
                                              <Label htmlFor="payment-notes">Verification Notes</Label>
                                              <Textarea
                                                id="payment-notes"
                                                placeholder="Enter verification notes or rejection reason..."
                                                value={paymentVerificationNotes}
                                                onChange={(e) => setPaymentVerificationNotes(e.target.value)}
                                                rows={3}
                                              />
                                            </div>
                                            <div className="flex gap-3">
                                              <Button
                                                onClick={handleVerifyPayment}
                                                className="bg-green-600 hover:bg-green-700"
                                                disabled={isVerifyingPayment || isRejectingPayment}
                                              >
                                                {isVerifyingPayment ? (
                                                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                  <Check className="w-4 h-4 mr-2" />
                                                )}
                                                {isVerifyingPayment ? "Verifying..." : "Verify Payment"}
                                              </Button>
                                              <Button
                                                variant="destructive"
                                                onClick={handleRejectPayment}
                                                disabled={isVerifyingPayment || isRejectingPayment || !paymentVerificationNotes.trim()}
                                              >
                                                {isRejectingPayment ? (
                                                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                  <X className="w-4 h-4 mr-2" />
                                                )}
                                                {isRejectingPayment ? "Rejecting..." : "Reject Payment"}
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Review Actions */}
                                <Card className="md:col-span-2">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Review & Decision</CardTitle>
                                    {selectedApplication.application_status === 'rejected' && (
                                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                                        <div className="flex items-center">
                                          <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                                          <p className="text-sm text-amber-800 font-medium">
                                            This application was previously rejected. You can re-approve if the applicant has addressed the issues.
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div>
                                      <Label htmlFor="comment">Review Comments</Label>
                                      <Textarea
                                        id="comment"
                                        placeholder="Enter your review comments or feedback..."
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        rows={4}
                                      />
                                    </div>
                                    <div className="flex gap-3 flex-wrap">
                                      {(selectedApplication.application_status === 'pending' || selectedApplication.application_status === 'under_review') ? (
                                        <>
                                          <Button
                                            onClick={() => handleRequestPayment(selectedApplication.id)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                            disabled={isRequestingPayment || isApproving || isRejecting}
                                          >
                                            {isRequestingPayment ? (
                                              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                              <FileText className="w-4 h-4 mr-2" />
                                            )}
                                            {isRequestingPayment ? "Requesting..." : "Request Proof of Payment"}
                                          </Button>
                                          <Button
                                            onClick={() => handleApprove(selectedApplication.id)}
                                            className="bg-green-600 hover:bg-green-700"
                                            disabled={isRequestingPayment || isApproving || isRejecting}
                                          >
                                            {isApproving ? (
                                              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                              <Check className="w-4 h-4 mr-2" />
                                            )}
                                            {isApproving ? "Approving..." : "Approve Application"}
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() => handleReject(selectedApplication.id)}
                                            disabled={isRequestingPayment || isApproving || isRejecting}
                                          >
                                            <X className="w-4 h-4 mr-2" />
                                            {isRejecting ? "Rejecting..." : "Reject Application"}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={() => handleDeleteApplication(selectedApplication)}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                            disabled={isRequestingPayment || isApproving || isRejecting}
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Application
                                          </Button>
                                          <Button variant="outline" onClick={handleRequestMoreInfo} disabled={isRequestingPayment || isApproving || isRejecting}>
                                            <Mail className="w-4 h-4 mr-2" />
                                            Request More Info
                                          </Button>
                                        </>
                                      ) : selectedApplication.application_status === 'rejected' ? (
                                        <>
                                          <Button
                                            onClick={() => handleReApprove(selectedApplication.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            disabled={isApproving || isRejecting || isReapproving}
                                          >
                                            {isReapproving ? (
                                              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                              <Check className="w-4 h-4 mr-2" />
                                            )}
                                            {isReapproving ? "Re-Approving..." : "Re-Approve Application"}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={() => handleDeleteApplication(selectedApplication)}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                            disabled={isApproving || isRejecting || isReapproving}
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Application
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={handleRequestMoreInfo}
                                            disabled={isApproving || isRejecting || isReapproving}
                                          >
                                            <Mail className="w-4 h-4 mr-2" />
                                            Contact Applicant
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <Button
                                            variant="outline"
                                            onClick={() => handleDeleteApplication(selectedApplication)}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                            disabled={isApproving || isRejecting}
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Application
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={handleRequestMoreInfo}
                                            disabled={isApproving || isRejecting}
                                          >
                                            <Mail className="w-4 h-4 mr-2" />
                                            Contact Applicant
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Email Dialog */}
                        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Send Email to {selectedApplication?.name}</DialogTitle>
                              <DialogDescription>
                                Compose an email to request additional information from the applicant.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="emailTo">To</Label>
                                <Input id="emailTo" value={selectedApplication?.email} readOnly />
                              </div>
                              <div>
                                <Label htmlFor="emailSubject">Subject</Label>
                                <Input 
                                  id="emailSubject" 
                                  value={emailSubject} 
                                  onChange={(e) => setEmailSubject(e.target.value)} 
                                />
                              </div>
                              <div>
                                <Label htmlFor="emailBody">Body</Label>
                                <Textarea
                                  id="emailBody"
                                  value={emailBody}
                                  onChange={(e) => setEmailBody(e.target.value)}
                                  rows={8}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button>
                              <Button onClick={handleSendEmail}>Send Email</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loading && (
              <div className="flex justify-center items-center p-4">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                <p className="ml-2">Loading applications...</p>
              </div>
            )}
            {error && (
              <div className="text-center text-red-500 p-4">
                <p>Error: {error}</p>
                <Button onClick={fetchApplications} className="mt-2">Retry</Button>
              </div>
            )}
            {!loading && !error && applications.length === 0 && (
              <p className="text-center text-muted-foreground p-4">No membership applications found.</p>
            )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.application_status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {applications.filter(app => app.application_status === 'under_review').length}
              </div>
              <p className="text-sm text-muted-foreground">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.application_status === 'approved').length}
              </div>
              <p className="text-sm text-muted-foreground">Approved Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {applications.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                Delete Application
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this membership application? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {applicationToDelete && (
              <div className="py-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">Application Details:</p>
                      <p><strong>Name:</strong> {applicationToDelete.name}</p>
                      <p><strong>Email:</strong> {applicationToDelete.email}</p>
                      <p><strong>Status:</strong> {applicationToDelete.application_status.replace('_', ' ').toUpperCase()}</p>
                      <p className="mt-2 text-red-700 font-medium">
                        Warning: This will permanently remove all application data and uploaded documents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteApplication}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Application"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Applications;
