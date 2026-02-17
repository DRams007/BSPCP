import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, CheckCircle, Clock, Calendar, Users, Heart, Shield } from 'lucide-react';

const FamilyTherapy = () => {
  const approaches = [
    'Structural Family Therapy',
    'Strategic Family Therapy',
    'Family Systems Therapy',
    'Narrative Family Therapy',
    'Solution-Focused Family Therapy'
  ];

  const issues = [
    'Family Conflicts', 'Parenting Challenges', 'Blended Family Issues', 'Adolescent Problems',
    'Communication Breakdown', 'Behavioral Issues', 'Grief & Loss', 'Major Life Changes'
  ];

  const benefits = [
    'Improved family communication patterns',
    'Stronger family bonds and relationships',
    'Effective conflict resolution skills',
    'Better understanding of family dynamics',
    'Support for parenting challenges',
    'Healthy coping strategies for the whole family'
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
                  <Home className="w-8 h-8 text-white" />
                </div>
                <h1 className="font-poppins font-bold text-4xl md:text-5xl">
                  Family Therapy
                </h1>
              </div>
              <p className="font-source text-xl text-cream/90 mb-8 leading-relaxed">
                Strengthen family bonds and improve communication through comprehensive family therapy.
                Work together to resolve conflicts and create a more harmonious family environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-cream"
                >
                  Find a Family Therapist
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  Schedule Assessment
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
                  <p className="text-cream/90">Weekly or bi-weekly</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Family Issues */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Family Challenges We Address
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Every family faces unique challenges. We provide support for a wide range of family issues.
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
            <Card className="border-dusty/20 bg-dusty/5">
              <CardContent className="p-8">
                <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                  Family Therapy Benefits
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-dusty mt-0.5 flex-shrink-0" />
                      <p className="font-source text-muted-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                Our Therapeutic Approaches
              </h3>
              <p className="font-source text-muted-foreground mb-6">
                We use proven family therapy methods that address the unique dynamics of your family:
              </p>
              <ul className="space-y-3">
                {approaches.map((approach, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-dusty rounded-full"></div>
                    <span className="font-source text-foreground">{approach}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Benefit */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Who Can Benefit from Family Therapy?
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Family therapy can help various family structures and situations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-dusty/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-dusty" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  Nuclear Families
                </h3>
                <p className="font-source text-muted-foreground">
                  Parents and children working together to improve communication,
                  resolve conflicts, and strengthen family bonds.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  Blended Families
                </h3>
                <p className="font-source text-muted-foreground">
                  Step-families navigating new relationships, establishing boundaries,
                  and creating harmony in merged households.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-terracotta" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  Single Parent Families
                </h3>
                <p className="font-source text-muted-foreground">
                  Single parents and their children developing strong support systems
                  and healthy coping strategies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Our Family Therapy Process
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              A structured approach to helping your family heal and grow together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  1
                </div>
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                  Assessment
                </h3>
                <p className="font-source text-sm text-muted-foreground">
                  Understand family dynamics and identify key issues
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-terracotta text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  2
                </div>
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                  Goal Setting
                </h3>
                <p className="font-source text-sm text-muted-foreground">
                  Collaborate to set realistic and achievable family goals
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-dusty text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  3
                </div>
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                  Intervention
                </h3>
                <p className="font-source text-sm text-muted-foreground">
                  Implement therapeutic strategies and practice new skills
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  4
                </div>
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                  Progress Review
                </h3>
                <p className="font-source text-sm text-muted-foreground">
                  Monitor progress and adjust treatment as needed
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-dusty text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-6">
            Strengthen Your Family Bond
          </h2>
          <p className="font-source text-xl text-white/90 mb-8">
            Take the first step towards a more harmonious and connected family life.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FamilyTherapy;