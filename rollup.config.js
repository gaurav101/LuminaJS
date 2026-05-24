import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-bundle-size';
import copy from 'rollup-plugin-copy';

const peerDeps = ['react', 'react-dom'];

export default [
  // ESM bundle
  {
    input: 'src/index.js',
    external: peerDeps,
    plugins: [
      nodeResolve(),
      bundleSize(),
      copy({
        targets: [
          { src: 'src/index.html', dest: 'dist' },
          { src: 'src/lumina-image.css', dest: 'dist' },
        ],
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
    ],
  },
  // Minified ESM bundle
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
        format: 'es',
        sourcemap: false,
      },
    ],
  },
];
