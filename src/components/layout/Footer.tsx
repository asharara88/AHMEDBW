import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] py-8" role="contentinfo">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Logo className="mb-4 w-24 sm:w-32" />
            <p className="text-text-light">Your personal digital health coach</p>
          </div>
          
          <nav aria-label="Footer Product Links">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-light">Product</h3>
            <ul className="space-y-3 text-base">
              <li><Link to="/features" className="text-text-light transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Features</Link></li>
              <li><Link to="/pricing" className="text-text-light transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Pricing</Link></li>
              <li><Link to="/faq" className="text-text-light transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">FAQ</Link></li>
              <li><Link to="/reviews" className="text-text-light transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Reviews</Link></li>
            </ul>
          </nav>
          
          <nav aria-label="Footer Legal Links">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-light">Legal</h3>
            <ul className="space-y-3 text-base">
              <li>
                <Link to="/terms" className="text-text-light transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-text-light transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  Privacy Policy
                </Link>
              </li>
              <li><Link to="/about" className="text-text-light transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">About Us</Link></li>
              <li><Link to="/blog" className="text-text-light transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Blog</Link></li>
            </ul>
          </nav>
        </div>
        
        <div className="mt-8 border-t border-[hsl(var(--color-border))] pt-8 text-center text-base text-text-light">
          <p>&copy; {currentYear} Biowell Health, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;