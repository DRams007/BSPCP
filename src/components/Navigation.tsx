import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
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
  return <nav className="bg-background/95 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-50 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center mr-12">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/lovable-uploads/d33be909-25aa-4725-8b88-0ed0fa9a41d5.png" alt="BSPCP Logo" className="h-10 right-5" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map(item => <Link key={item.name} to={item.href} className={`font-source text-sm font-semibold transition-all duration-300 px-3 py-2 rounded-lg relative ${isActive(item.href) ? 'text-primary bg-primary/10 shadow-sm' : 'text-foreground hover:text-primary hover:bg-primary/5'}`}>
                {item.name}
              </Link>)}
          </div>

          {/* Emergency Contact & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>Emergency: 16222</span>
            </div>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-source font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Get Help Now
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-foreground">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && <div className="lg:hidden border-t border-primary/20 bg-background/95 backdrop-blur-sm">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navigationItems.map(item => <Link key={item.name} to={item.href} className={`block px-4 py-3 text-base font-semibold transition-all duration-300 rounded-lg ${isActive(item.href) ? 'text-primary bg-primary/10 shadow-sm' : 'text-foreground hover:text-primary hover:bg-primary/5'}`} onClick={() => setIsMenuOpen(false)}>
                {item.name}
              </Link>)}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-3">
                <Phone className="w-4 h-4" />
                <span>Emergency: 16222</span>
              </div>
              <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-source font-semibold shadow-lg transition-all duration-300" onClick={() => setIsMenuOpen(false)}>
                Get Help Now
              </Button>
            </div>
          </div>
        </div>}
    </nav>;
};
export default Navigation;