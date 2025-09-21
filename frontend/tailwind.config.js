/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary FarmNex Green Palette
        primary: {
          50: '#f0fdf4',   // Very light green
          100: '#dcfce7',  // Light green
          200: '#bbf7d0',  // Lighter green
          300: '#86efac',  // Light green
          400: '#4ade80',  // Medium light green
          500: '#22c55e',  // Main green (from your interface)
          600: '#16a34a',  // Darker green
          700: '#15803d',  // Dark green
          800: '#166534',  // Very dark green
          900: '#14532d',  // Darkest green
          950: '#052e16',  // Almost black green
        },
        
        // Secondary Green (Forest/Nature)
        secondary: {
          50: '#f7fee7',   // Very light yellow-green
          100: '#ecfccb',  // Light yellow-green
          200: '#d9f99d',  // Lighter yellow-green
          300: '#bef264',  // Light lime
          400: '#a3e635',  // Medium lime
          500: '#84cc16',  // Main lime
          600: '#65a30d',  // Darker lime
          700: '#4d7c0f',  // Dark olive
          800: '#365314',  // Very dark olive
          900: '#1a2e05',  // Darkest olive
          950: '#0f1419',  // Almost black olive
        },

        // Accent Colors
        accent: {
          // Orange/Harvest colors
          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316', // Main orange
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
            950: '#431407',
          },
          
          // Blue/Sky colors
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6', // Main blue
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
          },
          
          // Yellow/Sun colors
          yellow: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15',
            500: '#eab308', // Main yellow
            600: '#ca8a04',
            700: '#a16207',
            800: '#854d0e',
            900: '#713f12',
            950: '#422006',
          }
        },

        // Neutral Colors
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373', // Main neutral
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },

        // Status Colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Main success (matches primary)
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Main warning
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Main error
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main info
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // Background Colors
        background: {
          primary: '#ffffff',    // White background
          secondary: '#f8fafc',  // Light gray background
          tertiary: '#f1f5f9',   // Slightly darker gray
          dark: '#0f172a',       // Dark background
          'dark-secondary': '#1e293b', // Dark secondary background
        },

        // Text Colors
        text: {
          primary: '#0f172a',    // Dark text
          secondary: '#475569',  // Medium gray text
          tertiary: '#94a3b8',   // Light gray text
          inverse: '#ffffff',    // White text (for dark backgrounds)
          muted: '#64748b',      // Muted text
        },

        // Border Colors
        border: {
          primary: '#e2e8f0',    // Light border
          secondary: '#cbd5e1',  // Medium border
          tertiary: '#94a3b8',   // Darker border
          focus: '#22c55e',      // Focus border (primary green)
        }
      },
      
      // Custom spacing for agricultural/farming themes
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Custom border radius
      borderRadius: {
        'xl2': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      
      // Custom shadows for depth
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'green': '0 4px 14px 0 rgba(34, 197, 94, 0.39)',
        'green-lg': '0 10px 28px rgba(34, 197, 94, 0.25)',
      },

      // Custom font families
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },

      // Animation utilities
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
        bounceSoft: {
          '0%, 100%': { 
            transform: 'translateY(-5%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
    },
  },
  plugins: [],
}