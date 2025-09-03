export default {
  displayName: 'order-service',
  preset: '../../jest.preset',
  verbose: true,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/order-service',
  reporters: ['default', '<rootDir>/full-error-reporter.cjs'],
  testTimeout: 60000,
};
