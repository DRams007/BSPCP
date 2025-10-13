import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import bspcpLogo from '@/assets/d33be909-25aa-4725-8b88-0ed0fa9a41d5.png';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigationItems = [{
    name: 'Home',
    href: '/'
  }, {
    name: 'About BSPCP',
    href: '/about'
  }, {
    name: 'Find a Counsellor',
    href: '/find-counsellor'
  }, {
    name: 'Membership',
    href: '/membership'
  }, {
    // name: 'Resources',
    // href: '/resources'
  /*}, {*/ // Commented out Resources link as per user request
    name: 'News,Resources & Events',
    href: '/news-events'
  }, {
    name: 'Contact',
    href: '/contact'
  }, {
    name: 'Member Login',
    href: '/member-login'
  }];
  
  const isActive = (path: string) => location.pathname === path;

  const handleGetHelpClick = () => {
    // Navigate first
    navigate('/find-counsellor#tell-us-about-your-needs');

    // Use timeout to ensure navigation completes before scrolling
    setTimeout(() => {
      const element = document.getElementById('tell-us-about-your-needs');
      if (element) {
        const headerOffset = 80; // Account for sticky navigation height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);

    setIsMenuOpen(false); // Close mobile menu if open
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center mr-12">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={bspcpLogo}
                alt="BSPCP Logo"
                className="h-10 right-5"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center h-full">
            {navigationItems.map(item => (
              <Link 
                key={item.name} 
                to={item.href} 
                className={`font-source text-sm font-medium transition-colors duration-200 px-6 py-4 h-full flex items-center justify-center text-center ${
                  isActive(item.href) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground hover:text-primary hover:bg-primary/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Emergency Contact & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              
              
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-source font-medium mx-0"
              onClick={handleGetHelpClick}
            >
              Get Help Now
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-foreground"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map(item => (
              <Link 
                key={item.name} 
                to={item.href} 
                className={`block px-3 py-2 text-base font-medium transition-colors duration-200 text-center ${
                  isActive(item.href) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground hover:text-primary hover:bg-primary/10'
                }`} 
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-3">
                <Phone className="w-4 h-4" />
                <span>Emergency: 16222</span>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-source font-medium"
                onClick={handleGetHelpClick}
              >
                Get Help Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
