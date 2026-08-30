/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14161F',
          50: '#F4F5F7',
          100: '#E7E8ED',
          200: '#C7C9D4',
          300: '#9EA1B3',
          400: '#6E7188',
          500: '#4B4E63',
          600: '#34364A',
          700: '#2A2C3D',
          800: '#1B1D28',
          900: '#14161F',
          950: '#0B0C12',
        },
        paper: '#F5F6F4',
        surface: '#FFFFFF',
        flow: {
          DEFAULT: '#3454D1',
          50: '#EEF1FD',
          100: '#DCE2FB',
          400: '#5A76E0',
          500: '#3454D1',
          600: '#2941AA',
          700: '#213486',
        },
        tide: {
          DEFAULT: '#0EA5A4',
          50: '#E6FAF9',
          100: '#CCF4F3',
          400: '#2FC1C0',
          500: '#0EA5A4',
          600: '#0B8483',
        },
        amber: {
          DEFAULT: '#E8A93D',
        },
        coral: {
          DEFAULT: '#E1493A',
        },
        sage: {
          DEFAULT: '#6B9E78',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,22,31,0.04), 0 8px 24px rgba(20,22,31,0.06)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
