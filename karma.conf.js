process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'karma-typescript'],
    files: ['./test.js', require.resolve('reflect-metadata'), './src/**/*.ts'],
    preprocessors: {
      'src/**/*.ts': ['karma-typescript'],
    },
    restartOnFileChange: true,
    reporters: ['progress', 'karma-typescript'],
    browsers: ['ChromeHeadless'],
    karmaTypescriptConfig: {
      tsconfig: 'tsconfig.spec.json',
      bundlerOptions: {
        transforms: [require('karma-typescript-es6-transform')()],
      },
    },
  });
};
