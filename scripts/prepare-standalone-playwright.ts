import { execSync } from 'child_process';
import { error as logError, log as logInfo } from 'console';
import * as fs from 'fs';
import * as path from 'path';

const TARGET_DIR = 'standalone_playwright';
const PLAYWRIGHT_VERSION = '1.50.0';

const main = async (): Promise<void> => {
  try {
    logInfo('🎭 Preparing standalone Playwright...');

    if (isAlreadyPrepared()) {
      logInfo('✅ standalone_playwright is already prepared and valid');
      return;
    }

    initializeStandalonePlaywrightProject();
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
};

const isAlreadyPrepared = (): boolean => {
  if (!fs.existsSync(TARGET_DIR)) {
    return false;
  }

  logInfo('Checking existing Playwright project...');
  if (!hasValidPackageJson()) {
    return false;
  }

  try {
    if (!hasValidPackageLock()) {
      return false;
    }
    return verifyStructure();
  } catch (error) {
    logInfo('Error reading package files:', error);
    return false;
  }
};

const hasValidPackageJson = (): boolean => {
  const packageJsonPath = path.join(TARGET_DIR, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }
  logInfo('Found package.json');
  return true;
};

const hasValidPackageLock = (): boolean => {
  const packageLockPath = path.join(TARGET_DIR, 'package-lock.json');
  if (fs.existsSync(packageLockPath)) {
    const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
    const playwrightPackage = packageLock.packages?.['node_modules/@playwright/test'];
    if (playwrightPackage?.version !== PLAYWRIGHT_VERSION) {
      logInfo(`Playwright version mismatch. Expected: ${PLAYWRIGHT_VERSION}, Found: ${playwrightPackage?.version}`);
      return false;
    }
  }
  return true;
};

const verifyStructure = (): boolean => {
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
      logError('Missing required path', { requiredPath });
      return false;
    }
  }
  logInfo('All required paths exist');
  logInfo('Verifying browsers in .local-browsers directory...');
  const browsersPath = path.join(TARGET_DIR, 'node_modules', 'playwright-core', '.local-browsers');
  const browserDirs = fs.readdirSync(browsersPath);

  const hasChromium = browserDirs.some(dir => dir.startsWith('chromium_headless_shell-'));
  const hasFfmpeg = browserDirs.some(dir => dir.startsWith('ffmpeg'));
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
  logInfo('Found browsers', { browserDirs });

  logInfo('✅ standalone_playwright structure verified successfully');
  return true;
};

const initializeStandalonePlaywrightProject = (): void => {
  logInfo('Creating standalone Playwright project...');

  logInfo('Creating target directory', { TARGET_DIR });
  createTargetDir();
  logInfo('Creating package.json file');
  createPrivatePackageJson();

  logInfo('✅ Created Playwright project structure');
};

const createTargetDir = () => {
  if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { force: true, recursive: true });
  }
  fs.mkdirSync(TARGET_DIR, { recursive: true });
};

const createPrivatePackageJson = () => {
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
};

const installPlaywright = (): void => {
  logInfo('Installing Playwright', { PLAYWRIGHT_VERSION });

  try {
    const command = `npm install @playwright/test@${PLAYWRIGHT_VERSION}`;
    logInfo('Running', { command });
    execSync(command, {
      cwd: TARGET_DIR,
      env: { ...process.env },
      stdio: 'inherit',
    });

    logInfo('✅ Playwright package installed');
  } catch (error) {
    throw new Error(`Failed to install Playwright: ${error}`);
  }
};

const installBrowsers = (): void => {
  logInfo('Installing Chromium browser with dependencies...');

  try {
    const command = 'npx playwright install --with-deps --only-shell chromium';
    logInfo('Running', { command });
    execSync(command, {
      cwd: TARGET_DIR,
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: '0', // Install browsers in  node_modules/playwright-core/.local-browsers
      },
      stdio: 'inherit',
    });

    logInfo('✅ Chromium browser installed');
  } catch (error) {
    logError('❌ Failed to install Chromium browser:', error);
    throw new Error(error);
  }
};

main();
