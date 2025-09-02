import { Button } from '@/components/ui/button';

const AboutSection = () => {
  return (
    <section className="py-20 bg-gradient-gentle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-6">
            About BSPCP
          </h2>
          <p className="font-source text-lg text-muted-foreground mb-6 leading-relaxed">
            The Botswana Society for Professional Counsellors & Psychotherapists (BSPCP) is
            dedicated to promoting professional excellence in mental health services throughout Botswana.
          </p>
          <p className="font-source text-lg text-muted-foreground mb-8 leading-relaxed">
            We connect individuals, couples, and families with qualified mental health professionals
            who provide compassionate, evidence-based care. Our mission is to make quality mental
            health support accessible to all Batswana.
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            Learn More About Us
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
