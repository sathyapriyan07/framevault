/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#0b0b0b',
          card: '#141414',
        }
      }
    },
  },
  plugins: [],
}
