import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const navigationItems = [{
    name: 'Home',
    href: '/'
  }, {
    name: 'Find a Counsellor',
    href: '/find-counsellor'
  }, {
    name: 'About BSPCP',
    href: '/about'
  }, {
    name: 'Services & Information',
    href: '/services'
  }, {
    name: 'Membership',
    href: '/membership'
  }, {
    name: 'Resources',
    href: '/resources'
  }, {
    name: 'News & Events',
    href: '/news-events'
  }, {
    name: 'Contact',
    href: '/contact'
  }];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center mr-12">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/d33be909-25aa-4725-8b88-0ed0fa9a41d5.png" 
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
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-source font-medium mx-0">
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
                onClick={() => setIsMenuOpen(false)}
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