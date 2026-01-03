/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // For React Native, fontFamily should match the PostScript name from font files
      colors: {
        primary: "#FFFFFF",
        action: "#00c853",
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
        // React Native font families - must match PostScript names from font files
        // Using strings directly for NativeWind compatibility
        sans: "Montserrat-Regular",
        // Montserrat font families - using exact PostScript names
        mthin: "Montserrat-Thin",
        mextralight: "Montserrat-ExtraLight",
        mlight: "Montserrat-Light",
        mregular: "Montserrat-Regular",
        mmedium: "Montserrat-Medium",
        msemibold: "Montserrat-SemiBold",
        mbold: "Montserrat-Bold",
        mextrabold: "Montserrat-ExtraBold",
        mblack: "Montserrat-Black",
        // Poppins fonts
        pthin: "Poppins-Thin",
        pextralight: "Poppins-ExtraLight",
        plight: "Poppins-Light",
        pregular: "Poppins-Regular",
        pmedium: "Poppins-Medium",
        psemibold: "Poppins-SemiBold",
        pbold: "Poppins-Bold",
        pextrabold: "Poppins-ExtraBold",
        pblack: "Poppins-Black",
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

