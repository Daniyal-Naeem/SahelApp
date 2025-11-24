/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FFFFFF",
        action: "#F83758",
        black: {
          100: "#000",
          200: "#C4C4C4",
          300: "#F3F3F3",
        },
        background:{
          100: "#FFFFFF",
          200: "#F9F9F9",
        } 
      },
      fontFamily: {
        // Set Montserrat as default font
        sans: ["Montserrat", "sans-serif"],
        // Montserrat explicit classes (use with fontWeight classes)
        mthin: ["Montserrat", "sans-serif"],
        mextralight: ["Montserrat", "sans-serif"],
        mlight: ["Montserrat", "sans-serif"],
        mregular: ["Montserrat", "sans-serif"],
        mmedium: ["Montserrat", "sans-serif"],
        msemibold: ["Montserrat", "sans-serif"],
        mbold: ["Montserrat", "sans-serif"],
        mextrabold: ["Montserrat", "sans-serif"],
        mblack: ["Montserrat", "sans-serif"],
        // Poppins fonts (keeping existing for backward compatibility)
        pthin: ["Poppins", "sans-serif"],
        pextralight: ["Poppins", "sans-serif"],
        plight: ["Poppins", "sans-serif"],
        pregular: ["Poppins", "sans-serif"],
        pmedium: ["Poppins", "sans-serif"],
        psemibold: ["Poppins", "sans-serif"],
        pbold: ["Poppins", "sans-serif"],
        pextrabold: ["Poppins", "sans-serif"],
        pblack: ["Poppins", "sans-serif"],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
    },
  },
  plugins: [],
}

