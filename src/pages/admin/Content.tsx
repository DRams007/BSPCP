import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  FileText, // Keep FileText for Total Content
  Globe,    // Keep Globe for Published
  Pencil,   // Use Pencil for Draft
} from "lucide-react"; // Removed Eye and Edit icons
import CreateContentForm from "@/components/admin/CreateContentForm";
import EditContentForm from "@/components/admin/EditContentForm";
import { toast } from "@/hooks/use-toast";
import ContentList from "@/components/admin/ContentList"; // Import ContentList

import * as z from 'zod'; // Import z for schema definition
import { contentFormSchema } from "@/components/admin/CreateContentForm"; // Import the schema

const Content = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contentStats, setContentStats] = useState({ total: 0, published: 0, draft: 0 });
  const [refreshContentListTrigger, setRefreshContentListTrigger] = useState(false);

  const fetchContentStats = async () => {
    try {
      const response = await fetch('/api/content-stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setContentStats(data);
    } catch (err: unknown) {
      let errorMessage = 'An unknown error occurred while fetching stats';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast({
        title: 'Error fetching content statistics',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchContentStats();
  }, []); // Fetch stats on component mount

  // Function to be passed to CreateContentForm to trigger re-fetch
  const handleContentCreated = () => {
    setIsCreateDialogOpen(false);
    fetchContentStats(); // Re-fetch stats after new content is created
    setRefreshContentListTrigger(prev => !prev); // Trigger ContentList refresh
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">
              Manage website content, news, events, and pages
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Content</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new content item for your website.
                </DialogDescription>
              </DialogHeader>
              <CreateContentForm
                onSubmit={handleContentCreated} // Use the new handler
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Changed to 3 columns */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contentStats.total}</div>
                  <p className="text-xs text-muted-foreground">Overall content count</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                  <Globe className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contentStats.published}</div>
                  <p className="text-xs text-muted-foreground">Live content items</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Draft</CardTitle>
                  <Pencil className="w-4 h-4 text-muted-foreground" /> {/* Changed icon to Pencil */}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contentStats.draft}</div>
                  <p className="text-xs text-muted-foreground">Content in progress</p>
                </CardContent>
              </Card>
            </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Content Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="News">News</SelectItem>
                  <SelectItem value="Event">Events</SelectItem>
                  <SelectItem value="Resource">Resources</SelectItem>
                  {/* Removed 'Page' as it's not present in sample data and adjusted casing */}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Integrate ContentList here */}
                <ContentList
                  searchQuery={searchQuery}
                  contentTypeFilter={contentTypeFilter}
                  statusFilter={statusFilter}
                  refreshTrigger={refreshContentListTrigger} // Pass the new trigger
                />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Content;
