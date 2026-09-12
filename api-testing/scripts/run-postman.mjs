import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4010';
const reportPath = path.join(root, 'reports', 'postman-cli-report.json');
const postmanExecutable = process.platform === 'win32' ? 'postman.cmd' : 'postman';
const postmanBin = path.join(root, 'node_modules', '.bin', postmanExecutable);

await mkdir(path.dirname(reportPath), { recursive: true });

const server = spawn(process.execPath, ['mock-api/server.js'], {
  cwd: root,
  env: { ...process.env, PORT: new URL(baseUrl).port || '4010' },
  stdio: ['ignore', 'pipe', 'inherit'],
});

server.stdout.on('data', (chunk) => process.stdout.write(chunk));

let serverFailure;
server.once('error', (caught) => {
  serverFailure = caught;
});
server.once('exit', (code, signal) => {
  if (code !== 0 && !server.killed) {
    serverFailure = new Error(
      `Mock API exited before the run (code: ${code}, signal: ${signal || 'none'})`
    );
  }
});

async function waitUntilReady() {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (serverFailure) throw serverFailure;
    try {
      const response = await fetch(`${baseUrl}/health`);
      const body = response.ok ? await response.json() : null;
      if (body?.service === 'qa-portfolio-api') return;
    } catch {
      // The child process may still be binding its port.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Mock API did not become ready at ${baseUrl}`);
}

function stopServer() {
  if (!server.killed) server.kill('SIGTERM');
}

process.on('SIGINT', () => {
  stopServer();
  process.exit(130);
});

try {
  await waitUntilReady();

  const postman = spawn(
    postmanBin,
    [
      'collection',
      'run',
      'postman/qa-showcase.postman_collection.json',
      '--environment',
      'postman/local.postman_environment.json',
      '--env-var',
      `baseUrl=${baseUrl}`,
      '--reporters',
      'cli,json',
      '--reporter-json-export',
      reportPath,
      '--reporter-json-structure',
      'newman',
      '--no-report-events',
    ],
    { cwd: root, stdio: 'inherit' }
  );

  const exitCode = await new Promise((resolve, reject) => {
    postman.on('error', reject);
    postman.on('exit', resolve);
  });

  if (exitCode !== 0) process.exitCode = exitCode || 1;
} finally {
  stopServer();
}
