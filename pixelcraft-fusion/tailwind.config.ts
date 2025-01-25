import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Preserving your existing color variables
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        // Adding the plum color palette
        plum: {
          50: '#FAF5FF',   // Lightest plum, good for subtle backgrounds
          100: '#F3E8FF',  // Very light plum, useful for hover states
          200: '#E9D5FF',  // Light plum, good for secondary backgrounds
          300: '#D8B4FE',  // Medium-light plum, useful for highlights
          400: '#C084FC',  // Medium plum, good for interactive elements
          500: '#A855F7',  // Primary plum, perfect for buttons and key elements
          600: '#9333EA',  // Medium-dark plum, good for hover states
          700: '#7E22CE',  // Dark plum, useful for text contrast
          800: '#6B21A8',  // Very dark plum, good for backgrounds
          900: '#581C87',  // Darkest plum, perfect for dark mode backgrounds
        },
      },
      // Adding animation configurations for your landing page
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      // Adding background patterns for visual interest
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'plum-gradient': 'linear-gradient(to right, var(--plum-500), var(--plum-600))',
      },
      // Adding additional spacing options for fine-tuned layouts
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config;