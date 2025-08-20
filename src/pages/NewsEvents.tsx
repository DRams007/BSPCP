
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, ArrowRight, MapPin, Users, Search } from 'lucide-react';

const NewsEvents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const newsItems = [
    {
      id: 1,
      title: 'New Mental Health Awareness Campaign Launched',
      excerpt: 'BSPCP partners with local communities to raise awareness about mental health and reduce stigma across Botswana.',
      content: 'The Botswana Society of Professional Counselling and Psychotherapy (BSPCP) has launched a comprehensive mental health awareness campaign aimed at reducing stigma and promoting understanding of mental health issues across Botswana...',
      category: 'Community Outreach',
      date: '2024-01-15',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'BSPCP Communications Team'
    },
    {
      id: 2,
      title: 'Research: Mental Health in Rural Communities',
      excerpt: 'New study reveals important insights about mental health needs and barriers in rural areas of Botswana.',
      content: 'A groundbreaking research study conducted by BSPCP members has revealed critical insights into the mental health landscape of rural Botswana communities...',
      category: 'Research',
      date: '2024-01-05',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Dr. Sarah Molefe'
    },
    {
      id: 3,
      title: 'BSPCP Welcomes New Board Members',
      excerpt: 'Three distinguished professionals join the BSPCP board to strengthen mental health advocacy in Botswana.',
      content: 'The Botswana Society of Professional Counselling and Psychotherapy is pleased to announce the appointment of three new board members...',
      category: 'Announcements',
      date: '2023-12-20',
      readTime: '2 min read',
      image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'BSPCP Board'
    }
  ];

  const upcomingEvents = [
    {
      id: 4,
      title: 'First Annual BSPCP Conference',
      description: 'Join us for the First Annual BSPCP Conference focusing on transforming lives and enhancing mental wellbeing, resilience, and hope through counselling and psychotherapy.',
      date: '2025-09-05',
      time: '08:30 AM onwards',
      location: 'Shasha Convention Center, Tlokweng',
      category: 'Conference',
      attendees: 'Professional Counsellors, Psychotherapists, Mental health advocates, and other related parties',
      price: 'Members: P400, Nonmembers: P500, Students: P150, Stall & Exhibition Space: P1000 per stall (Breakfast & Lunch Inclusive)',
      image: '/lovable-uploads/First_Annual_BSPCP.jpg'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const categories = ['all', 'Community Outreach', 'Research', 'Announcements', 'Conference', 'Workshop', 'Outreach'];

  const filteredNews = newsItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredEvents = upcomingEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            Stay updated with the latest news from BSPCP and upcoming events in the mental health community.
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search news and events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-12">
              <TabsTrigger value="events">Upcoming Events</TabsTrigger>
              <TabsTrigger value="news">Latest News</TabsTrigger>
            </TabsList>

            {/* News Tab */}
            <TabsContent value="news">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNews.map((item) => (
                  <Card 
                    key={item.id} 
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
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">By {item.author}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-0 h-auto font-source font-medium text-primary hover:text-primary/80 group-hover:gap-2 transition-all duration-300"
                          >
                            Read More
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredNews.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No news articles found matching your criteria.</p>
                </div>
              )}
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              {filteredEvents.length > 0 ? (
                <div className="flex flex-col md:flex-row gap-8 items-center bg-card border border-border/50 rounded-lg overflow-hidden shadow-soft">
                  <div className="md:w-1/2">
                    <img 
                      src={filteredEvents[0].image} 
                      alt={filteredEvents[0].title}
                      className="w-full h-full object-cover max-h-96 md:max-h-full"
                    />
                  </div>
                  <div className="md:w-1/2 p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(filteredEvents[0].date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{filteredEvents[0].time}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-poppins font-bold text-2xl text-foreground mb-3">
                      {filteredEvents[0].title}
                    </h3>
                    
                    <p className="font-source text-muted-foreground mb-4 leading-relaxed">
                      {filteredEvents[0].description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{filteredEvents[0].location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{filteredEvents[0].attendees} expected attendees</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="bg-background/90 text-foreground">
                          {filteredEvents[0].price}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      Register Now
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No upcoming events found matching your criteria.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsEvents;
