import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] py-8">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Logo className="mb-4 w-24 sm:w-32" />
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-light">Product</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/features" className="text-text-light transition-colors hover:text-primary">Features</Link></li>
              <li><Link to="/pricing" className="text-text-light transition-colors hover:text-primary">Pricing</Link></li>
              <li><Link to="/faq" className="text-text-light transition-colors hover:text-primary">FAQ</Link></li>
              <li><Link to="/reviews" className="text-text-light transition-colors hover:text-primary">Reviews</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-light">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/terms" className="text-text-light transition-colors hover:text-primary">Terms of Service</Link></li>
              <li>
                <Link to="/privacy" className="text-text-light transition-colors hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li><Link to="/about" className="text-text-light transition-colors hover:text-primary">About Us</Link></li>
              <li><Link to="/blog" className="text-text-light transition-colors hover:text-primary">Blog</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-[hsl(var(--color-border))] pt-8 text-center text-sm text-text-light">
          <p>&copy; {currentYear} Biowell Health, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;