import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("chart.js") || id.includes("react-chartjs-2")) return "charts";
          if (id.includes("node_modules/react") || id.includes("react-router-dom")) return "react";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
})
