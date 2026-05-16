import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-bundle-size';
import copy from 'rollup-plugin-copy';

const peerDeps = ['@angular/common', '@angular/core', 'react', 'react-dom'];

export default [
  // Development builds (ESM and UMD)
  {
    input: 'src/index.js',
    external: peerDeps,
    plugins: [
      nodeResolve(),
      bundleSize(),
      copy({
        targets: [{ src: 'src/index.html', dest: 'dist' }],
      }),
    ],
    treeshake: {
      moduleSideEffects: false,
    },
    output: [
      {
        file: 'dist/lumina.esm.js',
        format: 'es',
        sourcemap: false,
      },
      {
        file: 'dist/lumina.umd.js',
        format: 'umd',
        name: 'Lumina',
        globals: {
          '@angular/common': 'ng.common',
          '@angular/core': 'ng.core',
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        sourcemap: false,
      },
    ],
  },
  // Production minified UMD bundle
  {
    input: 'src/index.js',
    external: peerDeps,
    plugins: [nodeResolve(), terser(), bundleSize()],
    treeshake: {
      moduleSideEffects: false,
    },
    output: [
      {
        file: 'dist/lumina.min.js',
        format: 'umd',
        name: 'Lumina',
        globals: {
          '@angular/common': 'ng.common',
          '@angular/core': 'ng.core',
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        sourcemap: false,
      },
    ],
  },
];
