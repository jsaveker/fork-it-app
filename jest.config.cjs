module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', {configFile: './babel.config.cjs'}],
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
