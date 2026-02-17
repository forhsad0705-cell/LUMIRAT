/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "text-red-500",
    "text-blue-500",
    "text-green-500",
    "bg-blue-500",
    "bg-gray-500",
    "bg-red-500",
    "px-2",
    "px-4",
    "px-6",
  ],
};