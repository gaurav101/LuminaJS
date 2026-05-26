/* global  console, process */
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.resolve(rootDir, process.argv[2] ?? 'build-artifacts');

const buildSteps = [
  {
    name: 'Examples home',
    command: 'npm',
    args: ['run', 'build'],
    cwd: 'examples/lumina-website',
  },
  {
    name: 'React example',
    command: 'npm',
    args: ['run', 'build'],
    cwd: 'examples/react',
  },
  {
    name: 'Vanilla JS example',
    command: 'npm',
    args: ['run', 'build'],
    cwd: 'examples/vanilla-js',
  },
  {
    name: 'CSS demo',
    command: 'npm',
    args: ['run', 'build'],
    cwd: 'examples/css-demo',
  },
  {
    name: 'Storybook',
    command: 'npm',
    args: ['run', 'build-storybook', '--', '--quiet'],
    cwd: 'examples/react',
  },
  {
    name: 'JSDoc docs',
    command: 'npm',
    args: ['run', 'generate-docs'],
    cwd: '.',
  },
];

const artifacts = [
  { name: 'examples-home', from: 'examples/lumina-website/dist', to: '.' },
  { name: 'react', from: 'examples/react/dist', to: 'react' },
  { name: 'vanilla-js', from: 'examples/vanilla-js/dist', to: 'vanilla-js' },
  { name: 'css-demo', from: 'examples/css-demo/dist', to: 'css-demo' },
  {
    name: 'storybook',
    from: 'examples/react/storybook-static',
    to: 'storybook',
  },
  { name: 'docs', from: 'docs', to: 'docs' },
];

function runStep(step) {
  const cwd = path.resolve(rootDir, step.cwd);

  return new Promise((resolve, reject) => {
    console.log(`\n> Building ${step.name}`);

    const child = spawn(step.command, step.args, {
      cwd,
      shell: process.platform === 'win32',
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${step.name} failed with exit code ${code}`));
    });
  });
}

function validateOutputDir() {
  const relativeOutput = path.relative(rootDir, outputDir);

  if (
    !relativeOutput ||
    relativeOutput.startsWith('..') ||
    path.isAbsolute(relativeOutput)
  ) {
    throw new Error('Output folder must be inside the project directory.');
  }

  for (const artifact of artifacts) {
    const source = path.resolve(rootDir, artifact.from);
    const relativeSource = path.relative(source, outputDir);

    if (!relativeSource || !relativeSource.startsWith('..')) {
      throw new Error(
        `Output folder cannot be inside source artifact ${path.relative(rootDir, source)}.`,
      );
    }
  }
}

async function copyArtifact(artifact) {
  const source = path.resolve(rootDir, artifact.from);
  const destination = path.resolve(outputDir, artifact.to);

  if (!existsSync(source)) {
    throw new Error(
      `Missing ${artifact.name} artifact at ${path.relative(rootDir, source)}`,
    );
  }

  await cp(source, destination, { recursive: true });
}

async function main() {
  validateOutputDir();

  for (const step of buildSteps) {
    await runStep(step);
  }

  await rm(outputDir, { force: true, recursive: true });
  await mkdir(outputDir, { recursive: true });

  for (const artifact of artifacts) {
    await copyArtifact(artifact);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    artifacts: artifacts.map(({ name, to }) => ({ name, path: to })),
  };

  await writeFile(
    path.resolve(outputDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log(
    `\nBuilt examples, Storybook, and docs into ${path.relative(rootDir, outputDir)}`,
  );
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exitCode = 1;
});
