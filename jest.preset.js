const nxPreset = require('@nrwl/jest/preset');
const path = require('path');

module.exports = {
  ...nxPreset,
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  transform: {
    '^.+\\.(ts|mjs|js|html)$': path.join(
      __dirname,
      'fix-istanbul-decorators.js'
    ),
  },
};
