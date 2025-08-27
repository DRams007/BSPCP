import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Users, Home, Sprout, Shield, Monitor, Search, MapPin, Star, Calendar, Filter } from 'lucide-react';
const FindCounsellor = () => {
  const serviceCategories = [{
    icon: Heart,
    title: 'Individual Therapy',
    description: 'Depression, anxiety, stress management, and personal growth',
    color: 'bg-primary/10 text-primary',
    subcategories: ['Depression & Anxiety', 'Stress Management', 'Self-esteem Issues', 'Life Transitions']
  }, {
    icon: Users,
    title: 'Couples Counselling',
    description: 'Relationship issues, communication, and pre-marital counselling',
    color: 'bg-terracotta/10 text-terracotta',
    subcategories: ['Relationship Issues', 'Communication Problems', 'Pre-marital Counselling', 'Separation Support']
  }, {
    icon: Home,
    title: 'Family Therapy',
    description: 'Family conflicts, parenting support, and generational issues',
    color: 'bg-dusty/10 text-dusty',
    subcategories: ['Family Conflicts', 'Parenting Support', 'Blended Family Issues', 'Generational Conflicts']
  }, {
    icon: Sprout,
    title: 'Child & Adolescent',
    description: 'Behavioral issues, school problems, and teen mental health',
    color: 'bg-accent/10 text-accent',
    subcategories: ['Behavioral Issues', 'School Problems', 'Developmental Concerns', 'Teen Mental Health']
  }, {
    icon: Shield,
    title: 'Specialized Services',
    description: 'Trauma, PTSD, addiction, grief, and career counselling',
    color: 'bg-primary/10 text-primary',
    subcategories: ['Trauma & PTSD', 'Addiction Support', 'Grief & Loss', 'Career Counselling']
  }];
  const featuredCounsellors = [{
    name: 'Dr. Thabo Moeti',
    title: 'Clinical Psychologist',
    specialization: ['Anxiety & Depression', 'Trauma Therapy', 'Family Counselling'],
    location: 'Gaborone',
    experience: '12 years',
    rating: 4.9,
    reviews: 156,
    image: '/src/assets/counselor-thabo.jpg',
    availability: 'Available this week',
    sessionTypes: ['In-person', 'Online'],
    languages: ['English', 'Setswana']
  }, {
    name: 'Ms. Kefilwe Setlhare',
    title: 'Licensed Counsellor',
    specialization: ['Couples Therapy', 'Communication Skills', 'Relationship Issues'],
    location: 'Francistown',
    experience: '8 years',
    rating: 4.8,
    reviews: 92,
    image: '/src/assets/counselor-kefilwe.jpg',
    availability: 'Available next week',
    sessionTypes: ['In-person', 'Online'],
    languages: ['English', 'Setswana']
  }, {
    name: 'Dr. Mmoloki Segwai',
    title: 'Child Psychologist',
    specialization: ['Child Development', 'Behavioral Issues', 'Family Dynamics'],
    location: 'Maun',
    experience: '10 years',
    rating: 4.9,
    reviews: 134,
    image: '/src/assets/counselor-mmoloki.jpg',
    availability: 'Available this week',
    sessionTypes: ['In-person', 'Online'],
    languages: ['English', 'Setswana']
  }, {
    name: 'Ms. Boitumelo Kgathi',
    title: 'Mental Health Counsellor',
    specialization: ['Stress Management', 'Life Transitions', 'Career Counselling'],
    location: 'Kasane',
    experience: '6 years',
    rating: 4.7,
    reviews: 78,
    image: '/src/assets/counselor-boitumelo.jpg',
    availability: 'Available tomorrow',
    sessionTypes: ['In-person', 'Online'],
    languages: ['English', 'Setswana']
  }, {
    name: 'Dr. Kelebogile Motlhabani',
    title: 'Family Therapist',
    specialization: ['Family Therapy', 'Parenting Support', 'Adolescent Issues'],
    location: 'Gaborone',
    experience: '14 years',
    rating: 4.9,
    reviews: 203,
    image: '/src/assets/counselor-boitumelo.jpg',
    availability: 'Available this week',
    sessionTypes: ['In-person', 'Online'],
    languages: ['English', 'Setswana']
  }, {
    name: 'Mr. Tebogo Phiri',
    title: 'Addiction Counsellor',
    specialization: ['Addiction Recovery', 'Substance Abuse', 'Behavioral Addiction'],
    location: 'Francistown',
    experience: '9 years',
    rating: 4.8,
    reviews: 87,
    image: '/src/assets/counselor-boitumelo.jpg',
    availability: 'Available next week',
    sessionTypes: ['In-person', 'Online'],
    languages: ['English', 'Setswana']
  }];
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-warm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-poppins font-bold text-4xl md:text-5xl mb-6">
              Find Your Perfect Counsellor
            </h1>
            <p className="font-source text-xl text-cream/90 max-w-3xl mx-auto">
              Connect with qualified mental health professionals who understand your unique needs 
              and can support you on your wellness journey.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
            <Button size="lg" className="bg-cream text-primary hover:bg-cream/90 font-source font-semibold text-lg px-8 py-6 rounded-2xl shadow-warm">
              Tell Us What You Need
            </Button>
            
            <Button size="lg" variant="outline" className="border-cream text-cream font-source font-semibold text-lg px-8 py-6 rounded-2xl bg-[#86995c]">
              Browse All Counsellors
            </Button>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              What brings you here today?
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the area where you'd like support. We'll help you find the right counsellor for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceCategories.map((category, index) => <Card key={index} className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card cursor-pointer">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="font-poppins font-semibold text-xl text-foreground mb-3 text-center">
                    {category.title}
                  </h3>
                  
                  <p className="font-source text-muted-foreground mb-4 text-center leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {category.subcategories.map((sub, idx) => <div key={idx} className="flex items-center space-x-2">
                        <Checkbox id={`${index}-${idx}`} />
                        <Label htmlFor={`${index}-${idx}`} className="text-sm font-source text-muted-foreground">
                          {sub}
                        </Label>
                      </div>)}
                  </div>
                  
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    Select This Category
                  </Button>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Quick Request Form */}
      <section className="py-20 bg-gradient-gentle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Tell Us About Your Needs
            </h2>
            <p className="font-source text-lg text-muted-foreground">
              Share some details about what you're looking for, and we'll match you with the right counsellor.
            </p>
          </div>

          <Card className="shadow-soft">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="font-source font-medium">Full Name</Label>
                    <Input id="name" type="text" placeholder="Your full name" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="font-source font-medium">Email Address</Label>
                    <Input id="email" type="email" placeholder="your@email.com" className="mt-2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone" className="font-source font-medium">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+267 123 4567" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="location" className="font-source font-medium">Preferred Location</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gaborone">Gaborone</SelectItem>
                        <SelectItem value="francistown">Francistown</SelectItem>
                        <SelectItem value="maun">Maun</SelectItem>
                        <SelectItem value="kasane">Kasane</SelectItem>
                        <SelectItem value="online">Online Only</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="session-type" className="font-source font-medium">Session Type</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select session type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-person">In-person only</SelectItem>
                        <SelectItem value="online">Online only</SelectItem>
                        <SelectItem value="both">Both in-person and online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="urgency" className="font-source font-medium">When do you need support?</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediately</SelectItem>
                        <SelectItem value="this-week">This week</SelectItem>
                        <SelectItem value="next-week">Next week</SelectItem>
                        <SelectItem value="this-month">Within this month</SelectItem>
                        <SelectItem value="flexible">I'm flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="concerns" className="font-source font-medium">What brings you to counselling? (Optional)</Label>
                  <Textarea id="concerns" placeholder="Share a brief description of what you'd like support with..." className="mt-2 h-24" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="submit" size="lg" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-source font-semibold">
                    Find My Counsellor
                  </Button>
                  <Button type="button" variant="outline" size="lg" className="flex-1">
                    Browse All Counsellors
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Search & Filter Interface */}
      <section id="browse-all-counsellors" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Browse All Counsellors
            </h2>
            <p className="font-source text-lg text-muted-foreground">
              Search and filter to find the perfect mental health professional for your needs.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input placeholder="Search by name, specialization, or location..." className="pl-10 h-12 text-lg" />
                </div>
              </div>
              <Button variant="outline" size="lg" className="lg:w-auto">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCounsellors.map((counsellor, index) => <Card key={index} className="group hover:shadow-warm transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img src={counsellor.image} alt={counsellor.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {counsellor.experience}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="font-poppins font-semibold text-lg text-foreground mb-1">
                        {counsellor.name}
                      </h3>
                      <p className="font-source text-muted-foreground text-sm mb-2">
                        {counsellor.title}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{counsellor.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-sm">{counsellor.rating}</span>
                        <span className="text-xs text-muted-foreground">({counsellor.reviews} reviews)</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {counsellor.specialization.slice(0, 2).map((spec, idx) => <Badge key={idx} variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                            {spec}
                          </Badge>)}
                        {counsellor.specialization.length > 2 && <Badge variant="outline" className="text-xs">
                            +{counsellor.specialization.length - 2} more
                          </Badge>}
                      </div>
                    </div>
                    
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{counsellor.availability}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Monitor className="w-4 h-4" />
                        <span>{counsellor.sessionTypes.join(', ')}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Languages:</strong> {counsellor.languages.join(', ')}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Profile
                      </Button>
                      <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="px-8">
              Load More Counsellors
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default FindCounsellor;
