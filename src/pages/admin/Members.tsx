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
import { Search, Eye, Edit, MoreVertical, Download, Mail, Loader2, Clock } from "lucide-react";

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
  application_status: string;
  member_status: "active" | "pending" | "suspended" | "pending_password_setup";
  membershipType: string;
  specializations: string[];
  languages: string[];
  session_types: string[];
  availability: string;
  dateOfBirth: string;
  idNumber: string;
  physicalAddress: string;
  postalAddress: string;
  membershipId: string;
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
  bspcpMembershipNumber: string;
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

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications?status=approved`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const formattedMembers: Member[] = data.map((app: any) => ({
        id: app.id,
        name: app.name,
        email: app.email,
        membershipId: app.bspcpMembershipNumber || `BSPCP-${app.id}`,
        application_status: app.application_status,
        member_status: app.member_status,
        membershipType: app.membershipType,
        submittedDate: app.submittedDate,
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
        idNumber: app.personalInfo.idNumber,
        physicalAddress: app.personalInfo.physicalAddress,
        postalAddress: app.personalInfo.postalAddress,
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleStatusChange = async (memberId: number, newStatus: "active" | "pending" | "suspended") => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/members/${memberId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
          <Button onClick={fetchMembers} className="mt-4">Retry</Button>
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
                    <TableHead>Join Date</TableHead>
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
                          className={`${
                            member.membershipType === 'professional'
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
                        {new Date(member.submittedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Member Details</DialogTitle>
                                <DialogDescription>
                                  Complete profile information for {member.name}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-3">Personal Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Name:</strong> {member.name}</p>
                                      <p><strong>Email:</strong> {member.email}</p>
                                      <p><strong>Phone:</strong> {member.phone}</p>
                                      <p><strong>Nationality:</strong> {member.nationality}</p>
                                      <p><strong>ID Number:</strong> {member.idNumber}</p>
                                      <p><strong>Date of Birth:</strong> {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-3">Professional Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Highest Qualification:</strong> {member.qualification}</p>
                                      <p><strong>Organization:</strong> {member.organization}</p>
                                      <p><strong>Occupation:</strong> {member.occupation}</p>
                                      <p><strong>Years Experience:</strong> {member.experience}</p>
                                      <p><strong>Member ID:</strong> {member.membershipId}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Member Documents */}
                                <div>
                                  <h4 className="font-semibold mb-3">Member Documents</h4>

                                  {/* ID Document */}
                                  {member.memberDocuments?.idDocument ? (
                                    <div className="mb-4">
                                      <h5 className="font-medium mb-2">ID Document</h5>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                      >
                                        <a href={member.memberDocuments.idDocument.url} target="_blank" rel="noopener noreferrer">
                                          <Download className="mr-2 h-4 w-4" />
                                          Download ID Document
                                        </a>
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="mb-4">
                                      <h5 className="font-medium mb-2">ID Document</h5>
                                      <p className="text-sm text-muted-foreground">No ID document uploaded</p>
                                    </div>
                                  )}

                                  {/* Certificates */}
                                  <div className="mb-4">
                                    <h5 className="font-medium mb-2">Certificates</h5>
                                    {member.memberDocuments?.certificates && member.memberDocuments.certificates.length > 0 ? (
                                      <div className="space-y-2">
                                        {member.memberDocuments.certificates.map((cert, index) => (
                                          <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="mr-2"
                                          >
                                            <a href={cert.url} target="_blank" rel="noopener noreferrer">
                                              <Download className="mr-2 h-4 w-4" />
                                              {cert.name}
                                            </a>
                                          </Button>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No certificates uploaded</p>
                                    )}
                                  </div>

                                  {/* CPD Documents */}
                                  <div className="mb-4">
                                    <h5 className="font-medium mb-2">CPD Documents</h5>
                                    {member.memberDocuments?.cpdDocuments && member.memberDocuments.cpdDocuments.length > 0 ? (
                                      <div className="space-y-2">
                                        {member.memberDocuments.cpdDocuments.map((cpd, index) => (
                                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                                            <div className="text-sm">
                                              <p className="font-medium">{cpd.title}</p>
                                              <p className="text-muted-foreground">Points: {cpd.points} | Date: {cpd.completion_date ? new Date(cpd.completion_date).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                            {cpd.url ? (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                              >
                                                <a href={cpd.url} target="_blank" rel="noopener noreferrer">
                                                  <Download className="mr-2 h-4 w-4" />
                                                  Download
                                                </a>
                                              </Button>
                                            ) : (
                                              <span className="text-sm text-muted-foreground">No document file</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No CPD documents uploaded</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm" onClick={() => openMailDialog([member.email])}>
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
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
                              className={`${
                                member.membershipType === 'professional'
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
                            <p className="text-xs">Joined: {new Date(member.submittedDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-2">
                        {member.member_status === "pending_password_setup" ? (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Password Setup
                          </div>
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Member Details</DialogTitle>
                            <DialogDescription>
                              Complete profile information for {member.name}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 py-4">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-3">Personal Information</h4>
                                <div className="space-y-2 text-sm">
                                  <p><strong>Name:</strong> {member.name}</p>
                                  <p><strong>Email:</strong> {member.email}</p>
                                  <p><strong>Phone:</strong> {member.phone}</p>
                                  <p><strong>Nationality:</strong> {member.nationality}</p>
                                  <p><strong>ID Number:</strong> {member.idNumber}</p>
                                  <p><strong>Date of Birth:</strong> {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-3">Professional Information</h4>
                                <div className="space-y-2 text-sm">
                                  <p><strong>Highest Qualification:</strong> {member.qualification}</p>
                                  <p><strong>Organization:</strong> {member.organization}</p>
                                  <p><strong>Occupation:</strong> {member.occupation}</p>
                                  <p><strong>Years Experience:</strong> {member.experience}</p>
                                  <p><strong>Member ID:</strong> {member.membershipId}</p>
                                </div>
                              </div>
                            </div>

                            {/* Member Documents */}
                            <div>
                              <h4 className="font-semibold mb-3">Member Documents</h4>

                              {/* ID Document */}
                              {member.memberDocuments?.idDocument ? (
                                <div className="mb-4">
                                  <h5 className="font-medium mb-2">ID Document</h5>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <a href={member.memberDocuments.idDocument.url} target="_blank" rel="noopener noreferrer">
                                      <Download className="mr-2 h-4 w-4" />
                                      Download ID Document
                                    </a>
                                  </Button>
                                </div>
                              ) : (
                                <div className="mb-4">
                                  <h5 className="font-medium mb-2">ID Document</h5>
                                  <p className="text-sm text-muted-foreground">No ID document uploaded</p>
                                </div>
                              )}

                              {/* Certificates */}
                              <div className="mb-4">
                                <h5 className="font-medium mb-2">Certificates</h5>
                                {member.memberDocuments?.certificates && member.memberDocuments.certificates.length > 0 ? (
                                  <div className="space-y-2">
                                    {member.memberDocuments.certificates.map((cert, index) => (
                                      <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="mr-2"
                                      >
                                        <a href={cert.url} target="_blank" rel="noopener noreferrer">
                                          <Download className="mr-2 h-4 w-4" />
                                          {cert.name}
                                        </a>
                                      </Button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No certificates uploaded</p>
                                  )}
                              </div>

                              {/* CPD Documents */}
                              <div className="mb-4">
                                <h5 className="font-medium mb-2">CPD Documents</h5>
                                {member.memberDocuments?.cpdDocuments && member.memberDocuments.cpdDocuments.length > 0 ? (
                                  <div className="space-y-2">
                                    {member.memberDocuments.cpdDocuments.map((cpd, index) => (
                                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                                        <div className="text-sm">
                                          <p className="font-medium">{cpd.title}</p>
                                          <p className="text-muted-foreground">Points: {cpd.points} | Date: {cpd.completion_date ? new Date(cpd.completion_date).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        {cpd.url ? (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                          >
                                            <a href={cpd.url} target="_blank" rel="noopener noreferrer">
                                              <Download className="mr-2 h-4 w-4" />
                                              Download
                                            </a>
                                          </Button>
                                        ) : (
                                          <span className="text-sm text-muted-foreground">No document file</span>
                                          )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No CPD documents uploaded</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openMailDialog([member.email])}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
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
