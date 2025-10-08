import { Card, CardContent } from '@/components/ui/card';
import { Network, Shield, GraduationCap, Award, Megaphone, Users } from 'lucide-react';

const MandateObjectivesSection = () => {
  const objectives = [
    {
      id: 'a',
      icon: Users,
      title: 'Organise Professional Network',
      description: 'Create and maintain an organised network of professional counsellors and psychotherapists in Botswana.',
      color: 'bg-primary/10 text-primary',
      gradient: 'from-primary/20 to-primary/10'
    },
    {
      id: 'b',
      icon: Shield,
      title: 'Professional Regulation',
      description: 'Regulate the practice of professional counselling and psychotherapy in Botswana.',
      color: 'bg-terracotta/10 text-terracotta',
      gradient: 'from-terracotta/20 to-terracotta/10'
    },
    {
      id: 'c',
      icon: GraduationCap,
      title: 'Continuous Professional Development',
      description: 'Facilitate continuous professional development (CPD) of its members.',
      color: 'bg-accent/10 text-accent',
      gradient: 'from-accent/20 to-accent/10'
    },
    {
      id: 'd',
      icon: Award,
      title: 'Professionalise Practice',
      description: 'Professionalise the practice of counselling and psychotherapy.',
      color: 'bg-accent/10 text-accent',
      gradient: 'from-accent/20 to-accent/10'
    },
    {
      id: 'e',
      icon: Megaphone,
      title: 'Public Awareness',
      description: 'Raise public awareness of counselling and psychotherapy in Botswana.',
      color: 'bg-primary/10 text-primary',
      gradient: 'from-primary/20 to-primary/10'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-terracotta/5 rounded-full blur-2xl animate-pulse"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-terracotta/20 rounded-3xl mb-8 shadow-soft">
            <Network className="w-10 h-10 text-primary animate-pulse" />
          </div>

          <h2 className="font-poppins font-bold text-4xl md:text-5xl text-foreground mb-6 leading-tight">
            Our Mandate & Objectives
          </h2>

          <p className="font-source text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The Botswana Society of Professional Counsellors and Psychotherapists is committed to
            advancing mental health care through these core objectives
          </p>
        </div>

        {/* Objectives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {objectives.map((objective, index) => (
            <Card
              key={objective.id}
              className="group relative overflow-hidden transition-all duration-500 hover:shadow-warm hover:-translate-y-3 border-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${objective.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

              <CardContent className="relative p-8 h-full flex flex-col items-center text-center">
                {/* Icon - Centered */}
                <div className={`w-20 h-20 ${objective.color} rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-6`}>
                  <objective.icon className="w-10 h-10" />
                </div>

                {/* Title */}
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-4 group-hover:text-primary transition-colors duration-300 leading-tight">
                  {objective.title}
                </h3>

                {/* Description */}
                <p className="font-source text-muted-foreground leading-relaxed flex-grow">
                  {objective.description}
                </p>

                {/* Decorative line */}
                <div className="mt-6 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent group-hover:via-primary transition-colors duration-300"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom decorative element */}
        <div className="mt-20 flex justify-center">
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default MandateObjectivesSection;
