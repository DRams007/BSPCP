import { useState } from 'react';
import { Menu, X, Phone, Heart } from 'lucide-react';

// This is a self-contained React component that combines the provided navigation logic
// with the new styling.
export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState('/');

  // Replaces useLocation for a runnable example in this environment
  const isActive = (path) => activePath === path;

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Find a Counsellor', href: '/find-counsellor' },
    { name: 'About BSPCP', href: '/about' },
    { name: 'Services & Information', href: '/services' },
    { name: 'Membership', href: '/membership' },
    { name: 'Resources', href: '/resources' },
    { name: 'News & Events', href: '/news-events' },
    { name: 'Contact', href: '/contact' }
  ];

  const handleLinkClick = (path) => {
    setActivePath(path);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-[#E4DBCF] shadow-lg w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center mr-12">
          {/* Replaced Link with a simple div for a self-contained example */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleLinkClick('/')}>
            {/* Using a placeholder for the logo image */}
            <span className="text-2xl font-bold text-[#4B3C35] tracking-wide">
              <span className="text-[#E76C3E]">Your</span>Org
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-grow items-center justify-between">
          <ul className="flex space-x-0 items-stretch h-16">
            {navigationItems.map(item => (
              <li key={item.name} className={`${isActive(item.href) ? 'bg-[#E76C3E]' : ''} h-full`}>
                <a
                  href="#"
                  onClick={() => handleLinkClick(item.href)}
                  className={`h-full flex items-center px-4 font-semibold transition-colors duration-300 ${isActive(item.href) ? 'text-[#4B3C35]' : 'text-[#4B3C35] hover:bg-white'}`}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        

          {/* Emergency Contact & CTA */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-[#4B3C35]">
              <Phone className="w-4 h-4" />
            
            </div>
            {/* Styled a plain button to look like the design */}
            <button className="bg-[#E76C3E] hover:bg-[#D45E36] text-[#4B3C35] font-semibold py-2 px-4 rounded-full shadow-lg transition-colors duration-300">
              Get Help Now
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[#4B3C35] focus:outline-none focus:text-[#E76C3E]"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-[#D4CBBF] bg-[#D4CBBF]">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map(item => (
              <a
                key={item.name}
                href="#"
                onClick={() => handleLinkClick(item.href)}
                className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${isActive(item.href) ? 'bg-[#E76C3E] text-[#4B3C35]' : 'text-[#4B3C35] hover:bg-white'}`}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4 border-t border-[#D4CBBF]">
              <div className="flex items-center justify-center space-x-2 text-sm text-[#4B3C35] mb-3">
                <Phone className="w-4 h-4" />
                <span>Emergency: 16222</span>
              </div>
              <button className="w-full bg-[#E76C3E] hover:bg-[#D45E36] text-[#4B3C35] font-semibold py-2 px-4 rounded-full transition-colors duration-300">
                Get Help Now
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
