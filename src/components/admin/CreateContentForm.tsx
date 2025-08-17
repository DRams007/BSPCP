import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileText, Calendar, Globe, Image } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const contentFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters'),
  type: z.enum(['News', 'Event', 'Page', 'Resource']),
  status: z.enum(['Draft', 'Published']),
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required'),
  metaDescription: z.string().max(160, 'Meta description must be under 160 characters').optional(),
  tags: z.string().optional(),
});

type ContentFormData = z.infer<typeof contentFormSchema>;

interface CreateContentFormProps {
  onSubmit: (data: ContentFormData & { featuredImage?: string }) => void;
  onCancel: () => void;
}

const CreateContentForm = ({ onSubmit, onCancel }: CreateContentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string>('');
  
  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: '',
      type: 'News',
      status: 'Draft',
      content: '',
      author: 'Admin',
      metaDescription: '',
      tags: '',
    }
  });

  const contentTypes = [
    { value: 'News', label: 'News Article', icon: FileText },
    { value: 'Event', label: 'Event', icon: Calendar },
    { value: 'Page', label: 'Static Page', icon: Globe },
    { value: 'Resource', label: 'Resource', icon: Image },
  ];

  const handleSubmit = async (data: ContentFormData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSubmit({ ...data, featuredImage });
      toast({
        title: "Content Created",
        description: `${data.title} has been created successfully.`,
      });
    } catch (error) {
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
      const reader = new FileReader();
      reader.onload = (e) => {
        setFeaturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Content</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
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

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
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
          <div>
            <FormLabel>Featured Image</FormLabel>
            <div className="mt-2">
              {featuredImage ? (
                <div className="relative">
                  <img 
                    src={featuredImage} 
                    alt="Featured" 
                    className="w-full h-40 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFeaturedImage('')}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label htmlFor="featured-image" className="cursor-pointer">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center hover:border-muted-foreground/50 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload featured image
                    </p>
                  </div>
                  <input
                    id="featured-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

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