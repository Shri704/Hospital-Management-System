import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ✅ enables Tailwind in Vite
  ],
  server: {
    port: 5173, // optional (default Vite port)
    open: true, // auto-open browser
  },
});
