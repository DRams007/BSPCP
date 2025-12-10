import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Eye, Download, Mail, Loader2, Clock, User, GraduationCap, FileText, Check, X, AlertCircle } from "lucide-react";

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  occupation: string;
  organization: string;
  qualification: string;
  experience: number;
  submittedDate: string;
  updated_at: string;
  created_at: string;
  application_status: string;
  member_status: "active" | "pending" | "suspended" | "pending_password_setup" | "expired";
  membershipType: string;
  specializations: string[];
  languages: string[];
  session_types: string[];
  availability: string;
  dateOfBirth: string;
  renewalDate: string;
  idNumber: string;
  physicalAddress: string;
  postalAddress: string;
  membershipId: string;
  renewal_status: "not_requested" | "requested" | "uploaded" | "verified" | "rejected";
  renewal_date: string;
  renewal_proof_url?: string;
  renewal_uploaded_at?: string;
  renewal_uploaded_at_formatted?: string;
  renewal_token_expires_at?: string;
  renewal_history?: Array<{
    id: string;
    action: string;
    details: string;
    timestamp: string;
    adminName: string;
    adminEmail: string;
    reason: string;
  }>;
  personalInfo: {
    dateOfBirth: string;
    renewalDate: string;
    idNumber: string;
    physicalAddress: string;
    postalAddress: string;
    membershipNumber: string;
  };
  memberDocuments?: {
    idDocument?: {
      name: string;
      url: string;
    };
    certificates?: Array<{
      name: string;
      url: string;
    }>;
    cpdDocuments?: Array<{
      title: string;
      points: number;
      completion_date: string | null;
      url: string | null;
    }>;
  };
  // Add other relevant fields from the database as needed
}

interface Application {
  id: number;
  name: string;
  email: string;
  bspcp_membership_number: string;
  application_status: string;
  member_status: "active" | "pending" | "suspended";
  submittedDate: string;
  qualification: string;
  organization: string;
  nationality: string;
  occupation: string;
  phone: string;
  experience: number;
  specializations: string[];
  languages: string[];
  session_types: string[];
  availability: string;
  dateOfBirth: string;
  idNumber: string;
  physicalAddress: string;
  postalAddress: string;
}

const Members = () => {
  const { toast } = useToast();
  const { token } = useAuth();

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
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [isMailDialogOpen, setIsMailDialogOpen] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [mailRecipients, setMailRecipients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [renewalVerificationNotes, setRenewalVerificationNotes] = useState("");
  const [isApprovingRenewal, setIsApprovingRenewal] = useState(false);
  const [isRejectingRenewal, setIsRejectingRenewal] = useState(false);
  const [isSendingRenewalRequest, setIsSendingRenewalRequest] = useState(false);


  const handleSendRenewalRequest = async (memberId: number) => {
    setIsSendingRenewalRequest(true);
    try {
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/send-renewal-request/${memberId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}${errorData.error ? ` - ${errorData.error}` : ''}`);
      }

      toast({
        title: "Success",
        description: "Renewal request sent successfully.",
        variant: "default",
      });

      fetchMembers();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: `Failed to send renewal request: ${error.message}`,
        variant: "destructive",
      });
      console.error("Error sending renewal request:", err);
    } finally {
      setIsSendingRenewalRequest(false);
    }
  };


  const handleApproveRenewal = async (memberId: number) => {
    setIsApprovingRenewal(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/renewal-records/${memberId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
        body: JSON.stringify({ reviewComment: renewalVerificationNotes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Renewal Approved",
        description: `Renewal has been approved successfully.`,
      });

      setRenewalVerificationNotes("");
      fetchMembers();

    } catch (err) {
      const error = err as Error;
      console.error('Error approving renewal:', error);
      toast({
        title: "Approval Failed",
        description: `Failed to approve renewal: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsApprovingRenewal(false);
    }
  };

  const handleRejectRenewal = async (memberId: number) => {
    if (!renewalVerificationNotes.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting the renewal.",
        variant: "destructive",
      });
      return;
    }

    setIsRejectingRenewal(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/renewal-records/${memberId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
        body: JSON.stringify({ reviewComment: renewalVerificationNotes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Renewal Rejected",
        description: `Renewal has been rejected.`,
        variant: "destructive",
      });

      setRenewalVerificationNotes("");
      fetchMembers();

    } catch (err) {
      const error = err as Error;
      console.error('Error rejecting renewal:', error);
      toast({
        title: "Rejection Failed",
        description: `Failed to reject renewal: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsRejectingRenewal(false);
    }
  };




  const fetchMembers = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/applications?status=approved`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const formattedMembers: Member[] = data.map((app: any) => ({
        id: app.id,
        name: app.name,
        email: app.email,
        membershipId: app.personalInfo.membershipNumber,
        application_status: app.application_status,
        member_status: app.member_status,
        renewal_status: app.renewal_status,
        renewal_date: app.renewal_date,
        renewal_proof_url: app.renewal_proof_url,
        renewal_uploaded_at: app.renewal_uploaded_at,
        renewal_token_expires_at: app.renewal_token_expires_at,
        renewal_history: app.renewal_history,
        membershipType: app.membershipType,
        submittedDate: app.submittedDate,
        updated_at: app.updated_at,
        created_at: app.created_at,
        qualification: app.qualification,
        organization: app.organization,
        nationality: app.nationality,
        occupation: app.occupation,
        phone: app.phone,
        experience: app.experience,
        specializations: app.specializations,
        languages: app.languages,
        session_types: app.session_types,
        availability: app.availability,
        dateOfBirth: app.personalInfo.dateOfBirth,
        renewalDate: app.personalInfo.renewalDate,
        idNumber: app.personalInfo.idNumber,
        physicalAddress: app.personalInfo.physicalAddress,
        postalAddress: app.personalInfo.postalAddress,
        personalInfo: {
          dateOfBirth: app.personalInfo.dateOfBirth,
          renewalDate: app.personalInfo.renewalDate,
          idNumber: app.personalInfo.idNumber,
          physicalAddress: app.personalInfo.physicalAddress,
          postalAddress: app.personalInfo.postalAddress,
          membershipNumber: app.personalInfo.membershipNumber,
        },
        memberDocuments: app.memberDocuments || {
          idDocument: null,
          certificates: [],
          cpdDocuments: []
        },
      }));
      setMembers(formattedMembers);
    } catch (err) {
      const error = err as Error;
      setError(`Failed to fetch members: ${error.message}`);
      console.error("Error fetching members:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();

    const handlePaymentVerified = () => fetchMembers();
    window.addEventListener('paymentVerified', handlePaymentVerified);

    return () => {
      window.removeEventListener('paymentVerified', handlePaymentVerified);
    };
  }, []);

  const handleStatusChange = async (memberId: number, newStatus: "active" | "pending" | "suspended") => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/members/${memberId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Refetch members to ensure UI is updated with the latest data
      fetchMembers();
      console.log(`Member ${memberId} status updated to ${newStatus}`);
    } catch (err) {
      const error = err as Error;
      setError(`Failed to update member status: ${error.message}`);
      console.error("Error updating member status:", err);
    }
  };

  const handleSelectMember = (memberId: number) => {
    setSelectedMembers(prevSelected =>
      prevSelected.includes(memberId)
        ? prevSelected.filter(id => id !== memberId)
        : [...prevSelected, memberId]
    );
  };

  const handleSelectAllMembers = () => {
    if (selectedMembers.length === filteredMembers.length && filteredMembers.length > 0) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(member => member.id));
    }
  };

  const openMailDialog = (recipients: string[]) => {
    setMailRecipients(recipients);
    setMailSubject("");
    setMailBody("");
    setIsMailDialogOpen(true);
  };

  const sendEmail = async () => {
    setSendingEmail(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipients: mailRecipients,
          subject: mailSubject,
          body: mailBody,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: `Email sent successfully to ${mailRecipients.length} recipient${mailRecipients.length > 1 ? 's' : ''}.`,
        variant: "default",
      });

      // Close the dialog and clear the form
      setIsMailDialogOpen(false);
      setMailSubject("");
      setMailBody("");

    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: `Failed to send email: ${error.message}`,
        variant: "destructive",
      });
      console.error("Error sending email:", err);
    } finally {
      setSendingEmail(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = searchTerm === "" ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.membershipId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading members...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-red-500">
          <p>Error: {error}</p>
          <Button onClick={() => fetchMembers()} className="mt-4">Retry</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Members Management</h1>
            <p className="text-muted-foreground">Manage BSPCP member accounts and profiles</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => openMailDialog(members.map(m => m.email))}>
              <Mail className="w-4 h-4 mr-2" />
              Email All
            </Button>
            <Button disabled={selectedMembers.length === 0} onClick={() => openMailDialog(members.filter(m => selectedMembers.includes(m.id)).map(m => m.email))}>
              <Mail className="w-4 h-4 mr-2" />
              Email Selected ({selectedMembers.length})
            </Button>

            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export List
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or membership ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Members List ({filteredMembers.length})</CardTitle>
            <CardDescription>
              All approved registered members and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                        onCheckedChange={handleSelectAllMembers}
                      />
                    </TableHead>
                    <TableHead>Member Details</TableHead>
                    <TableHead>Memeber Type</TableHead>
                    <TableHead>Membership ID</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approval Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={() => handleSelectMember(member.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <p className="text-xs text-muted-foreground">{member.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${member.membershipType === 'professional'
                              ? 'bg-purple-100 text-purple-800'
                              : member.membershipType === 'student'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {member.membershipType === 'professional'
                            ? 'Professional'
                            : member.membershipType === 'student'
                              ? 'Student'
                              : member.membershipType || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {member.membershipId}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{member.organization}</p>
                          <p className="text-xs text-muted-foreground">{member.occupation}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.member_status === "pending_password_setup" ? (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Password Setup
                          </div>
                        ) : member.member_status === "expired" ? (
                          <Badge className="bg-red-100 text-red-800">Expired</Badge>
                        ) : (
                          <Select
                            value={member.member_status}
                            onValueChange={(newStatus: "active" | "pending" | "suspended") =>
                              handleStatusChange(member.id, newStatus)
                            }
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(member.updated_at || member.created_at).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog onOpenChange={(open) => { if (open) fetchMembers(false); }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Member Details - {member.name}</DialogTitle>
                                <DialogDescription>
                                  Complete profile information for {member.name}
                                </DialogDescription>
                              </DialogHeader>

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
                                    <div><strong>Full Name:</strong> {member.name}</div>
                                    <div><strong>Email:</strong> {member.email}</div>
                                    <div><strong>Phone:</strong> {member.phone}</div>
                                    <div><strong>Membership Type:</strong>
                                      <Badge
                                        className={`ml-2 ${member.membershipType === 'professional'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                          }`}
                                      >
                                        {member.membershipType === 'professional' ? 'Professional' : 'Student'}
                                      </Badge>
                                    </div>
                                    <div><strong>Nationality:</strong> {member.nationality}</div>
                                    <div><strong>Date of Birth:</strong> {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}</div>
                                    <div><strong>ID Number:</strong> {member.idNumber}</div>
                                    <div><strong>Membership ID:</strong> {member.membershipId}</div>
                                    <div><strong>Physical Address:</strong> {member.physicalAddress}</div>
                                    <div><strong>Postal Address:</strong> {member.postalAddress}</div>
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
                                    <div><strong>Occupation:</strong> {member.occupation}</div>
                                    <div><strong>Organization:</strong> {member.organization}</div>
                                    <div><strong>Highest Qualification:</strong> {member.qualification}</div>
                                    <div><strong>Years Experience:</strong> {member.experience}</div>
                                    <div><strong>Specializations:</strong> {member.specializations?.join(', ') || 'N/A'}</div>
                                    <div><strong>Languages:</strong> {member.languages?.join(', ') || 'N/A'}</div>
                                    <div><strong>Session Types:</strong> {member.session_types?.join(', ') || 'N/A'}</div>
                                    <div><strong>Availability:</strong> {member.availability || 'N/A'}</div>
                                  </CardContent>
                                </Card>

                                {/* Member Documents */}
                                <Card className="md:col-span-2">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center">
                                      <FileText className="w-5 h-5 mr-2" />
                                      Member Documents
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* ID Document */}
                                      <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center">
                                          {member.memberDocuments?.idDocument ? (
                                            <>
                                              <Check className="w-4 h-4 text-green-500 mr-2" />
                                              <span className="text-sm">ID Document</span>
                                            </>
                                          ) : (
                                            <>
                                              <X className="w-4 h-4 text-red-500 mr-2" />
                                              <span className="text-sm">ID Document</span>
                                            </>
                                          )}
                                        </div>
                                        {member.memberDocuments?.idDocument && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              window.open(member.memberDocuments.idDocument.url, "_blank");
                                            }}
                                          >
                                            <Download className="w-3 h-3" />
                                          </Button>
                                        )}
                                      </div>

                                      {/* Certificates */}
                                      <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center">
                                          {member.memberDocuments?.certificates && member.memberDocuments.certificates.length > 0 ? (
                                            <>
                                              <Check className="w-4 h-4 text-green-500 mr-2" />
                                              <span className="text-sm">Certificates ({member.memberDocuments.certificates.length})</span>
                                            </>
                                          ) : (
                                            <>
                                              <X className="w-4 h-4 text-red-500 mr-2" />
                                              <span className="text-sm">Certificates</span>
                                            </>
                                          )}
                                        </div>
                                        {member.memberDocuments?.certificates && member.memberDocuments.certificates.length > 0 && (
                                          <div className="flex gap-1">
                                            {member.memberDocuments.certificates.slice(0, 2).map((cert, index) => (
                                              <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  window.open(cert.url, "_blank");
                                                }}
                                              >
                                                <Download className="w-3 h-3" />
                                              </Button>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* CPD Documents */}
                                      <div className="flex items-center justify-between p-3 border rounded-lg md:col-span-2">
                                        <div className="flex items-center">
                                          {member.memberDocuments?.cpdDocuments && member.memberDocuments.cpdDocuments.length > 0 ? (
                                            <>
                                              <Check className="w-4 h-4 text-green-500 mr-2" />
                                              <span className="text-sm">CPD Documents ({member.memberDocuments.cpdDocuments.length})</span>
                                            </>
                                          ) : (
                                            <>
                                              <X className="w-4 h-4 text-red-500 mr-2" />
                                              <span className="text-sm">CPD Documents</span>
                                            </>
                                          )}
                                        </div>
                                        {member.memberDocuments?.cpdDocuments && member.memberDocuments.cpdDocuments.length > 0 && (
                                          <div className="flex gap-1">
                                            {member.memberDocuments.cpdDocuments.slice(0, 2).map((cpd, index) => (
                                              <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  if (cpd.url) {
                                                    window.open(cpd.url, "_blank");
                                                  }
                                                }}
                                                disabled={!cpd.url}
                                              >
                                                <Download className="w-3 h-3" />
                                              </Button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Detailed CPD Documents */}
                                    {member.memberDocuments?.cpdDocuments && member.memberDocuments.cpdDocuments.length > 0 && (
                                      <div className="mt-4">
                                        <h5 className="font-medium mb-3">CPD Details</h5>
                                        <div className="space-y-2">
                                          {member.memberDocuments.cpdDocuments.map((cpd, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                              <div className="text-sm">
                                                <p className="font-medium">{cpd.title}</p>
                                                <p className="text-muted-foreground">Points: {cpd.points} | Date: {cpd.completion_date ? new Date(cpd.completion_date).toLocaleDateString('en-GB') : 'N/A'}</p>
                                              </div>
                                              {cpd.url && (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => {
                                                    window.open(cpd.url, "_blank");
                                                  }}
                                                >
                                                  <Download className="w-3 h-3" />
                                                </Button>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                {/* Renewal Information */}
                                <Card className="md:col-span-2">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                      <span className="flex items-center">
                                        <Clock className="w-5 h-5 mr-2" />
                                        Renewal Verification
                                      </span>
                                      <Badge
                                        className={`${member.renewal_status === 'verified'
                                            ? 'bg-green-100 text-green-800'
                                            : member.renewal_status === 'uploaded'
                                              ? 'bg-blue-100 text-blue-800'
                                              : member.renewal_status === 'rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : member.renewal_status === 'requested'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-gray-100 text-gray-800'
                                          }`}
                                      >
                                        {(member.renewal_status || '').replace('_', ' ').toUpperCase()}
                                      </Badge>
                                    </CardTitle>
                                    {member.renewal_status === 'rejected' && member.renewal_history && (
                                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                                        <div className="flex items-center">
                                          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                          <div className="text-sm">
                                            <p className="font-medium text-red-800">
                                              Previous Rejection Reason: {(() => {
                                                const latestRejection = member.renewal_history
                                                  .filter(entry => entry.action === 'renewal_rejected')
                                                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                                                return latestRejection?.reason || 'Renewal proof was rejected';
                                              })()}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      {/* Renewal Document Display - LEFT */}
                                      {member.renewal_proof_url && (
                                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border">
                                          <FileText className="w-12 h-12 text-blue-500" />
                                          <div className="flex-1">
                                            <p className="font-medium">Renewal Proof Document</p>
                                            <p className="text-sm text-muted-foreground">
                                              Uploaded {member.renewal_uploaded_at_formatted ? member.renewal_uploaded_at_formatted : 'recently'}
                                            </p>
                                          </div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(`${import.meta.env.VITE_API_URL}${member.renewal_proof_url}`, '_blank')}
                                          >
                                            <Download className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      )}

                                      {/* Renewal Information - RIGHT */}
                                      <div className="space-y-3 text-sm">
                                        <div>
                                          <strong>Renewal Date:</strong> {member.personalInfo?.renewalDate ? new Date(member.personalInfo.renewalDate).toLocaleDateString('en-GB') : 'N/A'}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Renewal Verification Actions */}
                                    {member.renewal_status === 'uploaded' && (
                                      <div className="mt-6 pt-6 border-t">
                                        <div className="space-y-4">
                                          <div>
                                            <Label htmlFor="renewal-notes">Verification Notes</Label>
                                            <Textarea
                                              id="renewal-notes"
                                              placeholder="Enter verification notes or rejection reason..."
                                              value={renewalVerificationNotes}
                                              onChange={(e) => setRenewalVerificationNotes(e.target.value)}
                                              rows={3}
                                            />
                                          </div>
                                          <div className="flex gap-3">
                                            <Button
                                              onClick={() => handleApproveRenewal(member.id)}
                                              className="bg-green-600 hover:bg-green-700"
                                              disabled={isApprovingRenewal || isRejectingRenewal}
                                            >
                                              {isApprovingRenewal ? (
                                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                              ) : (
                                                <Check className="w-4 h-4 mr-2" />
                                              )}
                                              {isApprovingRenewal ? "Approving..." : "Approve Renewal"}
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              onClick={() => handleRejectRenewal(member.id)}
                                              disabled={isApprovingRenewal || isRejectingRenewal || !renewalVerificationNotes.trim()}
                                            >
                                              {isRejectingRenewal ? (
                                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                              ) : (
                                                <X className="w-4 h-4 mr-2" />
                                              )}
                                              {isRejectingRenewal ? "Rejecting..." : "Reject Renewal"}
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm" onClick={() => openMailDialog([member.email])}>
                            <Mail className="w-4 h-4" />
                          </Button>
                          {member.member_status === "expired" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendRenewalRequest(member.id)}
                              disabled={isSendingRenewalRequest}
                            >
                              {isSendingRenewalRequest ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Clock className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="p-4">
                  <CardContent className="p-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={() => handleSelectMember(member.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium">{member.name}</p>
                            <Badge
                              className={`${member.membershipType === 'professional'
                                  ? 'bg-purple-100 text-purple-800'
                                  : member.membershipType === 'student'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                } text-xs px-2 py-1`}
                            >
                              {member.membershipType === 'professional'
                                ? 'Professional'
                                : member.membershipType === 'student'
                                  ? 'Student'
                                  : member.membershipType || 'Unknown'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>{member.email}</p>
                            <p>{member.phone}</p>
                            <p className="text-xs">{member.organization} • {member.occupation}</p>
                            <p className="text-xs font-mono">{member.membershipId}</p>
                            <p className="text-xs">Approved: {new Date(member.updated_at || member.created_at).toLocaleDateString('en-GB')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-2">
                        {member.member_status === "pending_password_setup" ? (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Password Setup
                          </div>
                        ) : member.member_status === "expired" ? (
                          <Badge className="bg-red-100 text-red-800">Expired</Badge>
                        ) : (
                          <Select
                            value={member.member_status}
                            onValueChange={(newStatus: "active" | "pending" | "suspended") =>
                              handleStatusChange(member.id, newStatus)
                            }
                          >
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 border-t pt-3">
                      <Dialog onOpenChange={(open) => { if (open) fetchMembers(false); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Member Details - {member.name}</DialogTitle>
                            <DialogDescription>
                              Complete profile information for {member.name}
                            </DialogDescription>
                          </DialogHeader>

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
                                <div><strong>Full Name:</strong> {member.name}</div>
                                <div><strong>Email:</strong> {member.email}</div>
                                <div><strong>Phone:</strong> {member.phone}</div>
                                <div><strong>Membership Type:</strong>
                                  <Badge
                                    className={`ml-2 ${member.membershipType === 'professional'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-blue-100 text-blue-800'
                                      }`}
                                  >
                                    {member.membershipType === 'professional' ? 'Professional' : 'Student'}
                                  </Badge>
                                </div>
                                <div><strong>Nationality:</strong> {member.nationality}</div>
                                <div><strong>Date of Birth:</strong> {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}</div>
                                <div><strong>ID Number:</strong> {member.idNumber}</div>
                                <div><strong>Membership ID:</strong> {member.membershipId}</div>
                                <div><strong>Physical Address:</strong> {member.physicalAddress}</div>
                                <div><strong>Postal Address:</strong> {member.postalAddress}</div>
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
                                <div><strong>Occupation:</strong> {member.occupation}</div>
                                <div><strong>Organization:</strong> {member.organization}</div>
                                <div><strong>Highest Qualification:</strong> {member.qualification}</div>
                                <div><strong>Years Experience:</strong> {member.experience}</div>
                                <div><strong>Specializations:</strong> {member.specializations?.join(', ') || 'N/A'}</div>
                                <div><strong>Languages:</strong> {member.languages?.join(', ') || 'N/A'}</div>
                                <div><strong>Session Types:</strong> {member.session_types?.join(', ') || 'N/A'}</div>
                                <div><strong>Availability:</strong> {member.availability || 'N/A'}</div>
                              </CardContent>
                            </Card>

                            {/* Member Documents */}
                            <Card className="md:col-span-2">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center">
                                  <FileText className="w-5 h-5 mr-2" />
                                  Member Documents
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* ID Document */}
                                  <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center">
                                      {member.memberDocuments?.idDocument ? (
                                        <>
                                          <Check className="w-4 h-4 text-green-500 mr-2" />
                                          <span className="text-sm">ID Document</span>
                                        </>
                                      ) : (
                                        <>
                                          <X className="w-4 h-4 text-red-500 mr-2" />
                                          <span className="text-sm">ID Document</span>
                                        </>
                                      )}
                                    </div>
                                    {member.memberDocuments?.idDocument && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          window.open(member.memberDocuments.idDocument.url, "_blank");
                                        }}
                                      >
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>

                                  {/* Certificates */}
                                  <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center">
                                      {member.memberDocuments?.certificates && member.memberDocuments.certificates.length > 0 ? (
                                        <>
                                          <Check className="w-4 h-4 text-green-500 mr-2" />
                                          <span className="text-sm">Certificates ({member.memberDocuments.certificates.length})</span>
                                        </>
                                      ) : (
                                        <>
                                          <X className="w-4 h-4 text-red-500 mr-2" />
                                          <span className="text-sm">Certificates</span>
                                        </>
                                      )}
                                    </div>
                                    {member.memberDocuments?.certificates && member.memberDocuments.certificates.length > 0 && (
                                      <div className="flex gap-1">
                                        {member.memberDocuments.certificates.slice(0, 2).map((cert, index) => (
                                          <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              window.open(cert.url, "_blank");
                                            }}
                                          >
                                            <Download className="w-3 h-3" />
                                          </Button>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* CPD Documents */}
                                  <div className="flex items-center justify-between p-3 border rounded-lg md:col-span-2">
                                    <div className="flex items-center">
                                      {member.memberDocuments?.cpdDocuments && member.memberDocuments.cpdDocuments.length > 0 ? (
                                        <>
                                          <Check className="w-4 h-4 text-green-500 mr-2" />
                                          <span className="text-sm">CPD Documents ({member.memberDocuments.cpdDocuments.length})</span>
                                        </>
                                      ) : (
                                        <>
                                          <X className="w-4 h-4 text-red-500 mr-2" />
                                          <span className="text-sm">CPD Documents</span>
                                        </>
                                      )}
                                    </div>
                                    {member.memberDocuments?.cpdDocuments && member.memberDocuments.cpdDocuments.length > 0 && (
                                      <div className="flex gap-1">
                                        {member.memberDocuments.cpdDocuments.slice(0, 2).map((cpd, index) => (
                                          <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              if (cpd.url) {
                                                window.open(cpd.url, "_blank");
                                              }
                                            }}
                                            disabled={!cpd.url}
                                          >
                                            <Download className="w-3 h-3" />
                                          </Button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Detailed CPD Documents */}
                                {member.memberDocuments?.cpdDocuments && member.memberDocuments.cpdDocuments.length > 0 && (
                                  <div className="mt-4">
                                    <h5 className="font-medium mb-3">CPD Details</h5>
                                    <div className="space-y-2">
                                      {member.memberDocuments.cpdDocuments.map((cpd, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                          <div className="text-sm">
                                            <p className="font-medium">{cpd.title}</p>
                                            <p className="text-muted-foreground">Points: {cpd.points} | Date: {cpd.completion_date ? new Date(cpd.completion_date).toLocaleDateString('en-GB') : 'N/A'}</p>
                                          </div>
                                          {cpd.url && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                window.open(cpd.url, "_blank");
                                              }}
                                            >
                                              <Download className="w-3 h-3" />
                                            </Button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openMailDialog([member.email])}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                      {member.member_status === "expired" && (
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleSendRenewalRequest(member.id)} disabled={isSendingRenewalRequest}>
                          {isSendingRenewalRequest ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Clock className="w-4 h-4 mr-2" />
                          )}
                          Renew
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {members.length}
              </div>
              <p className="text-sm text-muted-foreground">Approved Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                0
              </div>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                0
              </div>
              <p className="text-sm text-muted-foreground">Suspended</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {members.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </CardContent>
          </Card>
        </div>

        {/* Email Dialog */}
        <Dialog open={isMailDialogOpen} onOpenChange={setIsMailDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Send Email</DialogTitle>
              <DialogDescription>
                Compose and send an email to the selected recipients.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recipients" className="text-right">
                  To
                </Label>
                <Input
                  id="recipients"
                  value={mailRecipients.join(", ")}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="body" className="text-right">
                  Body
                </Label>
                <Textarea
                  id="body"
                  value={mailBody}
                  onChange={(e) => setMailBody(e.target.value)}
                  className="col-span-3"
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={sendEmail} disabled={sendingEmail}>
                {sendingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Email"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Members;
