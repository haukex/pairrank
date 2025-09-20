// @ts-check
/** Playwright Configuration File
 *
 * Copyright © 2025 Hauke D (haukex@zero-g.net)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import { defineConfig, devices } from '@playwright/test'

const isCI = process.env['CI']

// https://playwright.dev/docs/test-configuration
export default defineConfig({
  testDir: '.',  // recursively search this directory for tests
  fullyParallel: true,  // Run tests in files in parallel
  forbidOnly: !!isCI,  // Fail the build on CI if you accidentally left test.only in the source code.
  retries: isCI ? 2 : 0,  // Retry on CI only
  workers: isCI ? 1 : 5,  // Opt out of parallel tests on CI.
  reporter: 'list',  // https://playwright.dev/docs/test-reporters
  use: {  // Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions
    baseURL: 'http://localhost:1234',  // Base URL to use in actions like `await page.goto('/')`.
    trace: 'on-first-retry',  // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    testIdAttribute: 'data-test-id',
    // https://playwright.dev/docs/emulation
    locale: 'en-US',
    timezoneId: 'Europe/Berlin',
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'],  }, },
    { name: 'Firefox',  use: { ...devices['Desktop Firefox'], }, },
    { name: 'WebKit',   use: { ...devices['Desktop Safari'],  }, },
    { name: 'Mobile Chrome',  use: { ...devices['Pixel 7'],   }, },
    { name: 'Mobile Safari',  use: { ...devices['iPhone 15'], }, },
  ],
  webServer: {
    // NOTE this command only runs the server - need to run `npm run build` or `npm start` first!
    command: 'npx serve --no-port-switching --no-clipboard --listen tcp://localhost:1234 dist',
    url: 'http://localhost:1234',
    reuseExistingServer: !isCI,
    gracefulShutdown: { signal: 'SIGINT', timeout: 500 },
  },
})
