import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Heart, CheckCircle, Clock, Calendar, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TraumaCrisis = () => {
  const navigate = useNavigate();
  const traumaTypes = [
    'Acute Trauma', 'Complex PTSD', 'Childhood Trauma', 'Sexual Assault', 
    'Domestic Violence', 'Accident Trauma', 'Workplace Trauma', 'Medical Trauma'
  ];

  const crisisServices = [
    'Emergency crisis intervention and stabilization',
    'Safety planning and risk assessment',
    'Immediate emotional support and validation',
    'Connection to emergency resources and services',
    'Follow-up care coordination',
    '24/7 crisis hotline access'
  ];

  const treatmentApproaches = [
    'Trauma-Focused Cognitive Behavioral Therapy (TF-CBT)',
    'Eye Movement Desensitization and Reprocessing (EMDR)',
    'Cognitive Processing Therapy (CPT)',
    'Prolonged Exposure Therapy',
    'Somatic Experiencing',
    'Crisis Intervention Techniques'
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
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="font-poppins font-bold text-4xl md:text-5xl">
                  Trauma & Crisis Support
                </h1>
              </div>
              <p className="font-source text-xl text-cream/90 mb-8 leading-relaxed">
                Specialized care for trauma survivors and immediate crisis intervention services. 
                We provide compassionate, evidence-based treatment to help you heal and reclaim your life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-cream"
                  onClick={() => navigate('/find-counsellor')}
                >
                  Find A Trauma Specialist
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">
                    Crisis Hotline
                  </h3>
                  <p className="text-cream/90 font-bold">16222</p>
                  <p className="text-cream/70 text-sm">24/7 Support</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 text-white mx-auto mb-3" />
                  <h3 className="font-poppins font-semibold text-lg text-white mb-2">
                    Safe Space
                  </h3>
                  <p className="text-cream/90">Confidential & secure</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Crisis Warning Banner */}
      <section className="py-6 bg-destructive">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 text-white">
            <AlertTriangle className="w-6 h-6" />
            <p className="font-source text-center">
              <strong>Crisis Emergency:</strong> If you're experiencing a mental health emergency or having thoughts of self-harm, 
              call 16222 immediately or visit your nearest emergency room.
            </p>
          </div>
        </div>
      </section>

      {/* Types of Trauma We Address */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Types of Trauma We Address
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Our trauma specialists are trained to help with various types of traumatic experiences.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {traumaTypes.map((type, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-center py-3 px-4 text-sm font-medium"
              >
                {type}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                  Crisis Services
                </h3>
                <div className="space-y-4">
                  {crisisServices.map((service, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="font-source text-muted-foreground">{service}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                Treatment Approaches
              </h3>
              <p className="font-source text-muted-foreground mb-6">
                We use evidence-based trauma therapies proven to help survivors heal and recover:
              </p>
              <ul className="space-y-3">
                {treatmentApproaches.map((approach, index) => (
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

      {/* How We Help */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              How We Support Your Healing
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive approach addresses both immediate crisis needs and long-term healing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  Immediate Crisis Response
                </h3>
                <p className="font-source text-muted-foreground">
                  24/7 crisis intervention, safety planning, and emergency stabilization 
                  when you need it most.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  Trauma-Informed Care
                </h3>
                <p className="font-source text-muted-foreground">
                  Specialized therapy approaches designed specifically for trauma recovery 
                  and post-traumatic growth.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-terracotta" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                  Long-Term Support
                </h3>
                <p className="font-source text-muted-foreground">
                  Ongoing therapy, support groups, and resources to help you rebuild 
                  and thrive after trauma.
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
            You Don't Have to Face This Alone
          </h2>
          <p className="font-source text-xl text-primary-foreground/90 mb-8">
            Help is available. Take the first step towards healing and recovery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Crisis Support: 16222
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              Find a Trauma Specialist
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TraumaCrisis;
