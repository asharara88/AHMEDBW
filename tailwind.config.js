/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--color-primary) / <alpha-value>)',
          light: 'hsl(var(--color-primary-light) / <alpha-value>)',
          dark: 'hsl(var(--color-primary-dark) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary) / <alpha-value>)',
          light: 'hsl(var(--color-secondary-light) / <alpha-value>)',
          dark: 'hsl(var(--color-secondary-dark) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent) / <alpha-value>)',
          light: 'hsl(var(--color-accent-light) / <alpha-value>)',
          dark: 'hsl(var(--color-accent-dark) / <alpha-value>)'
        },
        success: {
          DEFAULT: 'hsl(var(--color-success))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
        },
        error: {
          DEFAULT: 'hsl(var(--color-error))',
        },
        text: {
          DEFAULT: 'hsl(var(--color-text))',
          light: 'hsl(var(--color-text-light))',
          disabled: 'hsl(var(--color-text-disabled))',
        },
        background: {
          DEFAULT: 'hsl(var(--color-background))',
          alt: 'hsl(var(--color-background-alt))',
        },
        card: {
          DEFAULT: 'hsl(var(--color-card))',
          hover: 'hsl(var(--color-card-hover))',
        },
        surface: {
          1: 'hsl(var(--color-surface-1))',
          2: 'hsl(var(--color-surface-2))',
          3: 'hsl(var(--color-surface-3))',
        },
        border: 'hsl(var(--color-border))'
      },
      fontFamily: {
        sans: ['Inter Variable', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },
      backdropBlur: {
        'glass': 'var(--glass-backdrop)',
      },
      backgroundColor: {
        'glass': 'var(--glass-bg)',
      },
      borderColor: {
        'glass': 'var(--glass-border)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn var(--duration-normal) ease-out',
        'slide-up': 'slideUp var(--duration-normal) ease-out',
        'slide-down': 'slideDown var(--duration-normal) ease-out',
        'scale-in': 'scaleIn var(--duration-normal) ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};