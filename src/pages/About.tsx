import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Award, Heart, TrendingUp, Target, Eye, Shield, BookOpen, Calendar, FileText } from 'lucide-react';

const About = () => {
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

  const values = [
    {
      icon: Shield,
      title: 'Professional Excellence',
      description: 'We maintain the highest standards of professional practice and ethical conduct.'
    },
    {
      icon: Heart,
      title: 'Compassionate Care',
      description: 'Every individual deserves to be treated with dignity, respect, and empathy.'
    },
    {
      icon: Users,
      title: 'Accessibility',
      description: 'Mental health support should be available to all Batswana, regardless of background.'
    },
    {
      icon: BookOpen,
      title: 'Continuous Learning',
      description: 'We commit to ongoing professional development and evidence-based practice.'
    }
  ];

  const leadership = [
    {
      name: 'Dr. Sarah Molefi',
      position: 'President',
      credentials: 'PhD Clinical Psychology',
      experience: '20+ years',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'Mr. Thabo Kgosana',
      position: 'Vice President',
      credentials: 'MA Counselling Psychology',
      experience: '15+ years',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'Dr. Keitumetse Moloi',
      position: 'Secretary',
      credentials: 'PhD Social Work',
      experience: '12+ years',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'Ms. Boitumelo Seretse',
      position: 'Treasurer',
      credentials: 'MSc Psychology',
      experience: '10+ years',
      image: '/api/placeholder/200/200'
    }
  ];

  const milestones = [
    {
      year: '2009',
      title: 'BSPCP Founded',
      description: 'Established as a professional body for counsellors and psychotherapists'
    },
    {
      year: '2012',
      title: 'Legal Recognition',
      description: 'Formally registered under the Societies Act of Botswana'
    },
    {
      year: '2015',
      title: 'Expanded Services',
      description: 'Launched counsellor matching service and public directory'
    },
    {
      year: '2020',
      title: 'Digital Platform',
      description: 'Introduced online counselling and digital mental health resources'
    },
    {
      year: '2024',
      title: 'National Recognition',
      description: 'Recognized as the leading mental health professional body in Botswana'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-warm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-poppins font-bold text-4xl md:text-5xl mb-6">
              About BSPCP
            </h1>
            <p className="font-source text-xl text-cream/90 max-w-3xl mx-auto">
              Dedicated to promoting professional excellence in mental health services 
              and connecting Batswana with qualified, compassionate care.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-bold text-xl mb-4">Our Mission</h3>
                <p className="font-source text-muted-foreground leading-relaxed">
                  To promote professional excellence in mental health services and connect 
                  individuals with qualified counsellors and psychotherapists throughout Botswana.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-8 h-8 text-terracotta" />
                </div>
                <h3 className="font-poppins font-bold text-xl mb-4">Our Vision</h3>
                <p className="font-source text-muted-foreground leading-relaxed">
                  A Botswana where quality mental health support is accessible to all, 
                  and where seeking help is met with understanding and professional care.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-dusty/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-dusty" />
                </div>
                <h3 className="font-poppins font-bold text-xl mb-4">Our Values</h3>
                <p className="font-source text-muted-foreground leading-relaxed">
                  Professional excellence, compassionate care, accessibility, and continuous 
                  learning guide everything we do.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Our Impact
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Over the years, we've built a strong community of mental health professionals 
              dedicated to serving Botswana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center group hover:shadow-soft transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="font-poppins font-bold text-3xl text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="font-source font-semibold text-foreground mb-2">
                    {stat.label}
                  </div>
                  <p className="font-source text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide our work and shape how we serve our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="group hover:shadow-soft transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-poppins font-semibold text-xl text-foreground mb-2">
                        {value.title}
                      </h3>
                      <p className="font-source text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Leadership Team
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the experienced professionals who guide BSPCP's mission and vision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((leader, index) => (
              <Card key={index} className="group hover:shadow-soft transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={leader.image} 
                      alt={leader.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary/90 text-primary-foreground">
                        {leader.experience}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-poppins font-semibold text-lg text-foreground mb-1">
                      {leader.name}
                    </h3>
                    <p className="font-source text-primary font-medium mb-2">
                      {leader.position}
                    </p>
                    <p className="font-source text-sm text-muted-foreground">
                      {leader.credentials}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Our Journey
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              From humble beginnings to becoming Botswana's leading mental health professional body.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-border"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Card className="hover:shadow-soft transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="font-poppins font-bold text-2xl text-primary mb-2">
                          {milestone.year}
                        </div>
                        <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                          {milestone.title}
                        </h3>
                        <p className="font-source text-muted-foreground">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-4 h-4 bg-primary rounded-full border-4 border-background relative z-10"></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Professional Standards */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Professional Standards
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              We maintain the highest standards of professional practice and ethical conduct.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-4">Code of Ethics</h3>
                <p className="font-source text-muted-foreground mb-6">
                  All members adhere to our comprehensive code of ethics and professional standards.
                </p>
                <Button variant="outline">
                  View Code of Ethics
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8 text-terracotta" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-4">Continuing Education</h3>
                <p className="font-source text-muted-foreground mb-6">
                  Members commit to ongoing professional development and training requirements.
                </p>
                <Button variant="outline">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-dusty/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-dusty" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-4">Annual Reports</h3>
                <p className="font-source text-muted-foreground mb-6">
                  Transparent reporting on our activities, finances, and impact in the community.
                </p>
                <Button variant="outline">
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;