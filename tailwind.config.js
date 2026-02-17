/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "dummy-cache-bust",
    // Layout
    "flex",
    "items-center",
    "justify-center",
    "w-screen",
    "h-screen",
    "min-h-screen",
    "px-4",
    "w-full",
    "max-w-sm",
    "space-y-8",

    // Backgrounds
    "bg-gray-950",
    "bg-gray-900",
    "bg-gray-800",
    "bg-orange-600",
    "hover:bg-orange-500",
    "bg-gradient-to-br",
    "from-orange-400",
    "to-red-500",

    // Borders & Radius
    "rounded-xl",
    "rounded-lg",
    "rounded-md",
    "border",
    "border-gray-800",
    "ring-1",
    "ring-inset",
    "ring-gray-700",
    "focus:ring-2",
    "focus:ring-inset",
    "focus:ring-orange-500",

    // Text
    "text-white",
    "text-gray-400",
    "text-orange-400",
    "hover:text-orange-300",
    "text-sm",
    "text-2xl",
    "font-bold",
    "font-medium",

    // Shadows
    "shadow-2xl",

    // Padding
    "p-8",
    "py-2.5",
    "px-3",

    // Width / Height
    "w-12",
    "h-12",
    "w-7",
    "h-7",
  ],
};