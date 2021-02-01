export default {
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    mariodb: "<rootDir>/src"
  },

  // The test environment that will be used for testing
  testEnvironment: "node"
}
