/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          light: 'hsl(var(--color-primary-light))',
          dark: 'hsl(var(--color-primary-dark))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary))',
          light: 'hsl(var(--color-secondary-light))',
          dark: 'hsl(var(--color-secondary-dark))',
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
        surface: {
          1: 'hsl(var(--color-surface-1))',
          2: 'hsl(var(--color-surface-2))',
          3: 'hsl(var(--color-surface-3))',
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
