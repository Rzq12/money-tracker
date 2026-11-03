/** Colours measured from the original's stylesheet, not library defaults. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#e1f5fe',
          100: '#b3e5fc',
          200: '#81d4fa',
          300: '#4fc3f7',
          400: '#29b6f6',
          500: '#0091ea',
          600: '#0288d1',
          700: '#0277bd',
          800: '#01579b',
          900: '#01478a',
        },
        green: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#2e7d32',
          800: '#1b5e20',
          900: '#1b5e20',
        },
        ink: { DEFAULT: '#101828', soft: '#4a5565', mute: '#6a7282' },
      },
      fontSize: { '2xs': ['10px', '14px'] },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
      },
    },
  },
  plugins: [],
};
