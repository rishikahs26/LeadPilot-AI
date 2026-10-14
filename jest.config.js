/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  // Use ts-jest to handle TypeScript without needing Babel
  // This keeps Jest independent from Next.js's SWC build pipeline
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: {
        // Relaxed config for test transforms
        module: "commonjs",
        esModuleInterop: true,
        allowJs: true,
      },
    }],
  },
  // uuid v14 ships as ESM — allow Jest to transform it
  transformIgnorePatterns: [
    "/node_modules/(?!(uuid)/)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
};

module.exports = config;
