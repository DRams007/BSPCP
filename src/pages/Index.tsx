import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import MandateObjectivesSection from '@/components/MandateObjectivesSection';
// import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import TestimonialForm from '@/components/TestimonialForm';
// import DonationAlert from '@/components/DonationAlert';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <MandateObjectivesSection />
      {/* <HowItWorks /> */}
      <Testimonials />
      <TestimonialForm />
      {/* <DonationAlert /> */}
      <Footer />
    </div>
  );
};

export default Index;
