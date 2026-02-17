import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, CheckCircle, Clock, Calendar, Wifi, Shield, Video, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OnlineCounselling = () => {
  const navigate = useNavigate();
  const platforms = [
    'Secure Video Calls',
    'Audio-only Sessions',
    'Text-based Therapy',
    'Hybrid Online/In-person'
  ];

  const benefits = [
    'Access counselling from anywhere with internet',
    'Flexible scheduling around your commitments',
    'Comfortable environment of your own home',
    'Same professional quality as in-person sessions',
    'No travel time or transportation barriers',
    'Enhanced privacy and confidentiality'
  ];

  const techRequirements = [
    'Stable internet connection',
    'Computer, tablet, or smartphone',
    'Webcam and microphone (for video sessions)',
    'Private, quiet space for sessions'
  ];

  const sessionTypes = [
    {
      icon: Video,
      title: 'Video Sessions',
      description: 'Face-to-face counselling via secure video calls with full visual and audio connection.',
      color: 'bg-primary/10 text-primary'
    },
    {
      icon: MessageSquare,
      title: 'Audio Sessions',
      description: 'Voice-only counselling for those who prefer audio-only or have limited bandwidth.',
      color: 'bg-secondary/10 text-secondary'
    },
    {
      icon: Monitor,
      title: 'Text Therapy',
      description: 'Written communication for those who express themselves better through writing.',
      color: 'bg-terracotta/10 text-terracotta'
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
                  <Monitor className="w-8 h-8 text-white" />
                </div>
                <h1 className="font-poppins font-bold text-4xl md:text-5xl">
                  Online Counselling
                </h1>
              </div>
              <p className="font-source text-xl text-cream/90 mb-8 leading-relaxed">
                Access professional counselling services from the comfort and privacy of your own home.
                Same quality care, delivered conveniently through secure online platforms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-cream"
                  onClick={() => navigate('/find-counsellor')}
                >
                  Start Online Counselling
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
                    Availability
                  </h3>
                  <p className="text-cream/90">7 days a week</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Session Types */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Online Session Options
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the format that works best for you and your comfort level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {sessionTypes.map((type, index) => (
              <Card key={index} className="hover:shadow-soft transition-all duration-300 text-center">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${type.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <type.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                    {type.title}
                  </h3>
                  <p className="font-source text-muted-foreground leading-relaxed">
                    {type.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mb-12">
            <h3 className="font-poppins font-bold text-2xl text-foreground mb-4">
              Available Platforms
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map((platform, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-center py-3 px-4 text-sm font-medium"
              >
                {platform}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits and Requirements */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <Card className="border-secondary/20 bg-secondary/5">
              <CardContent className="p-8">
                <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                  Benefits of Online Counselling
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                      <p className="font-source text-muted-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                Technical Requirements
              </h3>
              <p className="font-source text-muted-foreground mb-6">
                Online counselling is easy to access. Here's what you need:
              </p>
              <ul className="space-y-3 mb-8">
                {techRequirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="font-source text-foreground">{req}</span>
                  </li>
                ))}
              </ul>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                    <h4 className="font-poppins font-semibold text-lg text-foreground">
                      Security & Privacy
                    </h4>
                  </div>
                  <p className="font-source text-muted-foreground text-sm">
                    All online sessions use end-to-end encrypted platforms that meet healthcare
                    privacy standards. Your conversations are completely confidential and secure.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Getting Started is Easy
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Begin your online counselling journey in just a few simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  1
                </div>
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                  Sign Up
                </h3>
                <p className="font-source text-sm text-muted-foreground">
                  Create your account and complete our brief assessment
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  2
                </div>
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                  Match
                </h3>
                <p className="font-source text-sm text-muted-foreground">
                  We'll match you with a qualified counsellor
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-terracotta text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  3
                </div>
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                  Schedule
                </h3>
                <p className="font-source text-sm text-muted-foreground">
                  Book your first session at a convenient time
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-dusty text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  4
                </div>
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                  Connect
                </h3>
                <p className="font-source text-sm text-muted-foreground">
                  Join your secure online session and begin your journey
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-secondary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-6">
            Start Your Online Counselling Journey
          </h2>
          <p className="font-source text-xl text-white/90 mb-8">
            Professional mental health support is just a click away. Access quality counselling from anywhere.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OnlineCounselling;
