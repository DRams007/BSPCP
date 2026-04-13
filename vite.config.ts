import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://192.168.8.118:3001',
        changeOrigin: true,
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-core': ['react', 'react-dom'],
          // UI components
          'ui-components': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-menubar',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
          ],
          // Routing
          'react-router': ['react-router-dom'],
          // State management and forms
          'state-management': [
            '@tanstack/react-query',
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          // Charts and visualization
          'charts': ['recharts', 'embla-carousel-react'],
          // Utilities
          'utilities': [
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'cmdk',
            'date-fns',
            'input-otp',
            'lucide-react',
            'next-themes',
            'sonner',
            'vaul',
            'tailwindcss-animate',
            'embla-carousel-autoplay',
            'react-day-picker',
            'react-resizable-panels'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 750
  },
}));
