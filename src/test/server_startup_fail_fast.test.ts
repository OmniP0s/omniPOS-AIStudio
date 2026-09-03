// Regression coverage for the migration fail-fast gate in server.ts.
//
// server.ts executes `void startServer()` at module load and exports nothing, so it cannot
// be imported here without booting a real server. Instead the entry point is spawned as a
// child process and the observable contract is asserted:
//
//   * a genuine migration failure  -> non-zero exit, "[Startup Aborted]", server never listens
//   * no database configured       -> in-memory warning, server starts normally
//
// The second case is the guard that keeps the supported in-memory development/test mode
// working: the fail-fast gate must not fire merely because PostgreSQL is absent.

import { spawn, type ChildProcess } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

const TSX_CLI = path.resolve('node_modules/tsx/dist/cli.mjs');
const SERVER_ENTRY = 'server.ts';
const FAILURE_PORT = 39117;
const IN_MEMORY_PORT = 39118;

const ABORT_MARKER = '[Startup Aborted]';
const STARTUP_MARKER = '[Enterprise Server] running';
const IN_MEMORY_MARKER = 'No PostgreSQL connection configured';

// A port that is closed on the loopback interface, so PostgreSQL connections are refused
// immediately instead of timing out.
const UNREACHABLE_DATABASE_URL = 'postgres://omni:omni@127.0.0.1:1/omnipos_unreachable';

const spawned: ChildProcess[] = [];

function buildEnv(overrides: Record<string, string | undefined>): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };

  // A valid signing secret so SecurityPipeline.assertConfiguredForRuntime() passes and the
  // migration gate is the only thing under test.
  env.API_AUTH_SECRET = randomBytes(32).toString('base64url');
  env.NODE_ENV = 'production';

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete env[key];
    } else {
      env[key] = value;
    }
  }

  return env;
}

function startServer(overrides: Record<string, string | undefined>) {
  // `tsx` re-spawns node with its loader, so the real server is a grandchild of the process
  // returned by spawn(). Running it detached makes that process a group leader, which lets
  // terminate() signal the entire tree; killing only the wrapper would leak a live server
  // still holding its port.
  const child = spawn(process.execPath, [TSX_CLI, SERVER_ENTRY], {
    cwd: process.cwd(),
    env: buildEnv(overrides),
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  spawned.push(child);

  let output = '';
  child.stdout?.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });
  child.stderr?.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });

  return {
    child,
    getOutput: () => output,
  };
}

function terminate(child: ChildProcess): void {
  if (child.exitCode !== null || child.signalCode !== null || child.pid === undefined) {
    return;
  }

  try {
    // Negative pid targets the whole process group, which includes the tsx-spawned server.
    process.kill(-child.pid, 'SIGKILL');
  } catch {
    child.kill('SIGKILL');
  }
}

/** Resolves with the exit code, or fails the test if the server refuses to exit. */
async function waitForExit(child: ChildProcess, timeoutMs: number): Promise<number | null> {
  return new Promise<number | null>((resolve, reject) => {
    const watchdog = setTimeout(() => {
      terminate(child);
      reject(new Error(`Expected the server to exit on its own within ${timeoutMs}ms.`));
    }, timeoutMs);

    child.on('exit', (code) => {
      clearTimeout(watchdog);
      resolve(code);
    });
  });
}

/** Resolves once `predicate` matches the accumulated output, or fails the test. */
async function waitForOutput(
  getOutput: () => string,
  predicate: (output: string) => boolean,
  timeoutMs: number,
  description: string
): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const output = getOutput();
    if (predicate(output)) return output;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(
    `Timed out after ${timeoutMs}ms waiting for ${description}. Output was:\n${getOutput()}`
  );
}

describe('server bootstrap migration fail-fast gate', () => {
  afterAll(() => {
    for (const child of spawned) {
      terminate(child);
    }
  });

  it('aborts startup with a non-zero exit code when a migration genuinely fails', async () => {
    const { child, getOutput } = startServer({
      PORT: String(FAILURE_PORT),
      DATABASE_URL: UNREACHABLE_DATABASE_URL,
    });

    const exitCode = await waitForExit(child, 60_000);
    const output = getOutput();

    // Fail loudly: non-zero exit so orchestrators (systemd, Docker, CI) detect the failure.
    expect(exitCode).toBe(1);

    // The abort is reported, and the original driver error survives into the message
    // (this is the path a CREATEROLE failure from migration 003 would travel).
    expect(output).toContain(ABORT_MARKER);
    expect(output).toContain('Database migration failed, so the server cannot start');
    expect(output).toContain('ECONNREFUSED');

    // The API must never have come up on an incomplete schema.
    expect(output).not.toContain(STARTUP_MARKER);
  }, 90_000);

  it('continues startup in in-memory mode when no database is configured', async () => {
    const { child, getOutput } = startServer({
      PORT: String(IN_MEMORY_PORT),
      // Absent database is the supported in-memory mode, not a failure.
      DATABASE_URL: undefined,
      POSTGRES_URL: undefined,
      PGHOST: undefined,
      PGDATABASE: undefined,
    });

    try {
      const output = await waitForOutput(
        getOutput,
        (text) => text.includes(STARTUP_MARKER),
        60_000,
        'the server to finish booting'
      );

      // The skip is announced explicitly rather than silently.
      expect(output).toContain(IN_MEMORY_MARKER);

      // Boot completed and nothing was aborted.
      expect(output).not.toContain(ABORT_MARKER);
      expect(child.exitCode).toBeNull();
      expect(child.signalCode).toBeNull();
    } finally {
      terminate(child);
    }
  }, 90_000);
});
