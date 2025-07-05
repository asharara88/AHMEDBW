import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, User, LogOut, Moon, Sun, Settings } from 'lucide-react';
import Logo from '../common/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, setTheme, currentTheme } = useTheme();
  const location = useLocation();

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
    { path: '/', label: 'Home', requiresAuth: false },
    { path: '/dashboard', label: 'Dashboard', requiresAuth: true },
    { path: '/chat', label: 'MyCoach', requiresAuth: true },
    { path: '/supplements', label: 'Supplements', requiresAuth: true },
    { path: '/how-it-works', label: 'How It Works', requiresAuth: false },
    { path: '/pricing', label: 'Pricing', requiresAuth: false },
  ];

  // Filter nav items based on authentication status
  const filteredNavItems = navItems.filter(item => !item.requiresAuth || user);

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--color-border))] bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-6">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'nav-link-active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
              aria-label={currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {currentTheme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Auth Actions */}
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"
                  aria-label="Open profile menu"
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="true"
                >
                  <User className="h-5 w-5" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="dropdown-menu"
                    >
                      <Link
                        to="/profile"
                        className="dropdown-item"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="dropdown-item"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="dropdown-item text-error hover:bg-error/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="rounded-lg p-2 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text md:hidden"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
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
            className="border-t border-[hsl(var(--color-border))] bg-background md:hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block rounded-lg px-4 py-2 text-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {!user && (
                  <div className="mt-4 flex flex-col space-y-2 pt-4">
                    <Link
                      to="/login"
                      className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-4 py-2 text-center font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="rounded-lg bg-primary px-4 py-2 text-center font-medium text-white"
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