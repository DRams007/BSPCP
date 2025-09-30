import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sprout, CheckCircle, Clock, Calendar, Gamepad2, Book, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChildTeenSupport = () => {
  const navigate = useNavigate();
  const approaches = [
    'Play Therapy for Children',
    'Cognitive Behavioral Therapy for Teens',
    'Art and Expressive Therapies',
    'Family-Centered Approach',
    'Developmental Counselling'
  ];

  const issues = [
    'Behavioral Problems', 'Social Anxiety', 'Academic Stress', 'Bullying',
    'Family Changes', 'Emotional Regulation', 'Self-Esteem Issues', 'Peer Pressure'
  ];

  const benefits = [
    'Age-appropriate therapeutic techniques',
    'Safe space for expression and processing',
    'Development of healthy coping skills',
    'Improved emotional regulation',
    'Better family and peer relationships',
    'Enhanced self-esteem and confidence'
  ];

  const ageGroups = [
    {
      age: '6-12 Years',
      title: 'Children',
      description: 'Play-based therapy and creative approaches to help children express feelings and develop coping skills.',
      icon: Gamepad2,
      color: 'bg-accent/10 text-accent'
    },
    {
      age: '13-17 Years', 
      title: 'Teenagers',
      description: 'Talk therapy and skill-building approaches tailored to adolescent development and challenges.',
      icon: Book,
      color: 'bg-primary/10 text-primary'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-warm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Sprout className="w-8 h-8 text-white" />
                </div>
                <h1 className="font-poppins font-bold text-4xl md:text-5xl">
                  Child & Teen Support
                </h1>
              </div>
              <p className="font-source text-xl text-cream/90 mb-8 leading-relaxed">
                Specialized counselling services for children and teenagers, using age-appropriate 
                approaches to support healthy development and emotional wellbeing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-cream"
                  onClick={() => navigate('/find-counsellor')}
                >
                  Find a Child Counsellor
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">
                    Session Duration
                  </h3>
                  <p className="text-cream/90">45-60 minutes</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">
                    Frequency
                  </h3>
                  <p className="text-cream/90">Weekly sessions</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Age Groups */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Age-Appropriate Support
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Our approach is tailored to the developmental stage and unique needs of each child or teenager.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {ageGroups.map((group, index) => (
              <Card key={index} className="hover:shadow-soft transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 ${group.color} rounded-2xl flex items-center justify-center`}>
                      <group.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-poppins font-bold text-2xl text-foreground">
                        {group.title}
                      </h3>
                      <p className="font-source text-muted-foreground">{group.age}</p>
                    </div>
                  </div>
                  <p className="font-source text-muted-foreground leading-relaxed">
                    {group.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mb-12">
            <h3 className="font-poppins font-bold text-2xl text-foreground mb-4">
              Common Issues We Address
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {issues.map((issue, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-center py-3 px-4 text-sm font-medium"
              >
                {issue}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Approaches and Benefits */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                Our Therapeutic Approaches
              </h3>
              <p className="font-source text-muted-foreground mb-6">
                We use evidence-based, developmentally appropriate methods that engage children and teens:
              </p>
              <ul className="space-y-3">
                {approaches.map((approach, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="font-source text-foreground">{approach}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-8">
                <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                  Benefits for Your Child
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <p className="font-source text-muted-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Parent Support */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Support for Parents Too
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              We understand that supporting your child means supporting the whole family.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  Parent Consultation
                </h3>
                <p className="font-source text-muted-foreground">
                  Regular check-ins to discuss progress, strategies, and how to 
                  support your child at home.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Book className="w-8 h-8 text-terracotta" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  Educational Resources
                </h3>
                <p className="font-source text-muted-foreground">
                  Access to helpful resources about child development, parenting 
                  strategies, and mental health.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-dusty/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sprout className="w-8 h-8 text-dusty" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  Family Sessions
                </h3>
                <p className="font-source text-muted-foreground">
                  When appropriate, family sessions to improve communication 
                  and strengthen relationships.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-accent text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-6">
            Give Your Child the Support They Need
          </h2>
          <p className="font-source text-xl text-white/90 mb-8">
            Every child deserves to feel understood, supported, and equipped with healthy coping skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-accent hover:bg-cream"
            >
              Find a Child Counsellor
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-accent"
            >
              Schedule Initial Consultation
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ChildTeenSupport;
