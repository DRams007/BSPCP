import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, Clock, Calendar, MessageCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CouplesCounselling = () => {
  const navigate = useNavigate();
  const approaches = [
    'Emotionally Focused Therapy (EFT)',
    'Gottman Method Couples Therapy',
    'Cognitive Behavioral Couples Therapy',
    'Imago Relationship Therapy',
    'Solution-Focused Couples Therapy'
  ];

  const issues = [
    'Communication Problems', 'Trust Issues', 'Intimacy Concerns', 'Conflict Resolution',
    'Pre-Marriage Preparation', 'Infidelity Recovery', 'Blended Family Challenges', 'Financial Stress'
  ];

  const benefits = [
    'Improved communication and listening skills',
    'Effective conflict resolution techniques',
    'Strengthened emotional connection and intimacy',
    'Better understanding of relationship dynamics',
    'Tools for maintaining a healthy relationship',
    'Support for major life transitions together'
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
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="font-poppins font-bold text-4xl md:text-5xl">
                  Couples Counselling
                </h1>
              </div>
              <p className="font-source text-xl text-cream/90 mb-8 leading-relaxed">
                Strengthen your relationship through professional couples therapy. Work together 
                to improve communication, resolve conflicts, and build a stronger emotional connection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-cream"
                  onClick={() => navigate('/find-counsellor')}
                >
                  Find a Couples Counsellor
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
                  <p className="text-cream/90">60-90 minutes</p>
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

      {/* Common Issues */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Common Relationship Challenges
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Every relationship faces challenges. We're here to help you work through them together.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                How Couples Counselling Helps
              </h3>
              <p className="font-source text-muted-foreground mb-6">
                Our evidence-based approaches help couples develop stronger, healthier relationships:
              </p>
              <ul className="space-y-3">
                {approaches.map((approach, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-terracotta rounded-full"></div>
                    <span className="font-source text-foreground">{approach}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="border-terracotta/20 bg-terracotta/5">
              <CardContent className="p-8">
                <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                  What You'll Gain
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-terracotta mt-0.5 flex-shrink-0" />
                      <p className="font-source text-muted-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Our Couples Counselling Process
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              A structured approach to help you rebuild and strengthen your relationship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-terracotta" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  1. Assessment & Goal Setting
                </h3>
                <p className="font-source text-muted-foreground">
                  Understand your relationship dynamics, identify areas for improvement, 
                  and set clear goals together.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  2. Skill Building
                </h3>
                <p className="font-source text-muted-foreground">
                  Learn effective communication techniques, conflict resolution skills, 
                  and emotional regulation strategies.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-dusty/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-dusty" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  3. Relationship Strengthening
                </h3>
                <p className="font-source text-muted-foreground">
                  Practice new skills, rebuild trust and intimacy, and develop a 
                  stronger emotional connection.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-terracotta text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-6">
            Invest in Your Relationship
          </h2>
          <p className="font-source text-xl text-white/90 mb-8">
            Take the first step towards a stronger, healthier relationship together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-terracotta hover:bg-cream"
              onClick={() => navigate('/find-counsellor')}
            >
              Find Your Couples Counsellor
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CouplesCounselling;
