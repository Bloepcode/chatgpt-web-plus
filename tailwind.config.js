/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,svelte}"],
  theme: {
    extend: {
      maxWidth: {
        "4-5": "80%",
        "3-5": "60% !important",
        "9-10": "90%",
      }
    },
  },
  plugins: [require("daisyui")],
}

