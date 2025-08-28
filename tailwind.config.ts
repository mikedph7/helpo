import type { Config } from "tailwindcss"

export default {
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}"
  ],
  theme: { 
    extend: {
      colors: {
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      }
    } 
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
} satisfies Config
