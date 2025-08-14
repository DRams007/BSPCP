import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const testimonials = [
  {
    id: 1,
    name: "Sarah Lebotse",
    role: "Client",
    content: "BSPCP provided me with exceptional support during a difficult time. The counselors are professional, compassionate, and truly understand the challenges we face in our community.",
    rating: 5,
    avatar: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Michael Serame",
    role: "Family Therapy Client",
    content: "The family therapy sessions helped us reconnect and communicate better. The cultural sensitivity of the counselors made all the difference in our healing journey.",
    rating: 5,
    avatar: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Dr. Grace Mogwe",
    role: "Community Partner",
    content: "BSPCP's commitment to mental health awareness in our community is remarkable. Their evidence-based approach and cultural competence set them apart.",
    rating: 5,
    avatar: "/placeholder.svg"
  },
  {
    id: 4,
    name: "James Mokone",
    role: "Individual Therapy Client",
    content: "I was hesitant about seeking help, but BSPCP made me feel welcomed and understood. The progress I've made in managing my anxiety has been life-changing.",
    rating: 5,
    avatar: "/placeholder.svg"
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real stories from people who have experienced healing and growth through our services
          </p>
        </div>
        
        <Carousel
          className="w-full max-w-6xl mx-auto"
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
        >
          <CarouselContent>
            {testimonials.reduce((slides, testimonial, index) => {
              if (index % 2 === 0) {
                slides.push(
                  <CarouselItem key={`slide-${index / 2}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {testimonials.slice(index, index + 2).map((t) => (
                        <Card key={t.id} className="h-full hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-center mb-4">
                              {[...Array(t.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <p className="text-muted-foreground mb-6 italic">
                              "{t.content}"
                            </p>
                            <div className="flex items-center">
                              <Avatar className="w-12 h-12 mr-4">
                                <AvatarImage src={t.avatar} alt={t.name} />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {t.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-foreground">{t.name}</h4>
                                <p className="text-sm text-muted-foreground">{t.role}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CarouselItem>
                );
              }
              return slides;
            }, [] as JSX.Element[])}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default Testimonials;