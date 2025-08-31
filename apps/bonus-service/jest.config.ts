export default {
  displayName: 'bonus-service',
  preset: '../../jest.preset.js',
  verbose: true,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/bonus-service',
  reporters: ['default', '<rootDir>/full-error-reporter.cjs'], // keep Jest’s default dots/summary
  testTimeout: 60000,
};
