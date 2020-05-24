import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  external: [
    'zone.js',
    'reflect-metadata'
  ],
  output: {
    dir: '.',
    format: 'es'
  },
  plugins: [
    resolve(),
    typescript({ module: 'CommonJS' }),
    commonjs({ extensions: ['.js', '.ts'] }),
  ]
};
