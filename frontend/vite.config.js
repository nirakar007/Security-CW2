import react from "@vitejs/plugin-react";
import fs from "fs"; // Import the Node.js file system module
import path from "path"; // Import the Node.js path module
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // --- ADD THIS HTTPS CONFIGURATION ---
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "localhost-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "localhost.pem")),
    },
    // ------------------------------------

    // Your existing proxy configuration
    proxy: {
      "/api": {
        target: "https://localhost:5001", // Make sure this is HTTPS
        changeOrigin: true,
        // 'secure: false' is not strictly needed if your cert is trusted, but it's good to have
        secure: false,
      },
    },
  },
});
