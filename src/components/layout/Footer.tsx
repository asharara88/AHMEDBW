import { Link } from 'react-router-dom';
import { Heart, Mail, Github as GitHub, Twitter } from 'lucide-react';
import Logo from '../common/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[hsl(var(--color-border))] bg-background-alt py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <Logo className="mb-4" />
            <p className="text-sm text-text-light">
              Personalized health optimization through data-driven insights and evidence-based recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-text-light hover:text-primary">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-sm text-text-light hover:text-primary">
                  MyCoach
                </Link>
              </li>
              <li>
                <Link to="/supplements" className="text-sm text-text-light hover:text-primary">
                  Supplements
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-text-light hover:text-primary">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-1">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/how-it-works" className="text-sm text-text-light hover:text-primary">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-text-light hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-text-light hover:text-primary">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-text-light hover:text-primary">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-1">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@biowell.ai"
                  className="flex items-center text-sm text-text-light hover:text-primary"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  support@biowell.ai
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-text-light hover:text-primary"
                >
                  <Twitter className="mr-2 h-4 w-4" />
                  @biowellai
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-text-light hover:text-primary"
                >
                  <GitHub className="mr-2 h-4 w-4" />
                  github.com/biowell
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[hsl(var(--color-border))] pt-8 text-center">
          <p className="text-sm text-text-light">
            &copy; {currentYear} Biowell AI. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link to="/privacy" className="text-xs text-text-light hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-text-light hover:text-primary">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-xs text-text-light hover:text-primary">
              Cookie Policy
            </Link>
          </div>
          <p className="mt-4 flex items-center justify-center text-xs text-text-light">
            Made with <Heart className="mx-1 h-3 w-3 text-error" /> by the Biowell Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;