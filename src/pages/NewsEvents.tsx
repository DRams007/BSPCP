
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Clock, ArrowRight, MapPin, Users, Search, FileText, Download } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: 'News' | 'Event' | 'Resource';
  status: string;
  content: string;
  author: string;
  location?: string;
  event_date?: string;
  event_time?: string;
  meta_description?: string;
  tags?: string;
  featured_image_path?: string;
  created_at: string;
}

const NewsEvents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/public-content`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ContentItem[] = await response.json();
        setContentItems(data);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFullImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/placeholder.svg';
    const baseUrl = import.meta.env.VITE_API_URL; // Ensure this matches your backend server URL

    // Normalize path to use forward slashes for consistency
    const normalizedPath = imagePath.replace(/\\/g, '/');

    // Always extract the filename and serve from the /uploads endpoint
    const filename = normalizedPath.split('/').pop();
    return `${baseUrl}/uploads/${filename}`;
  };

  const allCategories = Array.from(new Set(contentItems.flatMap(item => item.tags ? item.tags.split(',') : [])))
    .map(tag => tag.trim())
    .filter(tag => tag !== '');
  const categories = ['all', ...allCategories];

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.meta_description && item.meta_description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || (item.tags && item.tags.includes(selectedCategory));
    const isPublished = item.status === 'Published';
    return matchesSearch && matchesCategory && isPublished;
  });

  const uniqueContentTypes = Array.from(new Set(filteredContent.map(item => item.type)));

  // Define preferred tab order: Events, News, Resources
  const preferredOrder = ['Event', 'News', 'Resource'];
  const orderedContentTypes = uniqueContentTypes.slice().sort((a, b) => {
    const indexA = preferredOrder.indexOf(a);
    const indexB = preferredOrder.indexOf(b);
    // If both types are in the preferred order, sort by that order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only one is in the preferred order, prioritize it
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // If neither is in the preferred order, maintain original order
    return 0;
  });

  const isPdf = (path?: string) => {
    if (!path) return false;
    const filename = path.toLowerCase();
    return filename.endsWith('.pdf');
  };

  const getFileName = (path?: string) => {
    if (!path) return '';
    const normalizedPath = path.replace(/\\/g, '/');
    return normalizedPath.split('/').pop() || '';
  };

  const handleDownload = (item: ContentItem) => {
    if (item.featured_image_path) {
      const downloadUrl = getFullImageUrl(item.featured_image_path);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = getFileName(item.featured_image_path);

      // For PDFs, we open in new tab instead of downloading
      if (isPdf(item.featured_image_path)) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReadMore = (item: ContentItem) => {
    setSelectedContent(item);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-poppins font-bold text-4xl md:text-5xl text-foreground mb-6">
            News & Events
          </h1>
      <p className="font-source text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Stay updated with the latest news from BSPCP, upcoming events, and access complimentary resources in the mental health community.
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search news, events, and resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Select category"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue={orderedContentTypes[0] || "news"} className="w-full">
            <TabsList className={`grid w-full mb-12 ${orderedContentTypes.length === 2 ? 'grid-cols-2' : orderedContentTypes.length === 3 ? 'grid-cols-3' : 'grid-cols-1'}`}>
              {orderedContentTypes.map(type => (
                <TabsTrigger key={type} value={type}>
                  {type === 'Event' ? 'Upcoming Events' : type === 'News' ? 'Latest News' : type}
                </TabsTrigger>
              ))}
            </TabsList>

            {orderedContentTypes.map(type => (
              <TabsContent key={type} value={type}>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">Loading {type.toLowerCase()}...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 text-lg">{error}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredContent.filter(item => item.type === type).map((item) => (
                      <Card
                        key={item.id}
                        className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card overflow-hidden"
                      >
                        <CardContent className="p-0">
                          {item.type !== 'Resource' ? (
                            <div className="relative">
                              <img
                                src={getFullImageUrl(item.featured_image_path)}
                                alt={item.title}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-primary/90 text-primary-foreground">
                                  {item.tags?.split(',')[0].trim()}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 h-48 flex items-center justify-center">
                              {item.featured_image_path && isPdf(item.featured_image_path) ? (
                                <div className="text-center">
                                  <FileText className="w-16 h-16 text-primary mx-auto mb-2" />
                                  <p className="font-poppins font-medium text-primary text-sm">
                                    {getFileName(item.featured_image_path)}
                                  </p>
                                </div>
                              ) : (
                                <img
                                  src={getFullImageUrl(item.featured_image_path)}
                                  alt={item.title}
                                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              )}
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-primary/90 text-primary-foreground">
                                  {item.tags?.split(',')[0].trim()}
                                </Badge>
                              </div>
                            </div>
                          )}

                          <div className="p-6">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(item.type === 'Event' ? item.event_date : item.created_at)}</span>
                              </div>
                              {item.type === 'Event' && item.event_time && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{item.event_time}</span>
                                </div>
                              )}
                            </div>

                            <h3 className="font-poppins font-semibold text-lg text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                              {item.title}
                            </h3>

                            <p className="font-source text-muted-foreground mb-4 leading-relaxed">
                              {item.meta_description || item.content.substring(0, 150) + '...'}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">By {item.author}</span>
                              {item.type === 'Resource' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="font-source font-medium border-primary text-primary hover:bg-primary hover:text-primary-foreground group-hover:gap-1 transition-all duration-300"
                                  onClick={() => handleDownload(item)}
                                >
                                  <Download className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform duration-300" />
                                  {isPdf(item.featured_image_path) ? 'Open PDF' : 'Download'}
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-auto font-source font-medium text-primary hover:text-primary/80 group-hover:gap-2 transition-all duration-300"
                                  onClick={() => handleReadMore(item)}
                                >
                                  {item.type === 'Event' ? 'View Details' : 'Read More'}
                                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {filteredContent.filter(item => item.type === type).length === 0 && !loading && !error && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No {type.toLowerCase()} found matching your criteria.</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <Footer />

      {/* Content Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins text-2xl">{selectedContent?.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedContent?.meta_description}
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <div className="py-4 space-y-4">
              {selectedContent.type === 'Resource' && selectedContent.featured_image_path && isPdf(selectedContent.featured_image_path) ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="font-medium">{getFileName(selectedContent.featured_image_path)}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(selectedContent)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                  <div className="border rounded">
                    <iframe
                      src={`${getFullImageUrl(selectedContent.featured_image_path)}`}
                      className="w-full h-96 border-0"
                      title="PDF Viewer"
                    />
                  </div>
                </div>
              ) : selectedContent.featured_image_path ? (
                <img
                  src={getFullImageUrl(selectedContent.featured_image_path)}
                  alt={selectedContent.title}
                  className="w-full h-auto object-contain rounded-lg"
                />
              ) : null}

              {selectedContent.type === 'Resource' && !isPdf(selectedContent.featured_image_path) && selectedContent.featured_image_path && (
                <div className="flex justify-center">
                  <Button variant="outline" size="lg" onClick={() => handleDownload(selectedContent)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Resource
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedContent.type === 'Event' ? selectedContent.event_date : selectedContent.created_at)}</span>
                </div>
                {selectedContent.type === 'Event' && selectedContent.event_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{selectedContent.event_time}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>By {selectedContent.author}</span>
                </div>
                {selectedContent.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedContent.location}</span>
                  </div>
                )}
                {selectedContent.type === 'Resource' && selectedContent.featured_image_path && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{isPdf(selectedContent.featured_image_path) ? 'PDF Document' : 'Resource File'}</span>
                  </div>
                )}
              </div>
              {selectedContent.tags && (
                <div className="flex flex-wrap gap-2">
                  {selectedContent.tags.split(',').map(tag => (
                    <Badge key={tag.trim()} variant="secondary">{tag.trim()}</Badge>
                  ))}
                </div>
              )}
              <div className="prose prose-lg max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: selectedContent.content }} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsEvents;
