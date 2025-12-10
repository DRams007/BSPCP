import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Check, X, Edit, FileEdit, ArrowUp, ArrowDown } from 'lucide-react'; // Import Edit and FileEdit icons
import { toast } from '@/hooks/use-toast';
import { useMemo } from 'react'; // Import useMemo
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Import Dialog components

interface ContentItem {
  id: number;
  title: string;
  type: "News" | "Event" | "Page" | "Resource";
  status: "Draft" | "Published";
  author: string;
  created_at: string;
  featured_image_path?: string;
  content?: string;
  location?: string;
  eventDate?: string; // Keep as string for API response
  eventTime?: string;
  metaDescription?: string;
  tags?: string;
}

interface ContentListProps {
  searchQuery: string;
  contentTypeFilter: string;
  statusFilter: string;
  refreshTrigger: boolean; // New prop to trigger refresh
}

const ContentList = ({ searchQuery, contentTypeFilter, statusFilter, refreshTrigger }: ContentListProps) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof ContentItem>('created_at'); // Default sort by created_at
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // Default sort descending

  const sortedContent = useMemo(() => {
    if (!content) return [];

    const dateColumns = ['created_at', 'eventDate'];

    return [...content].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

      if (dateColumns.includes(sortColumn as string) && typeof aValue === 'string' && typeof bValue === 'string') {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
        const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        // Fallback for other types or mixed types
        const strA = String(aValue);
        const strB = String(bValue);
        return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }
    });
  }, [content, sortColumn, sortDirection]);

  const fetchContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (contentTypeFilter !== 'all') params.append('type', contentTypeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/content?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setContent(data);
    } catch (err: unknown) {
      let errorMessage = 'An unknown error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast({
        title: 'Error fetching content',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [searchQuery, contentTypeFilter, statusFilter, refreshTrigger]);

  const handleDeleteContent = async (id: number) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/content/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete content: ${response.statusText}`);
      }

      setContent(prevContent => prevContent.filter(item => item.id !== id));

      toast({
        title: 'Content Deleted',
        description: 'The content item has been successfully deleted.',
      });
    } catch (err: unknown) {
      let errorMessage = 'Failed to delete content.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublishStatus = async (id: number, currentStatus: string) => {
    setIsLoading(true);
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/content/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }

      setContent(prevContent =>
        prevContent.map(item =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );

      toast({
        title: 'Status Updated',
        description: `Content status changed to ${newStatus}.`,
      });
    } catch (err: unknown) {
      let errorMessage = 'Failed to update content status.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: keyof ContentItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc'); // Default to ascending when changing column
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading content...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Content</CardTitle>
      </CardHeader>
      <CardContent>
        {content.length === 0 ? (
          <p>No content found. Start by creating a new piece of content.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">
                  <Button variant="ghost" onClick={() => handleSort('title')}>
                    Title
                    {sortColumn === 'title' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('content')}>
                    Content
                    {sortColumn === 'content' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('type')}>
                    Type
                    {sortColumn === 'type' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('status')}>
                    Status
                    {sortColumn === 'status' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('author')}>
                    Author
                    {sortColumn === 'author' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('created_at')}>
                    Created At
                    {sortColumn === 'created_at' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-[150px] truncate">{item.title}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{item.content}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.author}</TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Badge
                        variant={item.status === 'Published' ? 'default' : 'secondary'}
                        className={item.status === 'Published' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-orange-100 text-orange-800 border-orange-300'}
                      >
                        {item.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={item.status === 'Published' ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'}
                        onClick={() => handleTogglePublishStatus(item.id, item.status)}
                        disabled={isLoading}
                      >
                        {item.status === 'Published' ? (
                          <FileEdit className="h-4 w-4" /> // Changed from X to FileEdit
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              content item and remove its data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteContent(item.id)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentList;
