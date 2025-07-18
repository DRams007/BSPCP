import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Home, Sprout, Shield, Monitor, CheckCircle, Clock, FileText, HelpCircle } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Heart,
      title: 'Individual Therapy',
      description: 'One-on-one sessions for personal growth and mental health support',
      benefits: [
        'Personalized treatment approach',
        'Confidential environment',
        'Flexible scheduling',
        'Evidence-based therapies'
      ],
      conditions: ['Depression', 'Anxiety', 'Stress', 'Trauma', 'Grief', 'Life transitions'],
      duration: '45-60 minutes',
      frequency: 'Weekly or bi-weekly',
      color: 'bg-primary/10 text-primary'
    },
    {
      icon: Users,
      title: 'Couples Counselling',
      description: 'Relationship therapy to improve communication and strengthen bonds',
      benefits: [
        'Improved communication skills',
        'Conflict resolution techniques',
        'Stronger emotional connection',
        'Pre-marital preparation'
      ],
      conditions: ['Communication issues', 'Conflict', 'Intimacy problems', 'Trust issues', 'Pre-marriage'],
      duration: '60-90 minutes',
      frequency: 'Weekly sessions',
      color: 'bg-terracotta/10 text-terracotta'
    },
    {
      icon: Home,
      title: 'Family Therapy',
      description: 'Whole family approach to resolving conflicts and improving dynamics',
      benefits: [
        'Better family communication',
        'Conflict resolution',
        'Strengthened relationships',
        'Parenting support'
      ],
      conditions: ['Family conflicts', 'Parenting challenges', 'Blended families', 'Adolescent issues'],
      duration: '60-90 minutes',
      frequency: 'Weekly or bi-weekly',
      color: 'bg-dusty/10 text-dusty'
    },
    {
      icon: Sprout,
      title: 'Child & Adolescent Counselling',
      description: 'Specialized support for children and teenagers',
      benefits: [
        'Age-appropriate therapy',
        'Play therapy techniques',
        'Family involvement',
        'School coordination'
      ],
      conditions: ['Behavioral issues', 'Academic problems', 'Social anxiety', 'Developmental concerns'],
      duration: '45-60 minutes',
      frequency: 'Weekly sessions',
      color: 'bg-accent/10 text-accent'
    },
    {
      icon: Shield,
      title: 'Trauma & Crisis Support',
      description: 'Specialized care for trauma recovery and crisis intervention',
      benefits: [
        'Trauma-informed care',
        'Crisis intervention',
        'PTSD treatment',
        'Safety planning'
      ],
      conditions: ['PTSD', 'Trauma', 'Crisis situations', 'Emotional distress'],
      duration: '60-90 minutes',
      frequency: 'As needed',
      color: 'bg-primary/10 text-primary'
    },
    {
      icon: Monitor,
      title: 'Online Counselling',
      description: 'Convenient virtual sessions from the comfort of your home',
      benefits: [
        'Flexible scheduling',
        'Comfortable environment',
        'Access from anywhere',
        'Same quality care'
      ],
      conditions: ['All conditions', 'Remote access needed', 'Travel constraints', 'Convenience'],
      duration: '45-60 minutes',
      frequency: 'As per need',
      color: 'bg-secondary/10 text-secondary'
    }
  ];

  const therapeuticApproaches = [
    {
      name: 'Cognitive Behavioral Therapy (CBT)',
      description: 'Focuses on identifying and changing negative thought patterns and behaviors',
      bestFor: 'Depression, anxiety, phobias, OCD'
    },
    {
      name: 'Dialectical Behavior Therapy (DBT)',
      description: 'Skills-based approach for emotional regulation and interpersonal effectiveness',
      bestFor: 'Emotional dysregulation, BPD, self-harm'
    },
    {
      name: 'Humanistic/Person-Centered',
      description: 'Client-centered approach emphasizing empathy and unconditional positive regard',
      bestFor: 'Personal growth, self-esteem, life transitions'
    },
    {
      name: 'Family Systems Therapy',
      description: 'Addresses family dynamics and patterns affecting individual wellbeing',
      bestFor: 'Family conflicts, relationship issues, addiction'
    },
    {
      name: 'Trauma-Informed Therapy',
      description: 'Specialized approaches for processing traumatic experiences safely',
      bestFor: 'PTSD, childhood trauma, sexual assault'
    },
    {
      name: 'Solution-Focused Brief Therapy',
      description: 'Goal-oriented approach focusing on solutions rather than problems',
      bestFor: 'Specific goals, short-term issues, life coaching'
    }
  ];

  const faqs = [
    {
      question: 'How much does counselling cost?',
      answer: 'Session fees vary by counsellor and type of service, typically ranging from P350-P900 per session. Many counsellors offer sliding scale fees based on income.'
    },
    {
      question: 'How long does counselling take?',
      answer: 'The duration varies depending on individual needs. Some people benefit from short-term therapy (6-12 sessions), while others may need longer-term support.'
    },
    {
      question: 'Is counselling confidential?',
      answer: 'Yes, all sessions are strictly confidential. Information is only shared with your written consent, except in cases of immediate danger to yourself or others.'
    },
    {
      question: 'What\'s the difference between counselling and therapy?',
      answer: 'The terms are often used interchangeably. Both involve professional support for mental health and personal growth through evidence-based techniques.'
    },
    {
      question: 'How do I know if I need counselling?',
      answer: 'If you\'re struggling with persistent feelings, relationship issues, life transitions, or simply want personal growth, counselling can be beneficial.'
    },
    {
      question: 'What if I don\'t like my counsellor?',
      answer: 'It\'s important to feel comfortable with your counsellor. You can discuss concerns directly or request a different counsellor through BSPCP.'
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
              Professional Counselling Services
            </h1>
            <p className="font-source text-xl text-cream/90 max-w-3xl mx-auto">
              Comprehensive mental health support tailored to your unique needs. 
              Discover the right type of counselling for your journey to better wellbeing.
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Our Services
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              We offer a comprehensive range of mental health services to support individuals, 
              couples, and families on their wellness journey.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-soft transition-all duration-300 border-border/50 bg-card">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center`}>
                      <service.icon className="w-8 h-8" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">
                        {service.title}
                      </h3>
                      
                      <p className="font-source text-muted-foreground mb-4 leading-relaxed">
                        {service.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="font-source font-semibold text-sm text-foreground mb-2">Key Benefits:</h4>
                          <ul className="space-y-1">
                            {service.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-source font-semibold text-sm text-foreground mb-2">Common Conditions:</h4>
                          <div className="flex flex-wrap gap-1">
                            {service.conditions.slice(0, 4).map((condition, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                            {service.conditions.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{service.conditions.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{service.frequency}</span>
                        </div>
                      </div>
                      
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Find a Counsellor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Therapeutic Approaches */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Therapeutic Approaches
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Our counsellors use evidence-based therapeutic approaches tailored to your specific needs and goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {therapeuticApproaches.map((approach, index) => (
              <Card key={index} className="group hover:shadow-soft transition-all duration-300">
                <CardContent className="p-6">
                  <h3 className="font-poppins font-semibold text-lg text-foreground mb-3">
                    {approach.name}
                  </h3>
                  
                  <p className="font-source text-muted-foreground mb-4 leading-relaxed">
                    {approach.description}
                  </p>
                  
                  <div className="pt-4 border-t border-border">
                    <p className="font-source text-sm text-muted-foreground">
                      <strong>Best for:</strong> {approach.bestFor}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-6">
                Benefits of Professional Counselling
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                      Improved Mental Health
                    </h3>
                    <p className="font-source text-muted-foreground">
                      Reduce symptoms of depression, anxiety, and other mental health conditions 
                      through evidence-based treatment approaches.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-terracotta/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-terracotta" />
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                      Better Relationships
                    </h3>
                    <p className="font-source text-muted-foreground">
                      Develop healthier communication patterns and stronger connections 
                      with family, friends, and romantic partners.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-dusty/10 rounded-full flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-dusty" />
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                      Personal Growth
                    </h3>
                    <p className="font-source text-muted-foreground">
                      Develop self-awareness, build resilience, and learn valuable coping 
                      strategies for life's challenges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <h3 className="font-poppins font-semibold text-lg text-foreground mb-3">
                    Research-Based Results
                  </h3>
                  <ul className="space-y-2 font-source text-muted-foreground">
                    <li>• 80% of people show improvement within 8-12 sessions</li>
                    <li>• 75% reduction in symptoms of depression and anxiety</li>
                    <li>• 90% report better coping skills and life satisfaction</li>
                    <li>• Significant improvement in relationship quality</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-terracotta/20 bg-terracotta/5">
                <CardContent className="p-6">
                  <h3 className="font-poppins font-semibold text-lg text-foreground mb-3">
                    What to Expect
                  </h3>
                  <ul className="space-y-2 font-source text-muted-foreground">
                    <li>• Safe, confidential environment</li>
                    <li>• Collaborative treatment planning</li>
                    <li>• Regular progress monitoring</li>
                    <li>• Flexible scheduling options</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="font-source text-lg text-muted-foreground">
              Common questions about our counselling services and what to expect.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-soft transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-poppins font-semibold text-lg text-foreground mb-3">
                        {faq.question}
                      </h3>
                      <p className="font-source text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="font-source text-lg text-muted-foreground mb-8">
            Take the first step towards better mental health and wellbeing. 
            Our qualified counsellors are here to support you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              Find a Counsellor
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;