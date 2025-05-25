import { execSync } from 'child_process';
import { error as logError, log as logInfo } from 'console';
import * as fs from 'fs';
import * as path from 'path';

const TARGET_DIR = 'standalone_playwright';
const PLAYWRIGHT_VERSION = '1.50.0';

function createPlaywrightProject(): void {
  logInfo('Creating standalone Playwright project...');

  // Remove existing directory if it exists
  if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { force: true, recursive: true });
  }

  // Create directory
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  // Create package.json
  const packageJson = {
    description: 'Standalone Playwright for Loadmill Electron app',
    name: 'standalone-playwright',
    private: true,
    version: '1.0.0',
  };

  fs.writeFileSync(
    path.join(TARGET_DIR, 'package.json'),
    JSON.stringify(packageJson, null, 2),
  );

  logInfo('✅ Created Playwright project structure');
}

function installPlaywright(): void {
  logInfo(`Installing Playwright ${PLAYWRIGHT_VERSION}...`);

  try {
    // Install Playwright test package
    execSync(`npm install @playwright/test@${PLAYWRIGHT_VERSION}`, {
      cwd: TARGET_DIR,
      env: { ...process.env },
      stdio: 'inherit',
    });

    logInfo('✅ Playwright package installed');
  } catch (error) {
    throw new Error(`Failed to install Playwright: ${error}`);
  }
}

function installBrowsers(): void {
  logInfo('Installing Chromium browser with dependencies...');

  try {
    // Set PLAYWRIGHT_BROWSERS_PATH=0 to install in local node_modules
    execSync('npx playwright install --with-deps --only-shell chromium', {
      cwd: TARGET_DIR,
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: '0',
      },
      stdio: 'inherit',
    });

    logInfo('✅ Chromium browser installed');
  } catch (error) {
    throw new Error(`Failed to install browsers: ${error}`);
  }
}

function verifyStructure(): boolean {
  logInfo('Verifying standalone_playwright structure...');

  const requiredPaths = [
    path.join(TARGET_DIR, 'package.json'),
    path.join(TARGET_DIR, 'package-lock.json'),
    path.join(TARGET_DIR, 'node_modules'),
    path.join(TARGET_DIR, 'node_modules', '.bin'),
    path.join(TARGET_DIR, 'node_modules', '@playwright'),
    path.join(TARGET_DIR, 'node_modules', 'playwright'),
    path.join(TARGET_DIR, 'node_modules', 'playwright-core'),
    path.join(TARGET_DIR, 'node_modules', 'playwright-core', '.local-browsers'),
  ];

  for (const requiredPath of requiredPaths) {
    if (!fs.existsSync(requiredPath)) {
      logError(`Missing required path: ${requiredPath}`);
      return false;
    }
  }

  // Check for browser installation
  const browsersPath = path.join(TARGET_DIR, 'node_modules', 'playwright-core', '.local-browsers');
  const browserDirs = fs.readdirSync(browsersPath);

  const hasChromium = browserDirs.some(dir => dir.startsWith('chromium_headless_shell-'));
  const hasFfmpeg = browserDirs.some(dir => dir.startsWith('ffmpeg-'));
  const hasLinks = browserDirs.includes('.links');

  if (!hasChromium) {
    logError('Chromium browser not found in .local-browsers');
    return false;
  }

  if (!hasFfmpeg) {
    logError('FFmpeg not found in .local-browsers');
    return false;
  }

  if (!hasLinks) {
    logError('.links directory not found in .local-browsers');
    return false;
  }

  logInfo('✅ standalone_playwright structure verified successfully');
  logInfo(`Found browsers: ${browserDirs.join(', ')}`);
  return true;
}

function isAlreadyPrepared(): boolean {
  if (!fs.existsSync(TARGET_DIR)) {
    return false;
  }

  // Check if package.json exists and has correct Playwright version
  const packageJsonPath = path.join(TARGET_DIR, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageLockPath = path.join(TARGET_DIR, 'package-lock.json');
    if (fs.existsSync(packageLockPath)) {
      const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
      const playwrightPackage = packageLock.packages?.['node_modules/@playwright/test'];

      if (playwrightPackage?.version !== PLAYWRIGHT_VERSION) {
        logInfo(`Playwright version mismatch. Expected: ${PLAYWRIGHT_VERSION}, Found: ${playwrightPackage?.version}`);
        return false;
      }
    }

    return verifyStructure();
  } catch (error) {
    logInfo('Error reading package files:', error);
    return false;
  }
}

async function main(): Promise<void> {
  try {
    logInfo('🎭 Preparing standalone Playwright...');

    if (isAlreadyPrepared()) {
      logInfo('✅ standalone_playwright is already prepared and valid');
      return;
    }

    createPlaywrightProject();
    installPlaywright();
    installBrowsers();

    if (!verifyStructure()) {
      throw new Error('Failed to create valid standalone_playwright structure');
    }

    logInfo('✅ standalone_playwright prepared successfully');
  } catch (error) {
    logError('❌ Failed to prepare standalone_playwright:', error);
    process.exit(1);
  }
}

main();
