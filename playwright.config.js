import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:5173', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: '.venv\\Scripts\\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000', url: 'http://127.0.0.1:8000/health', reuseExistingServer: false, timeout: 30000, env: { DATABASE_PATH: 'runtime/e2e-predictions.db' } },
    { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort', url: 'http://127.0.0.1:5173', reuseExistingServer: false, timeout: 30000 },
  ],
});
