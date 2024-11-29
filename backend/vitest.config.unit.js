const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    globals: true,
    threads: false,
    include: ["./**/*.test.js", "!./tests"],
  },
});
