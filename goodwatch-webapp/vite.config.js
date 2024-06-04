import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
// import { remixDevTools } from "remix-development-tools/vite";
import envOnly from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  server: {
    port: 3003,
  },
  plugins: [
    // remixDevTools(),
    remix({
      serverMinify: false,
      // ignoredRouteFiles: ["**/.*"],
      // TODO remove
      // serverModuleFormat: "cjs",
    }),
    envOnly(),
    tsconfigPaths({
      denyFiles: {
        client: [
          "**/server/**/*",
        ],
      },
      denyImports: {
        client: ["fs-extra", /^node:/],
      },
    }),
  ],
});
