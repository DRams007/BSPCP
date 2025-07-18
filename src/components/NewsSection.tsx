import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

const NewsSection = () => {
  const newsItems = [
    {
      title: 'New Mental Health Awareness Campaign Launched',
      excerpt: 'BSPCP partners with local communities to raise awareness about mental health and reduce stigma across Botswana.',
      category: 'Community Outreach',
      date: '2024-01-15',
      readTime: '3 min read',
      image: '/api/placeholder/300/200'
    },
    {
      title: 'Annual Conference on Trauma-Informed Care',
      excerpt: 'Join us for our annual conference focusing on trauma-informed approaches to mental health care in African contexts.',
      category: 'Events',
      date: '2024-01-10',
      readTime: '2 min read',
      image: '/api/placeholder/300/200'
    },
    {
      title: 'Research: Mental Health in Rural Communities',
      excerpt: 'New study reveals important insights about mental health needs and barriers in rural areas of Botswana.',
      category: 'Research',
      date: '2024-01-05',
      readTime: '5 min read',
      image: '/api/placeholder/300/200'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
            Latest News & Updates
          </h2>
          <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed about the latest developments in mental health care and BSPCP initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary/90 text-primary-foreground">
                      {item.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{item.readTime}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-poppins font-semibold text-lg text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  <p className="font-source text-muted-foreground mb-4 leading-relaxed">
                    {item.excerpt}
                  </p>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto font-source font-medium text-primary hover:text-primary/80 group-hover:gap-2 transition-all duration-300"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8"
          >
            View All News
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;