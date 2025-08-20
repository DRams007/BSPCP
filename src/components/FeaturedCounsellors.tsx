import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import counselorThabo from '@/assets/counselor-thabo.jpg';
import counselorKefilwe from '@/assets/counselor-kefilwe.jpg';
import counselorMmoloki from '@/assets/counselor-mmoloki.jpg';
import counselorBoitumelo from '@/assets/counselor-boitumelo.jpg';

const FeaturedCounsellors = () => {
  const counsellors = [
    {
      name: 'Dr. Thabo Moeti',
      title: 'Clinical Psychologist',
      specialization: ['Anxiety & Depression', 'Trauma Therapy', 'Family Counselling'],
      location: 'Gaborone',
      experience: '12 years',
      rating: 4.9,
      reviews: 156,
      image: counselorThabo,
      availability: 'Available this week'
    },
    {
      name: 'Ms. Kefilwe Setlhare',
      title: 'Licensed Counsellor',
      specialization: ['Couples Therapy', 'Communication Skills', 'Relationship Issues'],
      location: 'Francistown',
      experience: '8 years',
      rating: 4.8,
      reviews: 92,
      image: counselorKefilwe,
      availability: 'Available next week'
    },
    {
      name: 'Dr. Mmoloki Segwai',
      title: 'Child Psychologist',
      specialization: ['Child Development', 'Behavioral Issues', 'Family Dynamics'],
      location: 'Maun',
      experience: '10 years',
      rating: 4.9,
      reviews: 134,
      image: counselorMmoloki,
      availability: 'Available this week'
    },
    {
      name: 'Ms. Boitumelo Kgathi',
      title: 'Mental Health Counsellor',
      specialization: ['Stress Management', 'Life Transitions', 'Career Counselling'],
      location: 'Kasane',
      experience: '6 years',
      rating: 4.7,
      reviews: 78,
      image: counselorBoitumelo,
      availability: 'Available tomorrow'
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
            Meet Our Compassionate Counsellors
          </h2>
          <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
            Our licensed professionals are here to support you with warmth, expertise, and understanding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {counsellors.map((counsellor, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-warm transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img 
                    src={counsellor.image} 
                    alt={counsellor.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {counsellor.experience}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-poppins font-semibold text-lg text-foreground mb-1">
                      {counsellor.name}
                    </h3>
                    <p className="font-source text-muted-foreground text-sm mb-2">
                      {counsellor.title}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{counsellor.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-sm">{counsellor.rating}</span>
                      <span className="text-xs text-muted-foreground">({counsellor.reviews} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {counsellor.specialization.slice(0, 2).map((spec, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {spec}
                        </Badge>
                      ))}
                      {counsellor.specialization.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{counsellor.specialization.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{counsellor.availability}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      View Profile
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      Book Now
                    </Button>
                  </div>
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
            asChild
          >
            <Link to="/find-counsellor#browse-all-counsellors">
              View All Counsellors
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCounsellors;
