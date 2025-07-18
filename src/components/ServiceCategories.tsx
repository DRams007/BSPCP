import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, Home, Sprout, Shield, Monitor } from 'lucide-react';

const ServiceCategories = () => {
  const services = [
    {
      icon: Heart,
      title: 'Feeling Overwhelmed',
      description: 'Individual support for anxiety, depression, and life transitions',
      color: 'bg-primary/10 text-primary',
      href: '/services/individual'
    },
    {
      icon: Users,
      title: 'Relationship Challenges',
      description: 'Couples counselling for communication and connection',
      color: 'bg-terracotta/10 text-terracotta',
      href: '/services/couples'
    },
    {
      icon: Home,
      title: 'Family Conflicts',
      description: 'Family therapy to strengthen bonds and resolve issues',
      color: 'bg-dusty/10 text-dusty',
      href: '/services/family'
    },
    {
      icon: Sprout,
      title: 'Child & Teen Support',
      description: 'Specialized care for young people and adolescents',
      color: 'bg-accent/10 text-accent',
      href: '/services/youth'
    },
    {
      icon: Shield,
      title: 'Trauma & Crisis',
      description: 'Professional support for trauma recovery and crisis situations',
      color: 'bg-primary/10 text-primary',
      href: '/services/trauma'
    },
    {
      icon: Monitor,
      title: 'Online Counselling',
      description: 'Convenient virtual sessions from the comfort of your home',
      color: 'bg-secondary/10 text-secondary',
      href: '/services/online'
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
            What brings you here today?
          </h2>
          <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the area where you'd like support. We'll help you find the right counsellor for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card"
            >
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-8 h-8" />
                </div>
                
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">
                  {service.title}
                </h3>
                
                <p className="font-source text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;