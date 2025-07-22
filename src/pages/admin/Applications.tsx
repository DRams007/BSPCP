import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
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
  GraduationCap
} from "lucide-react";

const Applications = () => {
  const { toast } = useToast();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [reviewComment, setReviewComment] = useState("");
  
  // Mock applications data
  const applications = [
    {
      id: 1,
      name: "Dr. Patricia Wilson",
      email: "p.wilson@email.com",
      phone: "+267 75123456",
      nationality: "Botswana",
      occupation: "Clinical Psychologist",
      organization: "Riverside Mental Health",
      qualification: "PhD Clinical Psychology",
      experience: "8 years",
      submittedDate: "2024-01-28",
      status: "pending",
      documents: [
        { name: "Degree Certificate", uploaded: true },
        { name: "Professional License", uploaded: true },
        { name: "CV/Resume", uploaded: true },
        { name: "References", uploaded: false }
      ],
      personalInfo: {
        dateOfBirth: "1985-03-15",
        idNumber: "850315001234",
        physicalAddress: "Plot 123, Gaborone West",
        postalAddress: "P.O. Box 456, Gaborone"
      }
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "+267 76234567",
      nationality: "Brazil",
      occupation: "Counselling Psychologist", 
      organization: "Hope Counselling Services",
      qualification: "MSc Counselling Psychology",
      experience: "5 years",
      submittedDate: "2024-01-30",
      status: "under_review",
      documents: [
        { name: "Degree Certificate", uploaded: true },
        { name: "Professional License", uploaded: true },
        { name: "CV/Resume", uploaded: true },
        { name: "References", uploaded: true }
      ],
      personalInfo: {
        dateOfBirth: "1988-07-22",
        idNumber: "880722005678", 
        physicalAddress: "Block 5, Broadhurst",
        postalAddress: "P.O. Box 789, Gaborone"
      }
    },
    {
      id: 3,
      name: "John Maruping",
      email: "j.maruping@email.com",
      phone: "+267 77345678",
      nationality: "Botswana",
      occupation: "Substance Abuse Counsellor",
      organization: "Addiction Recovery Center",
      qualification: "BSc Psychology + Addiction Counselling Cert",
      experience: "3 years",
      submittedDate: "2024-02-02",
      status: "pending",
      documents: [
        { name: "Degree Certificate", uploaded: true },
        { name: "Professional License", uploaded: false },
        { name: "CV/Resume", uploaded: true },
        { name: "References", uploaded: true }
      ],
      personalInfo: {
        dateOfBirth: "1990-11-08",
        idNumber: "901108009876",
        physicalAddress: "Extension 12, Francistown",
        postalAddress: "P.O. Box 321, Francistown"
      }
    }
  ];

  const handleApprove = (applicationId: number) => {
    toast({
      title: "Application Approved",
      description: "The membership application has been approved successfully.",
    });
    // Here you would update the application status in your backend
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
    
    toast({
      title: "Application Rejected",
      description: "The application has been rejected with feedback.",
    });
    setReviewComment("");
    // Here you would update the application status in your backend
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
                  <TableHead>Qualification & Experience</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
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
                      <Badge className={getStatusColor(application.status)}>
                        <span className="mr-1">{getStatusIcon(application.status)}</span>
                        {application.status.replace('_', ' ').charAt(0).toUpperCase() + application.status.replace('_', ' ').slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(application.submittedDate).toLocaleDateString()}
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
                                    <div><strong>Nationality:</strong> {selectedApplication.nationality}</div>
                                    <div><strong>Date of Birth:</strong> {selectedApplication.personalInfo.dateOfBirth}</div>
                                    <div><strong>ID Number:</strong> {selectedApplication.personalInfo.idNumber}</div>
                                    <div><strong>Physical Address:</strong> {selectedApplication.personalInfo.physicalAddress}</div>
                                    <div><strong>Postal Address:</strong> {selectedApplication.personalInfo.postalAddress}</div>
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
                                            <Button variant="outline" size="sm">
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
                                    <div className="flex gap-3">
                                      <Button 
                                        onClick={() => handleApprove(selectedApplication.id)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Check className="w-4 h-4 mr-2" />
                                        Approve Application
                                      </Button>
                                      <Button 
                                        variant="destructive"
                                        onClick={() => handleReject(selectedApplication.id)}
                                      >
                                        <X className="w-4 h-4 mr-2" />
                                        Reject Application
                                      </Button>
                                      <Button variant="outline">
                                        Request More Info
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
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {applications.filter(app => app.status === 'under_review').length}
              </div>
              <p className="text-sm text-muted-foreground">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'approved').length}
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
      </div>
    </AdminLayout>
  );
};

export default Applications;