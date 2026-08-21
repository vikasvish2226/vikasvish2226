/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        flame: "#E85D2A",
        ink: "#151515",
        porcelain: "#F8F4EF",
        saffron: "#F4A261",
        basil: "#2E7D5B",
      },
      boxShadow: {
        soft: "0 18px 55px rgba(21, 21, 21, 0.10)",
        lift: "0 18px 36px rgba(21, 21, 21, 0.14)",
      },
    },
  },
  plugins: [],
};
