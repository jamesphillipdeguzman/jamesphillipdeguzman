import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist", // Build output directory
    rollupOptions: {
      // This ensures that .mjs files are resolved properly in the build process
      input: {
        main: resolve(__dirname, "src/index.html"),
        about: resolve(__dirname, "src/pages/about.html"),
        contact: resolve(__dirname, "src/pages/contact.html"),
        desktop: resolve(__dirname, "src/pages/desktop.html"),
        mobile: resolve(__dirname, "src/pages/mobile.html"),
        portfolios: resolve(__dirname, "src/pages/portfolios.html"),  
        product: resolve(__dirname, "src/pages/product.html"),
        review: resolve(__dirname, "src/pages/review.html"),
        signup: resolve(__dirname, "src/pages/signup.html"),
        siteplan: resolve(__dirname, "src/pages/siteplan.html"),
        thanks: resolve(__dirname, "src/pages/thanks.html"),
      },
    },
  },
  server: {
    root: "src", // Vite will serve from the src folder
    open: true, // Open the browser automatically
  },
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".json"],
    alias: {
      "@js": resolve(__dirname, "src/js"),
    },
  },
});
