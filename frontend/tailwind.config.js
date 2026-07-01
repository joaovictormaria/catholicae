/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",
        muted: "#666666",
        faint: "#999999",
        border: "#E0E0E0",
        skeleton: "#E5E5E5",
        danger: "#B00020",
      },
    },
  },
  plugins: [],
};
