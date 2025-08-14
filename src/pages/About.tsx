import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Award, Heart, TrendingUp, Target, Eye, Shield, BookOpen, Calendar, FileText, Building, MapPin, Phone, Mail, Globe, CheckCircle, Star, Briefcase, GraduationCap, Clock, ArrowRight, Home, ChevronRight, Download, ExternalLink, Search, HandHeart, Building2, Scale, Lightbulb, Zap, TreePine } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import leaderKeabetswe from '@/assets/leader-keabetswe.jpg';
import leaderTshepo from '@/assets/leader-tshepo.jpg';
import leaderGoitseone from '@/assets/leader-goitseone.jpg';
import leaderJohn from '@/assets/leader-john.jpg';
const About = () => {
  const navigate = useNavigate();
  const stats = [{
    icon: Users,
    value: '150+',
    label: 'Registered Professionals',
    description: 'Licensed mental health experts'
  }, {
    icon: Award,
    value: '15+',
    label: 'Years of Service',
    description: 'Advancing mental health in Botswana'
  }, {
    icon: Heart,
    value: '5,000+',
    label: 'People Served',
    description: 'Lives improved annually'
  }, {
    icon: Building2,
    value: '12',
    label: 'Districts Covered',
    description: 'Nationwide professional presence'
  }, {
    icon: CheckCircle,
    value: '100%',
    label: 'Qualified Members',
    description: 'Meeting strict professional standards'
  }, {
    icon: TrendingUp,
    value: '95%',
    label: 'Client Satisfaction',
    description: 'Consistently high-quality care'
  }];
  const values = [{
    icon: Shield,
    title: 'Professional Excellence',
    description: 'We are committed to maintaining the highest standards of professional practice, ensuring that our members provide evidence-based, effective interventions that meet international best practices.'
  }, {
    icon: Scale,
    title: 'Integrity & Ethics',
    description: 'We uphold the highest ethical standards in all our operations, ensuring transparency, honesty, and accountability in our work with clients, members, and the public.'
  }, {
    icon: TreePine,
    title: 'Cultural Sensitivity',
    description: 'We recognize and respect the rich cultural diversity of Botswana, ensuring that mental health services are culturally appropriate and accessible to all communities.'
  }, {
    icon: HandHeart,
    title: 'Accessibility & Inclusion',
    description: 'We believe that quality mental health care should be accessible to all Batswana, regardless of economic status, geographic location, or background.'
  }, {
    icon: BookOpen,
    title: 'Continuous Learning',
    description: 'We promote lifelong learning and professional development, ensuring that our members stay current with evolving best practices and research.'
  }, {
    icon: Users,
    title: 'Collaboration & Partnership',
    description: 'We work collaboratively with government, healthcare providers, educational institutions, and other stakeholders to improve mental health outcomes in Botswana.'
  }];
  const leadership = [{
    name: 'Dr. Keabetswe Moeti',
    position: 'President',
    credentials: 'PhD Psychology (University of Cape Town)',
    experience: '15+ years',
    description: 'Clinical psychologist specializing in trauma therapy with extensive experience in developing mental health policies in Botswana.',
    image: leaderKeabetswe
  }, {
    name: 'Tshepo Kgathi',
    position: 'Vice President',
    credentials: 'MA Counselling Psychology (University of Botswana)',
    experience: '12+ years',
    description: 'Dedicated to family therapy and community mental health, leading numerous community outreach programs.',
    image: leaderTshepo
  }, {
    name: 'Mrs. Goitseone Sebina',
    position: 'Secretary General',
    credentials: 'MSW (University of Witwatersrand)',
    experience: '10+ years',
    description: 'Licensed Clinical Social Worker with extensive experience in organizational development and professional standards.',
    image: leaderGoitseone
  }, {
    name: 'John Mogomotsi',
    position: 'Treasurer',
    credentials: 'MA Psychology (University of Botswana)',
    experience: '8+ years',
    description: 'Licensed Professional Counsellor with background in both clinical practice and business management.',
    image: leaderJohn
  }];
  const milestones = [{
    year: '2009',
    title: 'BSPCP Founded',
    description: 'Established by dedicated mental health professionals to elevate counselling standards in Botswana',
    period: 'Foundation & Early Years'
  }, {
    year: '2013',
    title: 'First Annual Conference',
    description: 'Hosted our inaugural conference with 120 attendees, establishing professional development traditions',
    period: 'Growth & Recognition'
  }, {
    year: '2014',
    title: 'University Partnership',
    description: 'Established partnership with University of Botswana for student placements and training',
    period: 'Growth & Recognition'
  }, {
    year: '2015',
    title: 'Ministry Recognition',
    description: 'Officially recognized by Ministry of Health as professional association',
    period: 'Growth & Recognition'
  }, {
    year: '2016',
    title: 'CPD Program Launch',
    description: 'Launched Continuing Professional Development program for ongoing member training',
    period: 'Growth & Recognition'
  }, {
    year: '2020',
    title: 'Online Services Launch',
    description: 'Developed telehealth guidelines and online counselling standards during COVID-19',
    period: 'Digital Transformation'
  }, {
    year: '2022',
    title: 'Youth Mental Health Initiative',
    description: 'Established specialized programs addressing mental health needs of young people',
    period: 'Digital Transformation'
  }, {
    year: '2024',
    title: 'International Partnerships',
    description: 'Formed partnerships with international professional associations for knowledge exchange',
    period: 'Digital Transformation'
  }, {
    year: '2025',
    title: 'Comprehensive Digital Platform',
    description: 'Launch of our modern online platform connecting Batswana with qualified mental health professionals',
    period: 'Digital Transformation'
  }];
  const subNavigation = [{
    id: 'overview',
    label: 'Overview'
  }, {
    id: 'story',
    label: 'Our Story'
  }, {
    id: 'leadership',
    label: 'Leadership'
  }, {
    id: 'standards',
    label: 'Standards'
  }, {
    id: 'impact',
    label: 'Impact'
  }, {
    id: 'reports',
    label: 'Reports'
  }];
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Breadcrumb */}
      

      {/* Hero Section */}
      <section className="py-20 bg-gradient-warm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-poppins font-bold text-4xl md:text-6xl mb-6">
              Advancing Mental Health Care in Botswana
            </h1>
            <p className="font-source text-xl text-cream/90 max-w-4xl mx-auto mb-8">
              The Botswana Society of Professional Counsellors and Psychotherapists (BSPCP) is the leading 
              professional association dedicated to promoting excellence in mental health services across our nation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-cream">
                Find a Professional Counsellor
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white bg-[#86995c]">
                Join Our Community
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sub Navigation */}
      <section className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <nav className="flex gap-8 py-4 overflow-x-auto">
            {subNavigation.map(item => <a key={item.id} href={`#${item.id}`} className="font-source font-medium text-muted-foreground hover:text-primary transition-colors duration-200 whitespace-nowrap">
                {item.label}
              </a>)}
          </nav>
        </div>
      </section>

      {/* Organization Overview */}
      <section id="overview" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-6">
                Who We Are
              </h2>
              <div className="space-y-4 font-source text-lg text-muted-foreground leading-relaxed">
                <p>
                  The Botswana Society of Professional Counsellors and Psychotherapists (BSPCP) is a registered 
                  professional association under the Botswana Societies Act, dedicated to advancing the field of 
                  mental health counselling and psychotherapy in Botswana.
                </p>
                <p>
                  Since our establishment in 2009, we have been the voice of professional counsellors and 
                  psychotherapists, working tirelessly to ensure that every Motswana has access to quality 
                  mental health services.
                </p>
              </div>
            </div>
            <Card className="p-8">
              <h3 className="font-poppins font-bold text-xl mb-6 text-foreground">Our Role in Botswana</h3>
              <div className="space-y-4">
                {[{
                icon: Shield,
                title: 'Professional Standards Guardian',
                desc: 'Establishing and maintaining the highest standards of practice'
              }, {
                icon: HandHeart,
                title: 'Public Protection',
                desc: 'Ensuring counsellors meet rigorous qualification and ethical standards'
              }, {
                icon: Users,
                title: 'Service Bridge',
                desc: 'Connecting individuals and families with qualified professionals'
              }, {
                icon: Briefcase,
                title: 'Advocacy Champion',
                desc: 'Advocating for mental health awareness and policy development'
              }].map((role, index) => <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                      <role.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-source font-semibold text-foreground">{role.title}</h4>
                      <p className="font-source text-sm text-muted-foreground">{role.desc}</p>
                    </div>
                  </div>)}
              </div>
            </Card>
          </div>

          {/* Mission, Vision & Values */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-bold text-xl mb-4">Our Mission</h3>
                <p className="font-source text-muted-foreground leading-relaxed">
                  To promote excellence in mental health counselling and psychotherapy services in Botswana by 
                  setting professional standards, supporting qualified practitioners, and ensuring public access 
                  to quality mental health care.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-8 h-8 text-terracotta" />
                </div>
                <h3 className="font-poppins font-bold text-xl mb-4">Our Vision</h3>
                <p className="font-source text-muted-foreground leading-relaxed">
                  A Botswana where every person has access to professional, ethical, and effective mental health 
                  support, contributing to the overall well-being and development of our nation.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-dusty/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-dusty" />
                </div>
                <h3 className="font-poppins font-bold text-xl mb-4">Our Values</h3>
                <p className="font-source text-muted-foreground leading-relaxed">
                  Professional excellence, integrity & ethics, cultural sensitivity, accessibility & inclusion, 
                  continuous learning, and collaboration guide everything we do.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics - Our Impact */}
      <section id="impact" className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Our Impact by the Numbers
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-3xl mx-auto">
              Over 15 years, we've built a comprehensive network of mental health professionals 
              dedicated to serving every district in Botswana with excellence and compassion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.map((stat, index) => <Card key={index} className="text-center group hover:shadow-soft transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="font-poppins font-bold text-3xl text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="font-source font-semibold text-foreground mb-2">
                    {stat.label}
                  </div>
                  <p className="font-source text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>)}
          </div>

          {/* Success Stories */}
          <div className="mt-20">
            <h3 className="font-poppins font-bold text-2xl text-center text-foreground mb-12">
              Success Stories & Impact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-poppins font-semibold text-lg mb-2">Rural Mental Health Access</h4>
                  <p className="font-source text-muted-foreground text-sm mb-4">
                    Trained 25 community counsellors in remote districts, resulting in 60% increase 
                    in mental health service utilization in rural areas.
                  </p>
                  <Badge variant="secondary">Community Impact</Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-terracotta/10 rounded-full flex items-center justify-center mb-4">
                    <GraduationCap className="w-6 h-6 text-terracotta" />
                  </div>
                  <h4 className="font-poppins font-semibold text-lg mb-2">Youth Mental Health Initiative</h4>
                  <p className="font-source text-muted-foreground text-sm mb-4">
                    School-based counselling programs and peer support training led to 40% reduction 
                    in school dropout rates in participating schools.
                  </p>
                  <Badge variant="secondary">Education Impact</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-dusty/10 rounded-full flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-dusty" />
                  </div>
                  <h4 className="font-poppins font-semibold text-lg mb-2">COVID-19 Response</h4>
                  <p className="font-source text-muted-foreground text-sm mb-4">
                    Rapid deployment of online counselling services maintained service continuity 
                    for 85% of clients during lockdowns.
                  </p>
                  <Badge variant="secondary">Crisis Response</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-3xl mx-auto">
              These fundamental principles guide our work and shape how we serve our community, 
              ensuring that every interaction reflects our commitment to excellence and compassion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => <Card key={index} className="group hover:shadow-soft transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">
                        {value.title}
                      </h3>
                      <p className="font-source text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section id="leadership" className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Executive Leadership Team
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-3xl mx-auto">
              Meet the experienced professionals who guide BSPCP's mission and vision, bringing decades 
              of combined experience in mental health care, organizational leadership, and community service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {leadership.map((leader, index) => <Card key={index} className="group hover:shadow-soft transition-all duration-300 overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative flex-shrink-0">
                      <img src={leader.image} alt={leader.name} className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-primary/90 text-primary-foreground">
                          {leader.experience}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-poppins font-bold text-xl text-foreground mb-2">
                        {leader.name}
                      </h3>
                      <p className="font-source text-primary font-semibold mb-2">
                        {leader.position}
                      </p>
                      <p className="font-source text-sm text-muted-foreground mb-3">
                        {leader.credentials}
                      </p>
                      <p className="font-source text-sm text-foreground leading-relaxed">
                        {leader.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>

          {/* Board & Advisory Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card>
              <CardContent className="p-8">
                <h3 className="font-poppins font-bold text-xl text-foreground mb-6">Board of Directors</h3>
                <div className="space-y-4">
                  {['Prof. Michael Setlhare - University of Botswana, Department of Psychology', 'Dr. Mpho Kgalemang - Former Director, Mental Health Services, Ministry of Health', 'Mrs. Boitumelo Mokgosi - CEO, Botswana Red Cross Society', 'Dr. James Moffat - Consultant Psychiatrist, Princess Marina Hospital'].map((member, index) => <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <p className="font-source text-sm text-muted-foreground">{member}</p>
                    </div>)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h3 className="font-poppins font-bold text-xl text-foreground mb-6">Regional Representatives</h3>
                <div className="space-y-4">
                  {[{
                  region: 'Northern Region',
                  areas: 'Maun, Kasane, Shakawe'
                }, {
                  region: 'Eastern Region',
                  areas: 'Francistown, Selebi-Phikwe, Sowa'
                }, {
                  region: 'Central Region',
                  areas: 'Gaborone, Molepolole, Mochudi'
                }, {
                  region: 'Southern Region',
                  areas: 'Kanye, Jwaneng, Tsabong'
                }].map((rep, index) => <div key={index}>
                      <p className="font-source font-semibold text-foreground">{rep.region}</p>
                      <p className="font-source text-sm text-muted-foreground">{rep.areas}</p>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story - History Timeline */}
      <section id="story" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Our Story
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-3xl mx-auto">
              From humble beginnings with 15 founding members to becoming Botswana's leading mental health 
              professional body with over 150 qualified professionals serving every district.
            </p>
          </div>

          {/* Timeline by periods */}
          <div className="space-y-16">
            {['Foundation & Early Years', 'Growth & Recognition', 'Digital Transformation'].map((period, periodIndex) => <div key={period} className="space-y-8">
                <div className="text-center">
                  <h3 className="font-poppins font-bold text-2xl text-foreground mb-2">{period}</h3>
                  <Separator className="w-24 mx-auto" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {milestones.filter(m => m.period === period).map((milestone, index) => <Card key={index} className="hover:shadow-soft transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                            <Calendar className="w-6 h-6 text-primary" />
                          </div>
                          <div className="font-poppins font-bold text-xl text-primary">
                            {milestone.year}
                          </div>
                        </div>
                        <h4 className="font-poppins font-semibold text-lg text-foreground mb-3">
                          {milestone.title}
                        </h4>
                        <p className="font-source text-muted-foreground leading-relaxed">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>)}
                </div>
              </div>)}
          </div>

          {/* Future Vision */}
          <div className="mt-20 text-center">
            <Card className="bg-gradient-gentle">
              <CardContent className="p-12">
                <Lightbulb className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                  Looking Forward: Strategic Vision 2025-2030
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  {[{
                  icon: Users,
                  title: 'Expand Network',
                  desc: '300+ professionals nationwide'
                }, {
                  icon: Globe,
                  title: 'Enhance Access',
                  desc: 'Comprehensive online platform'
                }, {
                  icon: Award,
                  title: 'Strengthen Standards',
                  desc: 'Advanced certification programs'
                }, {
                  icon: Briefcase,
                  title: 'Policy & Advocacy',
                  desc: 'Mental health legislation advancement'
                }].map((goal, index) => <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <goal.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-source font-semibold text-foreground mb-2">{goal.title}</h4>
                      <p className="font-source text-sm text-muted-foreground">{goal.desc}</p>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Professional Standards */}
      <section id="standards" className="py-20 bg-gradient-gentle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Professional Standards & Ethics
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-3xl mx-auto">
              We maintain the highest standards of professional practice and ethical conduct, ensuring 
              that every member meets rigorous qualification requirements and adheres to our comprehensive code of ethics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-poppins font-bold text-xl">Core Ethical Principles</h3>
                </div>
                <div className="space-y-4">
                  {[{
                  title: 'Respect for Persons',
                  desc: 'Acknowledge inherent dignity and worth of all individuals'
                }, {
                  title: 'Competence',
                  desc: 'Practice only within areas of expertise and maintain current knowledge'
                }, {
                  title: 'Integrity',
                  desc: 'Be honest and truthful in all professional relationships'
                }, {
                  title: 'Confidentiality',
                  desc: 'Protect client privacy and maintain secure records'
                }, {
                  title: 'Social Responsibility',
                  desc: 'Contribute to welfare of society and promote mental health awareness'
                }].map((principle, index) => <div key={index} className="border-l-2 border-primary/20 pl-4">
                      <h4 className="font-source font-semibold text-foreground">{principle.title}</h4>
                      <p className="font-source text-sm text-muted-foreground">{principle.desc}</p>
                    </div>)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-terracotta/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-terracotta" />
                  </div>
                  <h3 className="font-poppins font-bold text-xl">Professional Requirements</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-source font-semibold text-foreground mb-2">Educational Requirements</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Minimum Bachelor's degree in Psychology, Counselling, or related field</li>
                      <li>• Specialized training in counselling or psychotherapy (minimum 1 year)</li>
                      <li>• Completion of supervised practicum (minimum 480 hours)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-source font-semibold text-foreground mb-2">Experience Requirements</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Full Members: Minimum 2 years supervised practice</li>
                      <li>• Associate Members: Currently in training or first year</li>
                      <li>• Continuing Education: 40 hours annually for full members</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-4">Code of Ethics</h3>
                <p className="font-source text-muted-foreground mb-6">
                  Comprehensive ethical guidelines covering professional conduct, client relationships, 
                  and social responsibility.
                </p>
                <Button variant="outline" className="group" asChild>
                  <Link to="/code-of-ethics">
                    <FileText className="w-4 h-4 mr-2 group-hover:scale-105 transition-transform" />
                    View Code of Ethics
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-terracotta" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-4">CPD Program</h3>
                <p className="font-source text-muted-foreground mb-6">
                  40 hours annual requirement through workshops, conferences, supervision, 
                  and professional development activities.
                </p>
                <Button variant="outline" className="group">
                  <ExternalLink className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-dusty/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Scale className="w-8 h-8 text-dusty" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-4">Quality Assurance</h3>
                <p className="font-source text-muted-foreground mb-6">
                  Annual membership review, peer evaluation systems, client feedback mechanisms, 
                  and ethical compliance monitoring.
                </p>
                <Button variant="outline" className="group">
                  <FileText className="w-4 h-4 mr-2 group-hover:scale-105 transition-transform" />
                  View Process
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Reports & Transparency */}
      <section id="reports" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-foreground mb-4">
              Transparency & Accountability
            </h2>
            <p className="font-source text-lg text-muted-foreground max-w-3xl mx-auto">
              We believe in transparency and accountability. Access our annual reports, financial statements, 
              and impact assessments to understand how we serve the mental health community in Botswana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-4">Annual Reports</h3>
                <p className="font-source text-muted-foreground mb-6">
                  Comprehensive annual reports covering activities, achievements, financial performance, 
                  and strategic progress.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">2024 Annual Report</Button>
                  <Button variant="ghost" size="sm" className="w-full">Previous Years</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-terracotta/20 transition-colors duration-300">
                  <Search className="w-8 h-8 text-terracotta" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-4">Impact Reports</h3>
                <p className="font-source text-muted-foreground mb-6">
                  Detailed analysis of our impact on mental health outcomes, community reach, 
                  and professional development achievements.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">View Impact Data</Button>
                  <Button variant="ghost" size="sm" className="w-full">Research Publications</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-soft transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-dusty/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-dusty/20 transition-colors duration-300">
                  <Building className="w-8 h-8 text-dusty" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-4">Legal Status</h3>
                <p className="font-source text-muted-foreground mb-6">
                  Registration details, legal compliance documentation, and regulatory information 
                  under the Botswana Societies Act.
                </p>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    Registration: BW00001234
                  </Badge>
                  <Button variant="ghost" size="sm" className="w-full">View Legal Documents</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact & Engagement */}
          <div className="mt-20">
            <Card className="bg-gradient-gentle">
              <CardContent className="p-12 text-center">
                <HandHeart className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="font-poppins font-bold text-2xl text-foreground mb-6">
                  Get Involved with BSPCP
                </h3>
                <p className="font-source text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Whether you're seeking mental health support, interested in joining our professional community, 
                  or want to partner with us, we're here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="group" onClick={() => navigate('/find-counsellor')}>
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
                    Find a Counsellor
                  </Button>
                  <Button size="lg" variant="outline" className="group" onClick={() => navigate('/membership')}>
                    <Users className="w-4 h-4 mr-2 group-hover:scale-105 transition-transform" />
                    Apply for Membership
                  </Button>
                  <Button size="lg" variant="ghost" className="group">
                    <Phone className="w-4 h-4 mr-2 group-hover:ring-2 group-hover:ring-primary/20 rounded transition-all" />
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default About;