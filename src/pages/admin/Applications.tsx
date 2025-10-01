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
  ArrowDown
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
  personalInfo: {
    dateOfBirth: string;
    idNumber: string;
    physicalAddress: string;
    postalAddress: string;
    membershipNumber?: string;
  };
  phone: string;
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

  // Sorting state
  const [sortField, setSortField] = useState<'membershipType' | 'application_status' | 'created_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // Default to newest first

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications`);
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
          <CardContent>
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
                      Application Type
                      {getSortIcon('membershipType')}
                    </Button>
                  </TableHead>
                  <TableHead>Qualification & Experience</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('application_status')}
                      className="h-auto p-0 font-semibold hover:bg-muted/50"
                      aria-label={getSortAriaLabel('application_status')}
                    >
                      Status
                      {getSortIcon('application_status')}
                    </Button>
                  </TableHead>
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
                                      {selectedApplication.documents.map((doc, index) => (
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
                                      {selectedApplication.application_status !== 'rejected' ? (
                                        <>
                                          <Button
                                            onClick={() => handleApprove(selectedApplication.id)}
                                            className="bg-green-600 hover:bg-green-700"
                                            disabled={isApproving || isRejecting || isReapproving}
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
                                            disabled={isApproving || isRejecting || isReapproving}
                                          >
                                            <X className="w-4 h-4 mr-2" />
                                            {isRejecting ? "Rejecting..." : "Reject Application"}
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
                                          <Button variant="outline" onClick={handleRequestMoreInfo} disabled={isApproving || isRejecting || isReapproving}>
                                            <Mail className="w-4 h-4 mr-2" />
                                            Request More Info
                                          </Button>
                                        </>
                                      ) : (
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
