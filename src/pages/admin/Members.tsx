import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Filter, Eye, Edit, MoreVertical, Download } from "lucide-react";

const Members = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Mock data - replace with real data
  const members = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@email.com",
      membershipId: "BSPCP-2024-001",
      status: "active",
      joinDate: "2024-01-15",
      qualification: "PhD Clinical Psychology",
      organization: "Mindful Therapy Center",
      nationality: "Botswana",
      occupation: "Clinical Psychologist",
      phone: "+267 71234567"
    },
    {
      id: 2,
      name: "Dr. Michael Brown",
      email: "m.brown@email.com",
      membershipId: "BSPCP-2024-002",
      status: "active",
      joinDate: "2024-01-20",
      qualification: "MSc Counselling Psychology",
      organization: "Healing Hearts Clinic",
      nationality: "South Africa",
      occupation: "Counselling Psychologist",
      phone: "+267 72345678"
    },
    {
      id: 3,
      name: "Lisa Williams",
      email: "lisa.williams@email.com",
      membershipId: "BSPCP-2024-003",
      status: "pending",
      joinDate: "2024-02-01",
      qualification: "BA Psychology Honours",
      organization: "Community Wellness Center",
      nationality: "Botswana",
      occupation: "Counsellor",
      phone: "+267 73456789"
    },
    {
      id: 4,
      name: "Dr. James Miller",
      email: "james.miller@email.com",
      membershipId: "BSPCP-2024-004",
      status: "suspended",
      joinDate: "2023-11-10",
      qualification: "PhD Psychotherapy",
      organization: "Private Practice",
      nationality: "UK",
      occupation: "Psychotherapist",
      phone: "+267 74567890"
    }
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.membershipId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Members Management</h1>
            <p className="text-muted-foreground">Manage BSPCP member accounts and profiles</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Members List ({filteredMembers.length})</CardTitle>
            <CardDescription>
              All registered members and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Details</TableHead>
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
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">{member.phone}</p>
                      </div>
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
                      <Badge className={getStatusColor(member.status)}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(member.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Member Details</DialogTitle>
                              <DialogDescription>
                                Complete profile information for {member.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div>
                                <h4 className="font-semibold mb-2">Personal Information</h4>
                                <div className="space-y-2 text-sm">
                                  <p><strong>Name:</strong> {member.name}</p>
                                  <p><strong>Email:</strong> {member.email}</p>
                                  <p><strong>Phone:</strong> {member.phone}</p>
                                  <p><strong>Nationality:</strong> {member.nationality}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Professional Information</h4>
                                <div className="space-y-2 text-sm">
                                  <p><strong>Qualification:</strong> {member.qualification}</p>
                                  <p><strong>Organization:</strong> {member.organization}</p>
                                  <p><strong>Occupation:</strong> {member.occupation}</p>
                                  <p><strong>Member ID:</strong> {member.membershipId}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {members.filter(m => m.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {members.filter(m => m.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {members.filter(m => m.status === 'suspended').length}
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
      </div>
    </AdminLayout>
  );
};

export default Members;