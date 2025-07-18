import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Users, Clock } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-warm text-white py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
            Find Your Path to 
            <span className="block text-cream">Better Mental Health</span>
          </h1>
          
          <p className="font-source text-xl md:text-2xl mb-8 text-cream/90 max-w-3xl mx-auto">
            We're here to support you on your wellness journey. Connect with qualified counsellors 
            and psychotherapists in Botswana who understand your unique needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-cream text-primary hover:bg-cream/90 font-source font-semibold text-lg px-8 py-6 rounded-2xl shadow-warm"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-cream text-cream hover:bg-cream/10 font-source font-semibold text-lg px-8 py-6 rounded-2xl"
            >
              Browse Counsellors
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-cream/80">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-source font-medium">Licensed Professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-source font-medium">Confidential</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-source font-medium">Accessible</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-cream/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-terracotta/20 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroSection;