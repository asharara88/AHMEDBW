import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Activity } from 'lucide-react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'light' | 'dark';
}

const Logo = ({ className = '', variant = 'default' }: LogoProps) => {
  const { currentTheme } = useTheme();

  // Dark theme logo URL - high resolution JPG
  const darkThemeLogoUrl = 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/biowelllogos/white%20Log%20trnspt%20bg.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiaW93ZWxsbG9nb3Mvd2hpdGUgTG9nIHRybnNwdCBiZy5zdmciLCJpYXQiOjE3NDk0MzUyNTksImV4cCI6MTc4MDk3MTI1OX0.lnxK8zhka2S8Dwvuxl3uyPFCpwdCU42zFTepIJ9VVpk';
  
  // Light theme logo URL - high resolution SVG
  const lightThemeLogoUrl = 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/logo-light.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvcy9sb2dvLWxpZ2h0LnN2ZyIsImlhdCI6MTc0OTQzNjAyMSwiZXhwIjoxODQ0MDQ0MDIxfQ.mM1BHZO5v2FBntgorQlOXFGtrkyVUk-PNJUC726ePkA';

  // Determine which logo to use based on variant and theme
  const logoUrl = variant === 'light' ? lightThemeLogoUrl : 
                 variant === 'dark' ? darkThemeLogoUrl : 
                 currentTheme === 'dark' ? darkThemeLogoUrl : lightThemeLogoUrl;

  // Determine the color class based on variant and theme
  const colorClass = variant === 'light' ? 'text-white' : 
                     variant === 'dark' ? 'text-black' : 
                     'text-black dark:text-white';

  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <div className={colorClass}>
        <img 
          src={logoUrl} 
          alt="Biowell Logo" 
          className="h-16 w-auto object-contain" 
          width="240"
          height="64"
          loading="eager"
          onError={(e) => {
            // Fallback to text logo if image fails to load
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = "flex items-center gap-2 text-primary font-bold text-xl";
              fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg><span>Biowell</span>`;
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    </Link>
  );
};

export default Logo;