import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Moon, Sun, Settings, Home, LayoutDashboard, MessageSquare, Package, Info, CreditCard } from 'lucide-react';
import Logo from '../common/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, setTheme, currentTheme } = useTheme();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close profile menu when main menu is toggled
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    // Close main menu when profile menu is toggled
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home', requiresAuth: false, icon: <Home className="h-5 w-5" /> },
    { path: '/dashboard', label: 'Dashboard', requiresAuth: true, icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/chat', label: 'MyCoach', requiresAuth: true, icon: <MessageSquare className="h-5 w-5" /> },
    { path: '/supplements', label: 'Supplements', requiresAuth: true, icon: <Package className="h-5 w-5" /> },
    { path: '/how-it-works', label: 'How It Works', requiresAuth: false, icon: <Info className="h-5 w-5" /> },
    { path: '/pricing', label: 'Pricing', requiresAuth: false, icon: <CreditCard className="h-5 w-5" /> },
  ];

  // Filter nav items based on authentication status
  const filteredNavItems = navItems.filter(item => !item.requiresAuth || user);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Logo className="shrink-0" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 rounded-xl hover:bg-card-hover hover:scale-105 ${
                  isActive(item.path) 
                    ? 'text-primary bg-primary/10 shadow-sm' 
                    : 'text-text-light hover:text-text'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2 text-text-light transition-all duration-300 hover:bg-card-hover hover:text-text hover:scale-105 min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label={currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {currentTheme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Auth Actions */}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary-light text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                  aria-label="Open profile menu"
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="true"
                >
                  <User className="h-4 w-4" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full z-50 mt-2 min-w-[180px] origin-top-right rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-1 shadow-xl"
                    >
                      <Link 
                        to="/profile"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-light transition-all duration-300 hover:bg-card-hover hover:text-text hover:scale-105 min-h-[36px]"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/profile"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-light transition-all duration-300 hover:bg-card-hover hover:text-text hover:scale-105 min-h-[36px]"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-error transition-all duration-300 hover:bg-error/10 min-h-[36px]"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden items-center space-x-2 sm:flex">
                <Link
                  to="/login"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-text-light transition-all duration-300 hover:bg-card-hover hover:text-text hover:scale-105 min-h-[36px] flex items-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-gradient-to-r from-primary to-primary-light px-3 py-2 text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:scale-105 min-h-[36px] flex items-center"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className="rounded-xl p-2 text-text-light transition-all duration-300 hover:bg-card-hover hover:text-text hover:scale-105 md:hidden min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
            style={{ maxHeight: 'calc(100vh - 56px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-1">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base transition-all duration-300 min-h-[44px] hover:scale-105 ${
                      isActive(item.path)
                        ? 'bg-primary/10 font-medium text-primary shadow-sm'
                        : 'text-text-light hover:bg-card-hover hover:text-text'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                {!user && (
                  <div className="mt-4 flex flex-col space-y-2 pt-4 border-t border-border">
                    <Link
                      to="/login"
                      className="rounded-xl border border-border bg-card px-4 py-3 text-center font-medium min-h-[44px] flex items-center justify-center transition-all duration-300 hover:bg-card-hover hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="rounded-xl bg-gradient-to-r from-primary to-primary-light px-4 py-3 text-center font-medium text-white min-h-[44px] flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;