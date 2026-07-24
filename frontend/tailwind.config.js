/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: '#059669',
          hover: '#047857',
          violet: '#7c3aed',
          light: '#f0fdf4',
          dark: '#0f172a',
        },
        accent: {
          emerald: '#059669',
          amber: '#d97706',
          violet: '#7c3aed',
          rose: '#e11d48',
        }
      },
      fontFamily: {
        sans: [
          'Segoe UI',
          '-apple-system',
          'BlinkMacSystemFont',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      boxShadow: {
        'enterprise': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'enterprise-lg': '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
};
