import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Award, Heart, TrendingUp } from 'lucide-react';

const AboutSection = () => {
  const stats = [
    {
      icon: Users,
      value: '250+',
      label: 'Registered Members',
      description: 'Licensed professionals across Botswana'
    },
    {
      icon: Award,
      value: '15+',
      label: 'Years Serving',
      description: 'Dedicated to mental health excellence'
    },
    {
      icon: Heart,
      value: '10,000+',
      label: 'Lives Touched',
      description: 'People supported on their journey'
    },
    {
      icon: TrendingUp,
      value: '95%',
      label: 'Satisfaction Rate',
      description: 'Client-reported positive outcomes'
    }
  ];

  return (
    <section className="py-20 bg-gradient-gentle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-6">
              About BSPCP
            </h2>
            <p className="font-source text-lg text-muted-foreground mb-6 leading-relaxed">
              The Botswana Society for Professional Counsellors & Psychotherapists (BSPCP) is 
              dedicated to promoting professional excellence in mental health services throughout Botswana.
            </p>
            <p className="font-source text-lg text-muted-foreground mb-8 leading-relaxed">
              We connect individuals, couples, and families with qualified mental health professionals 
              who provide compassionate, evidence-based care. Our mission is to make quality mental 
              health support accessible to all Batswana.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              Learn More About Us
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center group hover:shadow-soft transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="font-poppins font-bold text-2xl text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="font-source font-semibold text-sm text-foreground mb-2">
                    {stat.label}
                  </div>
                  <p className="font-source text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;