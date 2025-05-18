import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, AlertCircle, Sun, Moon, Laptop } from 'lucide-react';
import ThemeStatus from '../../components/ThemeStatus';
import { useTheme } from '../../contexts/ThemeContext';

const DEMO_PROFILE = {
  first_name: 'Demo',
  last_name: 'User',
};

const ProfilePage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { supabase } = useSupabase();
  const { user, isDemo } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        // First try to load from localStorage
        const savedUserData = localStorage.getItem('biowell-user-data');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setMobile(userData.mobile || '');
          setLoading(false);
          return;
        }
        
        if (isDemo) {
          setFirstName(DEMO_PROFILE.first_name);
          setLastName(DEMO_PROFILE.last_name);
          setMobile('+971 (50) 123 4567');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, mobile')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error loading user profile:', error);
          return;
        }
        
        if (data) {
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setMobile(data.mobile || '');
          
          // Save to localStorage for future use
          localStorage.setItem('biowell-user-data', JSON.stringify({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: user.email,
            mobile: data.mobile || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, supabase, isDemo]);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || isDemo) {
      setMessage({ type: 'error', text: 'Profile updates are not available in demo mode' });
      return;
    }
    
    setUpdating(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          mobile: mobile,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          first_name: firstName,
          last_name: lastName,
          mobile: mobile
        }
      });
      
      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
      }
      
      // Update localStorage
      localStorage.setItem('biowell-user-data', JSON.stringify({
        firstName,
        lastName,
        email: user.email,
        mobile
      }));
      
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Profile Settings</h1>
          <p className="text-text-light">Update your personal information and preferences</p>
          {isDemo && (
            <div className="mt-2 rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              You are in demo mode. Profile updates are not available.
            </div>
          )}
        </div>
        
        {message && (
          <div className={`mb-6 flex items-center gap-2 rounded-lg p-4 text-sm
            ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}
        
        <div className="rounded-xl bg-[hsl(var(--color-card))] p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="label">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isDemo}
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="label">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isDemo}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={user?.email || ''}
                disabled
              />
              <p className="mt-1 text-xs text-text-light">
                Your email address cannot be changed
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="mobile" className="label">
                Mobile Number
              </label>
              <input
                id="mobile"
                type="tel"
                className="input"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+971 (50) 123 4567"
                disabled={isDemo}
              />
            </div>
            
            <button
              type="submit"
              className="btn-primary"
              disabled={updating || isDemo}
            >
              {updating ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Updating...
                </span>
              ) : (
                'Update Profile'
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-6 rounded-xl bg-[hsl(var(--color-card))] p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold">Theme Settings</h2>
          
          <ThemeStatus className="mb-4" />
          
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                theme === 'light' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-[hsl(var(--color-border))] hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5" />
                <span>Light</span>
              </div>
              {theme === 'light' && <CheckCircle className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                theme === 'dark' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-[hsl(var(--color-border))] hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5" />
                <span>Dark</span>
              </div>
              {theme === 'dark' && <CheckCircle className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => setTheme('time-based')}
              className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                theme === 'time-based' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-[hsl(var(--color-border))] hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Laptop className="h-5 w-5" />
                <span>Auto</span>
              </div>
              {theme === 'time-based' && <CheckCircle className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;