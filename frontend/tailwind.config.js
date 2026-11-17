/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9ddfd',
          300: '#7cc2fc',
          400: '#36a2f8',
          500: '#0c87eb',
          600: '#026bc9',
          700: '#0355a3',
          800: '#074885',
          900: '#0c3d6e',
        },
        accent: {
          50: '#fbf7ff',
          100: '#f4ebff',
          200: '#ecdaff',
          300: '#debeff',
          400: '#c792ff',
          500: '#ae60fc',
          600: '#9b3ef0',
          700: '#862bd4',
          800: '#7125b0',
          900: '#5c208e',
        }
      }
    },
  },
  plugins: [],
}
