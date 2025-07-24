import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brown text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About BSPCP */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-poppins font-semibold text-xl">BSPCP</span>
            </div>
            <p className="font-source text-cream/80 mb-6 leading-relaxed">
              Connecting individuals, couples, and families with qualified mental health professionals 
              who provide compassionate, evidence-based care throughout Botswana.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-cream/10 rounded-full flex items-center justify-center hover:bg-cream/20 transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-cream/10 rounded-full flex items-center justify-center hover:bg-cream/20 transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-cream/10 rounded-full flex items-center justify-center hover:bg-cream/20 transition-colors duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-cream/10 rounded-full flex items-center justify-center hover:bg-cream/20 transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/find-counsellor" className="font-source text-cream/80 hover:text-cream transition-colors duration-300">
                  Find a Counsellor
                </Link>
              </li>
              <li>
                <Link to="/services" className="font-source text-cream/80 hover:text-cream transition-colors duration-300">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="font-source text-cream/80 hover:text-cream transition-colors duration-300">
                  About BSPCP
                </Link>
              </li>
              <li>
                <Link to="/membership" className="font-source text-cream/80 hover:text-cream transition-colors duration-300">
                  Membership
                </Link>
              </li>
              <li>
                <Link to="/resources" className="font-source text-cream/80 hover:text-cream transition-colors duration-300">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-6">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/services/individual-therapy" className="font-source text-cream/80 hover:text-cream transition-colors duration-300">
                  Individual Therapy
                </Link>
              </li>
              <li>
                <Link to="/services/couples-counselling" className="font-source text-cream/80 hover:text-cream transition-colors duration-300">
                  Couples Counselling
                </Link>
              </li>
              <li>
                <Link to="/services/family-therapy" className="font-source text-cream/80 hover:text-cream transition-colors duration-300">
                  Family Therapy
                </Link>
              </li>
              <li>
                <Link to="/services/child-teen-support" className="font-source text-cream/80 hover:text-cream transition-colors duration-300">
                  Child & Teen Support
                </Link>
              </li>
              <li>
                <Link to="/services/online-counselling" className="font-source text-cream/80 hover:text-cream transition-colors duration-300">
                  Online Counselling
                </Link>
              </li>
              <li>
                <Link to="/services/trauma-crisis" className="font-source text-cream/80 hover:text-cream transition-colors duration-300">
                  Trauma & Crisis
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-source text-cream/80">
                  Plot 123, Main Mall<br />
                  Gaborone, Botswana
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="font-source text-cream/80">+267 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-source text-cream/80">info@bspcp.org.bw</span>
              </li>
            </ul>
            
            <div className="mt-6 p-4 bg-destructive/20 rounded-lg">
              <h4 className="font-poppins font-semibold text-sm mb-2">Emergency Support</h4>
              <p className="font-source text-xs text-cream/80 mb-2">
                If you're in crisis, help is available 24/7
              </p>
              <p className="font-source font-bold text-destructive">
                Crisis Hotline: 16222
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="font-source text-cream/60 text-sm">
              © 2024 Botswana Society for Professional Counsellors & Psychotherapists. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="font-source text-cream/60 hover:text-cream text-sm transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms" className="font-source text-cream/60 hover:text-cream text-sm transition-colors duration-300">
                Terms of Service
              </Link>
              <Link to="/accessibility" className="font-source text-cream/60 hover:text-cream text-sm transition-colors duration-300">
                Accessibility
              </Link>
              <Link to="/admin" className="font-source text-cream/60 hover:text-cream text-sm transition-colors duration-300">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;