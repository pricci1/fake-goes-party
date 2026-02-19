/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    // Handle both standard node_modules and bun's .bun content-addressable store
    'node_modules/(?!(.bun/)?((jest-)?react-native|@react-native(-community)?|react-native|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@fake-goes-party/.*))',
  ],
  moduleNameMapper: {
    '^@fake-goes-party/common$': '<rootDir>/../common/src/index.ts',
    '^@fake-goes-party/shared$': '<rootDir>/../shared/src/index.ts',
  },
  // Make expo's node_modules available when resolving from workspace packages
  modulePaths: [
    '<rootDir>/node_modules',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
};
