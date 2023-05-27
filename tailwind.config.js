/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2c1261'
        },
        rover:{
          DEFAULT: '#D6210D',
          '100': '#e8197b'

        },
        rover1:{
          DEFAULT: '#D6210D',
          '100': '#D6210D'

        },
        secundaryColor:{
          DEFAULT: '#ffa400',
          '100': '#FFB960'
        },
        scout:{
          DEFAULT: '#00365f',
          '100': '#021DA3'
        },
        gris:{
          DEFAULT: '#c1c5d3'
        }
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

