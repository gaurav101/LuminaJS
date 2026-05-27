import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

const localLuminaReactPath = fileURLToPath(
  new URL('../../../dist/react/index.js', import.meta.url),
);
const localLuminaPath = fileURLToPath(
  new URL('../../../dist/index.js', import.meta.url),
);
const localLuminaAliasEntries = [
  {
    find: '@gks101/luminajs/react',
    replacement: localLuminaReactPath,
  },
  {
    find: '@gks101/luminajs',
    replacement: localLuminaPath,
  },
];
const localLuminaAliasMap = {
  '@gks101/luminajs/react': localLuminaReactPath,
  '@gks101/luminajs': localLuminaPath,
};

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  docs: {
    autodocs: 'tag',
  },

  addons: ['@storybook/addon-docs'],

  async viteFinal(config) {
    const existingAlias = config.resolve?.alias ?? [];

    return {
      ...config,
      plugins: [...(config.plugins ?? []), tailwindcss()],
      resolve: {
        ...config.resolve,
        alias: Array.isArray(existingAlias)
          ? [...localLuminaAliasEntries, ...existingAlias]
          : { ...existingAlias, ...localLuminaAliasMap },
        dedupe: [
          ...new Set([...(config.resolve?.dedupe ?? []), 'react', 'react-dom']),
        ],
      },
    };
  },
};

export default config;
