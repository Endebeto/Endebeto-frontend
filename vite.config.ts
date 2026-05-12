import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devApiOrigin = env.VITE_DEV_API_ORIGIN?.trim() || "http://localhost:3000";

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      // Same-origin API in dev so httpOnly auth cookies attach to the page host.
      // Strict browsers (Brave, some Safari settings) block or partition cross-port localhost cookies.
      proxy: {
        "/api": {
          target: devApiOrigin,
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
