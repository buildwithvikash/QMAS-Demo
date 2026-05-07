/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          blue: '#2563eb',
          'blue-lt': '#3b82f6',
          'blue-bg': '#eff6ff',
          'blue-bd': '#bfdbfe',
          amber: '#d97706',
          'amber-lt': '#f59e0b',
          'amber-bg': '#fffbeb',
          'amber-bd': '#fde68a',
          green: '#059669',
          'green-lt': '#10b981',
          'green-bg': '#ecfdf5',
          'green-bd': '#a7f3d0',
          red: '#dc2626',
          'red-lt': '#ef4444',
          'red-bg': '#fef2f2',
          'red-bd': '#fecaca',
          orange: '#ea580c',
          'orange-bg': '#fff7ed',
          'orange-bd': '#fed7aa',
          purple: '#7c3aed',
          'purple-bg': '#f5f3ff',
          'purple-bd': '#ddd6fe',
          teal: '#0891b2',
          'teal-bg': '#ecfeff',
          'teal-bd': '#a5f3fc',
        }
      }
    }
  },
  plugins: [],
}
