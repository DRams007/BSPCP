import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart, Users, Home, Sprout, Shield, Monitor, Search, MapPin, Star, Calendar, Filter, Loader2, Mail, Phone, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import BookingModal from '@/components/BookingModal'; // Import the new BookingModal

interface Counsellor {
  id: string;
  full_name: string;
  title: string;
  specializations: string[];
  city: string;
  physical_address?: string;
  profile_photo_url: string;
  years_experience: string;
  availability: string;
  session_types: string[];
  languages: string[];
  bio?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
}

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

const FindCounsellor = () => {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCounsellor, setSelectedCounsellor] = useState<Counsellor | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false); // New state for booking modal
  const [counsellorToBook, setCounsellorToBook] = useState<Counsellor | null>(null); // New state for selected counsellor to book

  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    sessionType: '',
    urgency: '',
    needs: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [filteredCounsellors, setFilteredCounsellors] = useState<Counsellor[]>([]);
  const [showAll, setShowAll] = useState(true);
  const [noResults, setNoResults] = useState(false);

  const needsFormRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/counsellors`);
        if (!response.ok) {
          throw new Error('Failed to fetch counsellors');
        }
        const data = await response.json();
        setCounsellors(data);
        setFilteredCounsellors(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCounsellors();
  }, []);

  const fetchCounsellorDetails = async (id: string) => {
    setModalLoading(true);
    setModalError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/counsellors/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch counsellor details');
      }
      const data = await response.json();
      setSelectedCounsellor(data);
      setIsModalOpen(true);
    } catch (err) {
      const error = err as Error;
      setModalError(error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCategorySelect = () => {
    needsFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: value });
    setErrors(prev => ({ ...prev, [id]: '' })); // Clear error when value changes
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.fullName) {
      newErrors.fullName = 'Full Name is required.';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone Number is required.';
    }
    if (!selectedConcern && !formData.needs) {
      newErrors.concernOrNeeds = 'Please select a category or describe your needs.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookNowClick = (counsellor: Counsellor) => {
    if (!validateForm()) {
      // Scroll to the form if validation fails
      needsFormRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setCounsellorToBook(counsellor);
    setIsBookingModalOpen(true);
  };

  const handleFindMyCounsellor = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const filtered = counsellors.filter(c => {
        const specializationMatch = selectedConcern ? c.specializations.includes(selectedConcern) : true;
        const locationMatch = formData.location ? c.city.toLowerCase() === formData.location.toLowerCase() : true;
        let sessionTypeMatch = true;
        if (formData.sessionType) {
            if (formData.sessionType === 'both') {
                sessionTypeMatch = c.session_types.includes('in-person') && c.session_types.includes('online');
            } else {
                sessionTypeMatch = c.session_types.includes(formData.sessionType);
            }
        }
        return specializationMatch && locationMatch && sessionTypeMatch;
    });
    setFilteredCounsellors(filtered);
    setShowAll(false);
    setNoResults(filtered.length === 0);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBrowseAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFilteredCounsellors(counsellors);
    setShowAll(true);
    setNoResults(false);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
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
            <Button size="lg" className="bg-cream text-primary hover:bg-cream/90 font-source font-semibold text-lg px-8 py-6 rounded-2xl shadow-warm" onClick={() => needsFormRef.current?.scrollIntoView({ behavior: 'smooth' }) }>
              Tell Us What You Need
            </Button>
            
            <Button size="lg" variant="outline" className="border-cream text-cream font-source font-semibold text-lg px-8 py-6 rounded-2xl bg-[#86995c]" onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }) }>
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
            {serviceCategories.map((category, index) => (
              <Card key={index} className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card">
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
                  
                  <RadioGroup onValueChange={(value) => setSelectedConcern(value)} value={selectedConcern || ''} className="space-y-2 mb-6">
                    {category.subcategories.map((sub, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <RadioGroupItem value={sub} id={`${index}-${idx}`} />
                        <Label htmlFor={`${index}-${idx}`} className="text-sm font-source text-muted-foreground">
                          {sub}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300" onClick={handleCategorySelect}>
                    Select This Category
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Request Form */}
      <section ref={needsFormRef} id="tell-us-about-your-needs" className="py-20 bg-gradient-gentle">
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
                    <Label htmlFor="fullName" className="font-source font-medium">Full Name</Label>
                    <Input id="fullName" type="text" placeholder="Your full name" className="mt-2" value={formData.fullName} onChange={handleFormChange} />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email" className="font-source font-medium">Email Address</Label>
                    <Input id="email" type="email" placeholder="your@email.com" className="mt-2" value={formData.email} onChange={handleFormChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone" className="font-source font-medium">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+267 123 4567" className="mt-2" value={formData.phone} onChange={handleFormChange} />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <Label htmlFor="location" className="font-source font-medium">Preferred Location</Label>
                    <Select onValueChange={(value) => handleSelectChange('location', value)}>
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
                    <Label htmlFor="sessionType" className="font-source font-medium">Session Type</Label>
                    <Select onValueChange={(value) => handleSelectChange('sessionType', value)}>
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
                    <Select onValueChange={(value) => handleSelectChange('urgency', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">As soon as possible</SelectItem>
                        <SelectItem value="this-month">Within a month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="needs" className="font-source font-medium">What brings you to counselling? (Optional)</Label>
                  <Textarea id="needs" placeholder="Share a brief description of what you'd like support with..." className="mt-2 h-24" value={formData.needs} onChange={handleFormChange} />
                  {errors.concernOrNeeds && <p className="text-red-500 text-sm mt-1">{errors.concernOrNeeds}</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="submit" size="lg" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-source font-semibold" onClick={handleFindMyCounsellor}>
                    Find My Counsellor
                  </Button>
                  <Button type="button" variant="outline" size="lg" className="flex-1" onClick={handleBrowseAll}>
                    Browse All Counsellors
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Search & Filter Interface */}
      <section ref={resultsRef} id="browse-all-counsellors" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              {showAll ? 'Browse All Counsellors' : 'Matched Counsellors'}
            </h2>
            <p className="font-source text-lg text-muted-foreground">
              {showAll ? 'Search and filter to find the perfect mental health professional for your needs.' : 'Based on your needs, we found the following counsellors.'}
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

          {loading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-2">Loading Counsellors...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-10 text-red-500">
              <p>Error: {error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
            </div>
          )}
          
          {noResults && (
            <div className="text-center py-10">
                <p className="text-lg text-muted-foreground mb-4">No counsellors found matching your criteria.</p>
                <Button onClick={handleBrowseAll}>Browse All Counsellors</Button>
            </div>
          )}

          {!loading && !error && !noResults && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCounsellors.map((counsellor) => (
                <Card key={counsellor.id} className="group hover:shadow-warm transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img src={counsellor.profile_photo_url} alt={counsellor.full_name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        {`${counsellor.years_experience}${counsellor.years_experience.toLowerCase().includes('year') ? '' : ' years'}`}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="font-poppins font-semibold text-lg text-foreground mb-1">
                          {counsellor.title} {counsellor.full_name}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{counsellor.city}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {counsellor.specializations && counsellor.specializations.slice(0, 2).map((spec, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                              {spec}
                            </Badge>
                          ))}
                          {counsellor.specializations && counsellor.specializations.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{counsellor.specializations.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Monitor className="w-4 h-4" />
                          <span>{counsellor.session_types && counsellor.session_types.join(', ')}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Languages:</strong> {counsellor.languages && counsellor.languages.join(', ')}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => fetchCounsellorDetails(counsellor.id)}>
                          View Profile
                        </Button>
                        <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" onClick={() => handleBookNowClick(counsellor)}>
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="px-8">
              Load More Counsellors
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Counsellor Profile Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl p-0">
          {modalLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-2">Loading Counsellor Details...</p>
            </div>
          )}
          {modalError && (
            <div className="text-center p-6 text-red-500">
              <p>Error: {modalError}</p>
              <Button onClick={() => fetchCounsellorDetails(selectedCounsellor?.id || '')} className="mt-4">Retry</Button>
            </div>
          )}
          {selectedCounsellor && !modalLoading && !modalError && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative">
                <img src={selectedCounsellor.profile_photo_url} alt={selectedCounsellor.full_name} className="w-full h-full object-cover rounded-l-lg" />
                <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {`${selectedCounsellor.years_experience}${selectedCounsellor.years_experience.toLowerCase().includes('year') ? '' : ' years'}`}
                </div>
              </div>
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="font-poppins text-2xl mb-1">{selectedCounsellor.title} {selectedCounsellor.full_name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 text-muted-foreground font-source text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{selectedCounsellor.city}</div>
                      {selectedCounsellor.physical_address && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {selectedCounsellor.physical_address}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="leading-relaxed">
                    {selectedCounsellor.bio || "No biography available."}
                  </p>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Specializations:</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedCounsellor.specializations.map((spec, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span>{selectedCounsellor.availability}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Session Types:</h4>
                    <span>{selectedCounsellor.session_types && selectedCounsellor.session_types.join(', ')}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Languages:</h4>
                    <span>{selectedCounsellor.languages && selectedCounsellor.languages.join(', ')}</span>
                  </div>

                  {(selectedCounsellor.contact_email || selectedCounsellor.contact_phone) && (
                    <div className="flex items-center gap-4">
                      {selectedCounsellor.contact_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${selectedCounsellor.contact_email}`} className="hover:underline">
                            {selectedCounsellor.contact_email}
                          </a>
                        </div>
                      )}
                      {selectedCounsellor.contact_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${selectedCounsellor.contact_phone}`} className="hover:underline">
                            {selectedCounsellor.contact_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedCounsellor.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <a href={selectedCounsellor.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {selectedCounsellor.website}
                      </a>
                    </div>
                  )}
                </div>
                <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-source font-semibold">
                  Book a Session
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      {counsellorToBook && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          counsellor={counsellorToBook}
          clientInfo={{
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            category: selectedConcern,
            needs: formData.needs,
            sessionType: formData.sessionType,
            urgency: formData.urgency,
          }}
          onBookingSuccess={() => {
            // Optionally, show a toast or perform other actions after successful booking
            console.log('Booking successful from FindCounsellor page!');
            setIsBookingModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
export default FindCounsellor;
