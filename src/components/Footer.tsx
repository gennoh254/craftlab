import React from 'react';
import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 text-xl font-bold text-yellow-400 mb-4">
              <Briefcase className="h-6 w-6" />
              <span>CraftLab</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Empowering the next generation through AI-driven career development. 
              Connect with meaningful opportunities and build your professional future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-yellow-400 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="/register" className="hover:text-white transition-colors">Get Started</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-yellow-400 font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>hello@craftlab.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+254 746 129446</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 CraftLab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;