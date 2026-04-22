import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/index.js',
    output: [
      // ES Module for modern bundlers
      {
        file: 'dist/lumina.esm.js',
        format: 'es'
      },
      // UMD Bundle for universal use (Script tags or Node)
      {
        file: 'dist/lumina.umd.js',
        format: 'umd',
        name: 'Lumina',
        noConflict: true
      }
    ]
  },
  {
    input: 'src/index.js',
    output: [
      // Minified UMD Bundle for production
      {
        file: 'dist/lumina.min.js',
        format: 'umd',
        name: 'Lumina',
        plugins: [terser()]
      }
    ]
  }
];
