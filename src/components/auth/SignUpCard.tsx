import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SignUpCard = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobile: '',
    dateOfBirth: '',
    gender: '',
    termsAccepted: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentTheme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    // Validate email format
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Validate mobile
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\+?[0-9\s()-]{10,15}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }
    
    // Validate date of birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }
    
    // Validate gender
    if (!formData.gender) newErrors.gender = 'Please select your gender';
    
    // Validate terms acceptance
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the Terms & Conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        // Dispatch SIGN_UP action or call your auth service
        console.log('Sign up data:', formData);
        
        // Save user data to localStorage for persistence
        localStorage.setItem('biowell-user-data', JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          mobile: formData.mobile,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender
        }));
        
        // Reset form after successful submission
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          mobile: '',
          dateOfBirth: '',
          gender: '',
          termsAccepted: false
        });
        
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="p-6 bg-[hsl(var(--color-card))] rounded-2xl shadow-lg dark:shadow-lg dark:shadow-black/10">
      <h2 className="text-xl font-semibold text-text mb-6">Start your health optimization journey today</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="text-sm font-medium text-text-light block mb-1">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.firstName ? 'border-error' : 'border-[hsl(var(--color-border))]'
              }`}
              required
            />
            {errors.firstName && (
              <p className="text-error text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          
          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="text-sm font-medium text-text-light block mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.lastName ? 'border-error' : 'border-[hsl(var(--color-border))]'
              }`}
              required
            />
            {errors.lastName && (
              <p className="text-error text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        
        {/* Email Address */}
        <div className="mb-4">
          <label htmlFor="email" className="text-sm font-medium text-text-light block mb-1">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.email ? 'border-error' : 'border-[hsl(var(--color-border))]'
            }`}
            required
          />
          {errors.email && (
            <p className="text-error text-xs mt-1">{errors.email}</p>
          )}
        </div>
        
        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="text-sm font-medium text-text-light block mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.password ? 'border-error' : 'border-[hsl(var(--color-border))]'
            }`}
            required
          />
          {errors.password && (
            <p className="text-error text-xs mt-1">{errors.password}</p>
          )}
        </div>
        
        {/* Mobile Number */}
        <div className="mb-4">
          <label htmlFor="mobile" className="text-sm font-medium text-text-light block mb-1">
            Mobile Number
          </label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="+971 (50) 123 4567"
            className={`w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.mobile ? 'border-error' : 'border-[hsl(var(--color-border))]'
            }`}
            required
          />
          {errors.mobile && (
            <p className="text-error text-xs mt-1">{errors.mobile}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="text-sm font-medium text-text-light block mb-1">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={`w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.dateOfBirth ? 'border-error' : 'border-[hsl(var(--color-border))]'
              }`}
              required
            />
            {errors.dateOfBirth && (
              <p className="text-error text-xs mt-1">{errors.dateOfBirth}</p>
            )}
          </div>
          
          {/* Gender */}
          <div>
            <label htmlFor="gender" className="text-sm font-medium text-text-light block mb-1">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.gender ? 'border-error' : 'border-[hsl(var(--color-border))]'
              }`}
              required
            >
              <option value="" disabled>Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender && (
              <p className="text-error text-xs mt-1">{errors.gender}</p>
            )}
          </div>
        </div>
        
        {/* Terms & Conditions */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm text-text-light">
            <input
              id="termsAccepted"
              name="termsAccepted"
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
              required
            />
            <label htmlFor="termsAccepted">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTerms(!showTerms)}
                className="text-primary underline focus:outline-none"
              >
                Terms & Conditions
              </button>
            </label>
          </div>
          {errors.termsAccepted && (
            <p className="text-error text-xs mt-1">{errors.termsAccepted}</p>
          )}
          
          <AnimatePresence>
            {showTerms && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-xs text-text-light space-y-2 overflow-hidden bg-[hsl(var(--color-surface-1))] p-4 rounded-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Terms & Conditions</h3>
                  <button 
                    type="button" 
                    onClick={() => setShowTerms(false)}
                    className="text-text-light hover:text-text"
                  >
                    {showTerms ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                <p><strong>1. Acceptance.</strong> By creating an account, you agree to our Privacy Policy and these Terms.</p>
                <p><strong>2. Data Privacy.</strong> We comply with UAE federal data protection laws (including GDPR-equivalent safeguards), and implement industry-standard security measures.</p>
                <p><strong>3. User Obligations.</strong> You confirm all information provided is accurate and that you are over 18.</p>
                <p><strong>4. Limitation of Liability.</strong> Our maximum liability is limited to the total subscription fees paid in the past 12 months.</p>
                <p><strong>5. Termination.</strong> You may close your account at any time; we may suspend accounts for breach of these Terms.</p>
                <p><strong>6. Governing Law.</strong> These Terms shall be governed by and construed in accordance with the UAE's federal legal framework and its sectoral regulations on data privacy, cybersecurity and telecommunications, together with the independent common-law principles adopted in the UAE's free zones for corporate governance and arbitration.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Start Now'
          )}
        </button>
        
        {/* Form validation error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-3 bg-error/10 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
            <div className="text-sm text-error">
              <p className="font-medium">Please fix the following errors:</p>
              <ul className="list-disc list-inside mt-1">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SignUpCard;