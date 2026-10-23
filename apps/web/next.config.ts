import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@pol/shared"],
  poweredByHeader: false,
};

export default config;
