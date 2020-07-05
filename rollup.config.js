import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  external: [
    // 'zone.js/dist/zone.js',
    // 'reflect-metadata',
  ],
  output: {
    dir: '.',
    format: 'es'
  },
  plugins: [
    typescript({ module: 'CommonJS' }),
    resolve(),
    commonjs({ extensions: ['.js', '.ts'] }),
  ]
};
