import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base:
    mode === 'production'
      ? '' // Use an empty string for relative asset paths.
           // If deploying to a subfolder (e.g., GitHub Pages), set this to '/your-repo-name/'.
      : mode === 'hostinger'
      ? '/'
      : '/',
  server: {
    host: "::",
    port: 8080,
    strictPort: false,
    hmr: true,
    cors: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    assetsInlineLimit: 0,
    target: 'esnext',
    minify: 'esbuild',
  },
}));
