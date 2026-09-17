import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @mintplex-labs/piper-tts-web bundles an Emscripten module that
  // conditionally requires Node built-ins; they are never actually used in
  // the browser, but the bundler still needs to resolve them.
  turbopack: {
    resolveAlias: {
      fs: "./src/shims/empty-module.js",
      path: "./src/shims/empty-module.js",
      crypto: "./src/shims/empty-module.js",
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
