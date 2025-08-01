import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ServiceCategories from '@/components/ServiceCategories';
import HowItWorks from '@/components/HowItWorks';
import FeaturedCounsellors from '@/components/FeaturedCounsellors';
import AboutSection from '@/components/AboutSection';
import Testimonials from '@/components/Testimonials';
import TestimonialForm from '@/components/TestimonialForm';
import NewsSection from '@/components/NewsSection';
import DonationAlert from '@/components/DonationAlert';
import EmergencyResources from '@/components/EmergencyResources';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ServiceCategories />
      <HowItWorks />
      <FeaturedCounsellors />
      <AboutSection />
      <Testimonials />
      <TestimonialForm />
      <NewsSection />
      <DonationAlert />
      <EmergencyResources />
      <Footer />
    </div>
  );
};

export default Index;
