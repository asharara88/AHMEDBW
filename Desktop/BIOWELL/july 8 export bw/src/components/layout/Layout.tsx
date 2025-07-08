import { useState, ReactNode } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import FloatingChatButton from '../chat/FloatingChatButton';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, loading } = useAuth();
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden max-w-full">
      <Navbar />
      <div className="w-full bg-background-alt py-2 px-4 text-center text-xs sm:text-sm text-text-light">
        <div className="container mx-auto">
          <div className="relative">
            <p>
              Disclaimer: Biowell's Personal Digital Coach is a digital wellness tool for informational purposes only.
              <button 
                onClick={() => setShowFullDisclaimer(!showFullDisclaimer)}
                className="ml-1 font-medium text-primary hover:underline focus:outline-none"
                aria-expanded={showFullDisclaimer}
                aria-controls="disclaimer-panel"
              >
                (learn more)
                {showFullDisclaimer ? 
                  <ChevronUp className="ml-1 inline-block h-3 w-3" /> : 
                  <ChevronDown className="ml-1 inline-block h-3 w-3" />
                }
              </button>
            </p>
            
            {showFullDisclaimer && (
              <div 
                id="disclaimer-panel"
                className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-[hsl(var(--color-border))] bg-background p-6 text-left shadow-lg"
              >
                <p className="mb-3">
                  Biowell is a digital wellness and health optimization platform. The information, insights, and supplement recommendations provided by Biowell are intended for general wellness support and educational purposes only.
                </p>
                <p className="mb-3">
                  Biowell does not offer medical advice, diagnosis, or treatment. Nothing on this platform should be considered a substitute for professional medical consultation, diagnosis, or care from a qualified healthcare provider.
                </p>
                <p className="mb-3">
                  Always consult your physician or other qualified healthcare professionals before making changes to your diet, exercise, supplement routine, or overall health program, especially if you are pregnant, nursing, have a medical condition, or are taking any medications.
                </p>
                <p className="mb-3">
                  Use of Biowell is at your own discretion and risk.
                </p>
                <button 
                  onClick={() => setShowFullDisclaimer(false)}
                  className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 overflow-x-hidden max-w-full">
        {children}
      </main>
      <Footer />
      {user && <FloatingChatButton />}
    </div>
  );
};

export default Layout;