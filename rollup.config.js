import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-bundle-size';

const peerDeps = ['react', 'react-dom'];

export default [
  // Development builds (ESM and UMD)
  {
    input: 'src/index.js',
    external: peerDeps,
    plugins: [nodeResolve(), bundleSize()],
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
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        sourcemap: false,
      },
    ],
  },
];
