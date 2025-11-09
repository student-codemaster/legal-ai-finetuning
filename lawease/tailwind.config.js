/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        urban: ['Urbanist', 'sans-serif'],
      },
      colors: {
        background: {
          DEFAULT: '#0b0f19',
          secondary: '#111827',
          glow: '#00FFFF',
          accent: '#3b82f6',
          lawgold: '#fbbf24',
        },
        gray: {
          850: '#1e293b',
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0,255,255,0.15)',
        'inner-glow': 'inset 0 0 20px rgba(0,255,255,0.06)',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(0,255,255,0.1), rgba(0,0,0,0) 70%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
