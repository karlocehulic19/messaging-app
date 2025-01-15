const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    globals: true,
    environment: "./vitest.env.js",
    setupFiles: ["./tests/setup.js"],
    include: ["./tests/**/*.test.js"],
    threads: false,
  },
});
