import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  timeout: 30000,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
  },
};

export default config;
