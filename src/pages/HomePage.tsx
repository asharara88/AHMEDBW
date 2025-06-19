import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Shield, Watch, Brain, MessageCircle, CheckCircle, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ConnectCard from '../components/home/ConnectCard';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { user, startDemo } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleDemoClick = () => {
    startDemo();
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  // Toggle tooltip visibility
  const toggleTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(!showTooltip);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        buttonRef.current && 
        !tooltipRef.current.contains(event.target as Node) && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="overflow-x-hidden max-w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-background-alt py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-sm text-primary relative">
                <Shield className="h-4 w-4" />
                <span>Evidence-based health optimization</span>
                <button 
                  ref={buttonRef}
                  className="ml-1 rounded-full p-1 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onClick={toggleTooltip}
                  aria-label="Learn more about evidence-based approach"
                >
                  <Info className="h-3.5 w-3.5 text-primary" />
                </button>
                
                {/* Tooltip */}
                {showTooltip && (
                  <div 
                    ref={tooltipRef}
                    className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-[hsl(var(--color-border))] bg-background p-6 text-left shadow-lg"
                  >
                    <p className="mb-3">
                      Evidence-based means our recommendations draw directly from validated scientific research and peer-reviewed studies conducted by world-leading experts and top academic institutions.
                    </p>
                    <p className="mb-3">
                      We thoroughly review the latest clinical trials, meta-analyses, and authoritative publications to guarantee accuracy, reliability, and practical effectiveness—empowering you to make confident, informed health decisions.
                    </p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTooltip(false);
                      }}
                      className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>

              <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white text-center md:text-4xl">
                Your Personal <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">Health Coach</span>.
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-sm text-gray-600 dark:text-gray-300 text-center md:text-base">
                Transform your health with personalized insights and evidence-based recommendations.
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-dark sm:w-auto"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleGetStarted}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-dark sm:w-auto"
                    >
                      Get Started
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                      onClick={handleDemoClick}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-8 py-4 text-lg font-semibold transition-all hover:bg-[hsl(var(--color-card-hover))] sm:w-auto"
                    >
                      Try Demo
                      <Activity className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">How It Works</h2>
            <p className="mx-auto max-w-2xl text-text-light">
              Our platform combines cutting-edge technology with evidence-based health science to help you achieve optimal wellness.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <ConnectCard />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group flex h-full flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex flex-1 flex-col justify-between bg-[hsl(var(--color-card))] p-6">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Brain className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">Analyze</h3>
                  </div>
                  
                  <p className="mb-4 text-text-light">Your data is analyzed for patterns in sleep, activity, and nutrition.</p>

                  <div className="mb-4 space-y-2">
                    {['Pattern recognition', 'Trend analysis', 'Health insights'].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group flex h-full flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex flex-1 flex-col justify-between bg-[hsl(var(--color-card))] p-6">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">Personalize</h3>
                  </div>
                  
                  <p className="mb-4 text-text-light">Get personalized supplement recommendations and health advice.</p>

                  <div className="mb-4 space-y-2">
                    {['Custom recommendations', 'Goal-based planning', 'Progress tracking'].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;