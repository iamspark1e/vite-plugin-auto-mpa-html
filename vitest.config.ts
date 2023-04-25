import { defineConfig } from "vitest/config"
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "c8",
      reporter: ['json', 'html'],
      exclude: [
        'tests/example/**/*'
      ],
    }
  }
})