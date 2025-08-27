module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|ts|tsx)'
  ],
  
  // Transform configuration 
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Skip problematic React Native transforms
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo))'
  ],
  
  // Setup files (avoiding React Native setup)
  setupFilesAfterEnv: [],
  
  // Coverage configuration
  collectCoverageFrom: [
    'backend/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.(test|spec).{ts,tsx}',
    '!**/node_modules/**'
  ],
  
  // Timeout configuration
  testTimeout: 15000,
  
  // Verbose output for debugging
  verbose: true,
  
  // Mock modules that cause issues
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native$': '<rootDir>/mocks/react-native.js',
    '^expo-secure-store$': '<rootDir>/mocks/expo-secure-store.js'
  }
};