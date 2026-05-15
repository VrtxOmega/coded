import { spawn } from 'node:child_process';

const children = [
  spawn('node', ['server/index.mjs'], { stdio: 'inherit', shell: false }),
  spawn('vite', ['--host', '0.0.0.0'], { stdio: 'inherit', shell: true }),
];

function shutdown(signal) {
  for (const child of children) child.kill(signal);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
