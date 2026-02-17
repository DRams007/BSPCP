import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, CheckCircle, Clock, FileText, Calendar, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IndividualTherapy = () => {
  const navigate = useNavigate();
  const approaches = [
    'Cognitive Behavioral Therapy (CBT)',
    'Dialectical Behavior Therapy (DBT)',
    'Humanistic/Person-Centered',
    'Trauma-Informed Therapy',
    'Solution-Focused Brief Therapy'
  ];

  const conditions = [
    'Depression', 'Anxiety', 'Stress Management', 'Trauma & PTSD',
    'Grief & Loss', 'Life Transitions', 'Self-Esteem Issues', 'Anger Management'
  ];

  const benefits = [
    'Personalized treatment approach tailored to your unique needs',
    'Confidential and safe therapeutic environment',
    'Flexible scheduling to fit your lifestyle',
    'Evidence-based therapeutic techniques',
    'Professional support for personal growth',
    'Development of healthy coping strategies'
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
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h1 className="font-poppins font-bold text-4xl md:text-5xl">
                  Individual Therapy
                </h1>
              </div>
              <p className="font-source text-xl text-cream/90 mb-8 leading-relaxed">
                One-on-one personalized counselling sessions designed to support your mental health,
                personal growth, and overall wellbeing in a confidential and supportive environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-cream"
                  onClick={() => navigate('/find-counsellor')}
                >
                  Find a Counsellor
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
                  <p className="text-cream/90">Weekly or bi-weekly</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What We Help With */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              What We Help With
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Individual therapy can help you work through a wide range of personal challenges and goals.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {conditions.map((condition, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-center py-3 px-4 text-sm font-medium"
              >
                {condition}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                  Key Benefits
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="font-source text-muted-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                Therapeutic Approaches
              </h3>
              <p className="font-source text-muted-foreground mb-6">
                Our counsellors use evidence-based therapeutic approaches tailored to your specific needs:
              </p>
              <ul className="space-y-3">
                {approaches.map((approach, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="font-source text-foreground">{approach}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              What to Expect
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Your journey to better mental health starts with understanding our process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  1. Initial Consultation
                </h3>
                <p className="font-source text-muted-foreground">
                  We'll discuss your concerns, goals, and match you with the right counsellor
                  for your specific needs.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-terracotta" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  2. Treatment Planning
                </h3>
                <p className="font-source text-muted-foreground">
                  Together with your counsellor, you'll develop a personalized treatment plan
                  that aligns with your goals.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-dusty/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-dusty" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  3. Regular Sessions
                </h3>
                <p className="font-source text-muted-foreground">
                  Attend regular sessions where you'll work through challenges and develop
                  healthy coping strategies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="font-source text-xl text-primary-foreground/90 mb-8">
            Take the first step towards better mental health and personal growth.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IndividualTherapy;
