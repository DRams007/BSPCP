import { MessageCircle, UserCheck, Calendar, Heart } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: MessageCircle,
      title: 'Tell us what you need',
      description: 'Share your concerns and preferences in our simple, confidential form'
    },
    {
      icon: UserCheck,
      title: 'We match you with qualified counsellors',
      description: 'Our team connects you with licensed professionals who specialize in your area of need'
    },
    {
      icon: Calendar,
      title: 'Book your appointment',
      description: 'Choose a time that works for you - in-person or online sessions available'
    },
    {
      icon: Heart,
      title: 'Begin your journey to better mental health',
      description: 'Start working with your counsellor in a safe, supportive environment'
    }
  ];

  return (
    <section className="py-20 bg-gradient-gentle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
            Your Wellness Journey
          </h2>
          <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting the support you need is simple. We've made it easy to connect with the right counsellor for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-soft">
                  <step.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-border transform -translate-x-1/2"></div>
                )}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-terracotta text-cream rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              
              <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">
                {step.title}
              </h3>
              
              <p className="font-source text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;