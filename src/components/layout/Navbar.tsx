import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserCircle, Settings, LogOut, Sun, Moon, Laptop } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../common/Logo';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  const toggleThemeMenu = () => setIsThemeMenuOpen(!isThemeMenuOpen);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsProfileMenuOpen(false);
  };
  
  const isActive = (path: string) => location.pathname === path;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isProfileMenuOpen && profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      
      if (isThemeMenuOpen && themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen, isThemeMenuOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsThemeMenuOpen(false);
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-5 w-5" aria-hidden="true" />;
      case 'dark': return <Moon className="h-5 w-5" aria-hidden="true" />;
      case 'time-based':
      case 'system': return <Laptop className="h-5 w-5" aria-hidden="true" />;
      default: return <Laptop className="h-5 w-5" aria-hidden="true" />;
    }
  };

  const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
  
  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--color-border))] bg-background/95 backdrop-blur-md" role="banner">
      <div className="container mx-auto px-4">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Logo className="h-8" />
            
            <nav className="hidden space-x-1 md:flex" role="navigation" aria-label="Main Navigation">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
                    aria-current={isActive('/dashboard') ? 'page' : undefined}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/chat" 
                    className={`nav-link ${isActive('/chat') ? 'nav-link-active' : ''}`}
                    aria-current={isActive('/chat') ? 'page' : undefined}
                  >
                    Coach
                  </Link>
                  <Link 
                    to="/supplements" 
                    className={`nav-link ${isActive('/supplements') ? 'nav-link-active' : ''}`}
                    aria-current={isActive('/supplements') ? 'page' : undefined}
                  >
                    Supplements
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/how-it-works" 
                    className="nav-link"
                    aria-current={isActive('/how-it-works') ? 'page' : undefined}
                  >
                    How it Works
                  </Link>
                  <Link 
                    to="/pricing" 
                    className="nav-link"
                    aria-current={isActive('/pricing') ? 'page' : undefined}
                  >
                    Pricing
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {!user && (
              <div className="hidden md:flex md:items-center md:gap-4">
                <Link 
                  to="/login" 
                  className="nav-link"
                  aria-label="Sign in to your account"
                >
                  Sign in
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary text-base"
                  aria-label="Create a new account"
                >
                  Get Started
                </Link>
              </div>
            )}
            
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={toggleThemeMenu}
                className="flex h-10 w-10 items-center justify-center rounded-full text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))]"
                aria-label={`Change theme, current theme is ${theme}`}
                aria-expanded={isThemeMenuOpen}
                aria-haspopup="true"
              >
                {getThemeIcon()}
              </button>

              {isThemeMenuOpen && (
                <div 
                  className="dropdown-menu"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="theme-menu"
                >
                  <button
                    onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }}
                    className="dropdown-item"
                    role="menuitem"
                  >
                    <Sun className="h-4 w-4" aria-hidden="true" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }}
                    className="dropdown-item"
                    role="menuitem"
                  >
                    <Moon className="h-4 w-4" aria-hidden="true" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => { setTheme('time-based'); setIsThemeMenuOpen(false); }}
                    className="dropdown-item"
                    role="menuitem"
                  >
                    <Laptop className="h-4 w-4" aria-hidden="true" />
                    <span>Auto</span>
                  </button>
                </div>
              )}
            </div>
            
            {user && (
              <div className="relative hidden md:block" ref={profileMenuRef}>
                <button 
                  onClick={toggleProfileMenu}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))]"
                  aria-label="Open user menu"
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="true"
                >
                  <UserCircle className="h-6 w-6" aria-hidden="true" />
                </button>
                
                {isProfileMenuOpen && (
                  <div 
                    className="dropdown-menu"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="border-b border-[hsl(var(--color-border))] px-4 py-2">
                      <p className="text-sm font-medium text-text">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link 
                        to="/profile" 
                        className="dropdown-item"
                        onClick={() => setIsProfileMenuOpen(false)}
                        role="menuitem"
                      >
                        <Settings className="h-4 w-4" aria-hidden="true" />
                        <span>Profile Settings</span>
                      </Link>
                      <button 
                        onClick={handleSignOut} 
                        className="dropdown-item text-error hover:bg-error/10"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <button 
              ref={menuButtonRef}
              onClick={toggleMenu} 
              className="flex h-10 w-10 items-center justify-center rounded-full text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] md:hidden"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <MenuIcon />
              )}
            </button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div 
            id="mobile-menu" 
            className="border-t border-[hsl(var(--color-border))] py-4 md:hidden"
            role="navigation"
            aria-label="Mobile Navigation"
          >
            <nav className="flex flex-col space-y-1">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`flex items-center gap-2 rounded-lg px-4 py-3 text-base text-text-light transition-colors ${
                      isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                    }`}
                    onClick={toggleMenu}
                    aria-current={isActive('/dashboard') ? 'page' : undefined}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/chat" 
                    className={`flex items-center gap-2 rounded-lg px-4 py-3 text-base text-text-light transition-colors ${
                      isActive('/chat') ? 'bg-primary/10 text-primary' : 'hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                    }`}
                    onClick={toggleMenu}
                    aria-current={isActive('/chat') ? 'page' : undefined}
                  >
                    Coach
                  </Link>
                  <Link 
                    to="/supplements" 
                    className={`flex items-center gap-2 rounded-lg px-4 py-3 text-base text-text-light transition-colors ${
                      isActive('/supplements') ? 'bg-primary/10 text-primary' : 'hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                    }`}
                    onClick={toggleMenu}
                    aria-current={isActive('/supplements') ? 'page' : undefined}
                  >
                    Supplements
                  </Link>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-base text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                    onClick={toggleMenu}
                    aria-current={isActive('/profile') ? 'page' : undefined}
                  >
                    <Settings className="h-5 w-5" aria-hidden="true" />
                    Profile Settings
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-base text-left text-error transition-colors hover:bg-error/10"
                    aria-label="Sign out of your account"
                  >
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/how-it-works" 
                    className="rounded-lg px-4 py-3 text-base text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                    onClick={toggleMenu}
                    aria-current={isActive('/how-it-works') ? 'page' : undefined}
                  >
                    How it Works
                  </Link>
                  <Link 
                    to="/pricing" 
                    className="rounded-lg px-4 py-3 text-base text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                    onClick={toggleMenu}
                    aria-current={isActive('/pricing') ? 'page' : undefined}
                  >
                    Pricing
                  </Link>
                  <Link 
                    to="/login" 
                    className="rounded-lg px-4 py-3 text-base text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                    onClick={toggleMenu}
                    aria-label="Sign in to your account"
                  >
                    Sign in
                  </Link>
                  <Link 
                    to="/signup" 
                    className="mt-2 block w-full rounded-lg bg-primary px-4 py-3 text-center font-medium text-white text-base transition-colors hover:bg-primary-dark"
                    onClick={toggleMenu}
                    aria-label="Create a new account"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;