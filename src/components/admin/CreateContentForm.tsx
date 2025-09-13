import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, FileText, Calendar, Globe, Image, MapPin, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// You'll need to install and import a date picker component
// For example, if using shadcn/ui date picker:
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const contentFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters'),
  type: z.enum(['News', 'Event', 'Resource']),
  status: z.enum(['Draft', 'Published']),
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required'),
  category: z.string().optional(), // Added category field
  location: z.string().optional(),
  eventDate: z.date().optional(),
  eventTime: z.string().nullable().optional(),
  metaDescription: z.string().max(160, 'Meta description must be under 160 characters').optional(),
  tags: z.string().optional(),
  featuredImage: z.instanceof(File).optional(), // Changed to z.instanceof(File) to correctly type the File object
}).superRefine((data, ctx) => {
  if (data.type === 'Resource') {
    if (!data.featuredImage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Resource item (image/pdf) is required for Resources',
        path: ['featuredImage'],
      });
    }
  }
});

type ContentFormData = z.infer<typeof contentFormSchema>;

interface CreateContentFormProps {
  onSubmit: (data: ContentFormData & { featuredImage?: string }) => void;
  onCancel: () => void;
}

const CreateContentForm = ({ onSubmit, onCancel }: CreateContentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null); // State to store the File object
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>(''); // State for image preview
  
  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: '',
      type: 'News',
      status: 'Draft',
      content: '',
      author: 'Admin',
      location: '',
      eventDate: undefined,
      eventTime: '',
      metaDescription: '',
      tags: '',
    }
  });

  const contentTypes = [
    { value: 'News', label: 'News Article', icon: FileText },
        { value: 'Event', label: 'Event', icon: Calendar },
    { value: 'Resource', label: 'Resource', icon: Image },
  ];

  const selectedType = form.watch('type');

  const handleSubmit = async (data: ContentFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      for (const key in data) {
        if (key === 'featuredImage') continue; // Skip featuredImage as it's appended separately
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') { // Added check for empty string
          if (key === 'eventDate' && data[key]) {
            formData.append(key, format(data[key], 'yyyy-MM-dd'));
          } else if (Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        } else if (data[key] === '') { // Explicitly send null for empty strings
          formData.append(key, ''); // Send empty string, backend will convert to NULL
        }
      }
      // Append the actual File object if it exists
      if (featuredImageFile) {
        formData.append('image', featuredImageFile); // 'image' must match the field name in multer
      }

      const response = await fetch('/api/content', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to create content: ${errorText}`);
      }

      const result = await response.json();
      onSubmit(result.content);
      toast({
        title: "Content Created",
        description: `${data.title} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: "Failed to create content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFeaturedImageFile(file); // Store the File object
      form.setValue('featuredImage', file); // Set the file in the form state for Zod validation
      const reader = new FileReader();
      reader.onload = (e) => {
        setFeaturedImagePreview(e.target?.result as string); // For preview
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{selectedType === 'Resource' ? 'Resource Title' : 'Title'}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter content title..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contentTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input placeholder="Author name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location field - full width */}
          {selectedType === 'Event' && (
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                    {selectedType !== 'Event' && (
                      <span className="text-xs text-muted-foreground">(optional)</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={
                        selectedType === 'Event' 
                          ? "Event venue or address" 
                          : "Location (if applicable)"
                      } 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Date and Time fields - side by side */}
          {selectedType === 'Event' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {selectedType === 'Event' ? 'Event Date' : 'Date'}
                      {selectedType !== 'Event' && (
                        <span className="text-xs text-muted-foreground">(optional)</span>
                      )}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>
                                {selectedType === 'Event' 
                                  ? "Select event date" 
                                  : "Pick a date (optional)"}
                              </span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        {/* Replace this with your actual date picker component */}
                        {/* For shadcn/ui, you would use the Calendar component here */}
                        <div className="p-3">
                          <input
                            type="date"
                            title="Select Date"
                            aria-label="Select Date"
                            onChange={(e) => {
                              const date = e.target.value ? new Date(e.target.value) : undefined;
                              field.onChange(date);
                            }}
                            value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                            className="w-full"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {selectedType === 'Event' ? 'Event Time' : 'Time'}
                      {selectedType !== 'Event' && (
                        <span className="text-xs text-muted-foreground">(optional)</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="time"
                        placeholder={
                          selectedType === 'Event' 
                            ? "Select event time" 
                            : "Select time (optional)"
                        } 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{selectedType === 'Resource' ? 'Description/Content' : 'Content'}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter your content here..."
                    className="min-h-32"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Featured Image Upload */}
          {(selectedType === 'News' || selectedType === 'Resource' || selectedType === 'Event') && (
            <div>
              <FormLabel>{selectedType === 'Resource' ? 'Resource Item (Image/PDF)' : 'Featured Image'}</FormLabel>
              <div className="mt-2">
                {featuredImagePreview ? (
                  <div className="relative">
                    {featuredImagePreview.startsWith('data:image') ? (
                      <img 
                        src={featuredImagePreview} 
                        alt="Featured" 
                        className="w-full h-40 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-md border">
                        <FileText className="w-12 h-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground ml-2">PDF Preview Not Available</p>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFeaturedImageFile(null);
                        setFeaturedImagePreview('');
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="featured-image" className="cursor-pointer">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center hover:border-muted-foreground/50 transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload {selectedType === 'Resource' ? 'resource (image/pdf)' : 'featured image'}
                      </p>
                    </div>
                    <input
                      id="featured-image"
                      type="file"
                      accept={selectedType === 'Resource' ? 'image/*,application/pdf' : 'image/*'}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {(selectedType === 'News' || selectedType === 'Resource' || selectedType === 'Event') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., mental health, awareness" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description (SEO)</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description for search engines" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Max 160 characters</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Content'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateContentForm;
