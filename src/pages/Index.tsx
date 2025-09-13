import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ServiceCategories from '@/components/ServiceCategories';
// import HowItWorks from '@/components/HowItWorks';
import AboutSection from '@/components/AboutSection';
import Testimonials from '@/components/Testimonials';
import TestimonialForm from '@/components/TestimonialForm';
// import DonationAlert from '@/components/DonationAlert';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <ServiceCategories />
      {/* <HowItWorks /> */}
      <Testimonials />
      <TestimonialForm />
      {/* <DonationAlert /> */}
      <Footer />
    </div>
  );
};

export default Index;
