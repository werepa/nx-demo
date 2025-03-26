export default {
  displayName: "backend",
  preset: "../jest.preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../coverage/backend",
  moduleNameMapper: {
    "@simulex/models": "<rootDir>/../models/src/index.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
}
