import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserCircle, Settings, LogOut, Sun, Moon, Laptop, Utensils } from 'lucide-react';
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
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  const toggleThemeMenu = () => setIsThemeMenuOpen(!isThemeMenuOpen);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsProfileMenuOpen(false);
  };
  
  const isActive = (path: string) => location.pathname === path;

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-5 w-5" />;
      case 'dark': return <Moon className="h-5 w-5" />;
      case 'time-based':
      case 'system': return <Laptop className="h-5 w-5" />;
      default: return <Laptop className="h-5 w-5" />;
    }
  };

  const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
  
  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--color-border))] bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Logo className="h-8" />
            
            <nav className="hidden space-x-1 md:flex">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/chat" 
                    className={`nav-link ${isActive('/chat') || location.pathname.startsWith('/chat/') ? 'nav-link-active' : ''}`}
                  >
                    Coach
                  </Link>
                  <Link 
                    to="/supplements" 
                    className={`nav-link ${isActive('/supplements') ? 'nav-link-active' : ''}`}
                  >
                    Supplements
                  </Link>
                  <Link 
                    to="/recipes" 
                    className={`nav-link ${isActive('/recipes') ? 'nav-link-active' : ''}`}
                  >
                    Recipes
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/how-it-works" className="nav-link">How it Works</Link>
                  <Link to="/pricing" className="nav-link">Pricing</Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {!user && (
              <div className="hidden md:flex md:items-center md:gap-4">
                <Link to="/login" className="nav-link">
                  Sign in
                </Link>
                <Link to="/signup" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}
            
            <div className="relative">
              <button
                onClick={toggleThemeMenu}
                className="flex h-10 w-10 items-center justify-center rounded-full text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))]"
                aria-label="Toggle theme"
              >
                {getThemeIcon()}
              </button>

              {isThemeMenuOpen && (
                <div className="dropdown-menu">
                  <button
                    onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }}
                    className="dropdown-item"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </button>
                  <button
                    onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }}
                    className="dropdown-item"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </button>
                  <button
                    onClick={() => { setTheme('time-based'); setIsThemeMenuOpen(false); }}
                    className="dropdown-item"
                  >
                    <Laptop className="h-4 w-4" />
                    Auto
                  </button>
                </div>
              )}
            </div>
            
            {user && (
              <div className="relative hidden md:block">
                <button 
                  onClick={toggleProfileMenu}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                  aria-label="Open profile menu"
                >
                  <UserCircle className="h-6 w-6" />
                </button>
                
                {isProfileMenuOpen && (
                  <div className="dropdown-menu">
                    <div className="border-b border-[hsl(var(--color-border))] px-4 py-2">
                      <p className="text-sm font-medium text-text">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link 
                        to="/profile" 
                        className="dropdown-item"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Profile Settings
                      </Link>
                      <button 
                        onClick={handleSignOut} 
                        className="dropdown-item text-error hover:bg-error/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={toggleMenu} 
              className="flex h-10 w-10 items-center justify-center rounded-full text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] md:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <div className="border-t border-[hsl(var(--color-border))] py-4 md:hidden">
            <nav className="flex flex-col space-y-1">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`rounded-lg px-4 py-2 text-text-light transition-colors ${
                      isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                    }`}
                    onClick={toggleMenu}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/chat" 
                    className={`rounded-lg px-4 py-2 text-text-light transition-colors ${
                      isActive('/chat') || location.pathname.startsWith('/chat/') ? 'bg-primary/10 text-primary' : 'hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                    }`}
                    onClick={toggleMenu}
                  >
                    Coach
                  </Link>
                  <Link 
                    to="/supplements" 
                    className={`rounded-lg px-4 py-2 text-text-light transition-colors ${
                      isActive('/supplements') ? 'bg-primary/10 text-primary' : 'hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                    }`}
                    onClick={toggleMenu}
                  >
                    Supplements
                  </Link>
                  <Link 
                    to="/recipes" 
                    className={`rounded-lg px-4 py-2 text-text-light transition-colors ${
                      isActive('/recipes') ? 'bg-primary/10 text-primary' : 'hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                    }`}
                    onClick={toggleMenu}
                  >
                    <Utensils className="h-5 w-5 inline-block mr-2" />
                    Recipes
                  </Link>
                  <Link 
                    to="/profile" 
                    className="rounded-lg px-4 py-2 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                    onClick={toggleMenu}
                  >
                    <Settings className="h-5 w-5 inline-block mr-2" />
                    Profile Settings
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-error transition-colors hover:bg-error/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/how-it-works" 
                    className="rounded-lg px-4 py-2 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                    onClick={toggleMenu}
                  >
                    How it Works
                  </Link>
                  <Link 
                    to="/pricing" 
                    className="rounded-lg px-4 py-2 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                    onClick={toggleMenu}
                  >
                    Pricing
                  </Link>
                  <Link 
                    to="/login" 
                    className="rounded-lg px-4 py-2 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                    onClick={toggleMenu}
                  >
                    Sign in
                  </Link>
                  <Link 
                    to="/signup" 
                    className="mt-2 block w-full rounded-lg bg-primary px-4 py-2 text-center font-medium text-white transition-colors hover:bg-primary-dark"
                    onClick={toggleMenu}
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