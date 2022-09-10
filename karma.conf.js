module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'karma-typescript'],
    files: ['./src/**/*.ts'],
    singleRun: true,
    preprocessors: {
      'src/**/*.ts': 'karma-typescript',
    },
    reporters: ['progress', 'karma-typescript'],
    browsers: [],
    karmaTypescriptConfig: {
      tsconfig: 'tsconfig.spec.json',
      bundlerOptions: {
        transforms: [require('karma-typescript-es6-transform')()],
      },
    },
  });
};
