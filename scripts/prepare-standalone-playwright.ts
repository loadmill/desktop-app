import { execSync } from 'child_process';
import { error as logError, log as logInfo } from 'console';
import * as fs from 'fs';
import * as path from 'path';

const PLAYWRIGHT_VERSION = '1.50.0';

type MacArch = 'x64' | 'arm64';

// Playwright host platform used to download browsers for a specific mac arch
const MAC_HOST_PLATFORMS: Record<MacArch, string> = {
  arm64: 'mac14-arm64',
  x64: 'mac14',
};

// Mach-O header constants
const MH_MAGIC_64 = 0xfeedfacf;
const FAT_MAGIC = 0xcafebabe;
const MACHO_CPU_TYPES: Record<MacArch, number> = {
  arm64: 0x0100000c,
  x64: 0x01000007,
};

const parseArch = (): MacArch | undefined => {
  const archArg = process.argv.find(arg => arg.startsWith('--arch='));
  if (!archArg) {
    return undefined;
  }
  const arch = archArg.slice('--arch='.length);
  if (arch !== 'x64' && arch !== 'arm64') {
    throw new Error(`Unsupported --arch value: ${arch}. Expected x64 or arm64`);
  }
  if (process.platform !== 'darwin') {
    throw new Error('--arch is only supported on mac');
  }
  return arch;
};

// Without --arch, prepare for the host arch in the root standalone_playwright (dev mode, Windows)
const TARGET_ARCH = parseArch();
const TARGET_DIR = TARGET_ARCH
  ? path.join('standalone_playwright_arch', TARGET_ARCH, 'standalone_playwright')
  : 'standalone_playwright';
const EXPECTED_ARCH = TARGET_ARCH || process.arch;

const main = async (): Promise<void> => {
  try {
    logInfo('🎭 Preparing standalone Playwright...', { EXPECTED_ARCH, TARGET_DIR });

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

  const hasChromium = browserDirs.some(dir => dir.startsWith('chromium-'));
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

  if (!verifyMacBinariesArch(browsersPath, browserDirs)) {
    return false;
  }

  logInfo('✅ standalone_playwright structure verified successfully');
  return true;
};

/**
 * Verifies the downloaded mac binaries were built for the expected arch.
 * Playwright downloads for the host arch by default, so a cached copy may hold the wrong one.
 */
const verifyMacBinariesArch = (browsersPath: string, browserDirs: string[]): boolean => {
  if (process.platform !== 'darwin') {
    return true;
  }
  logInfo('Verifying mac binaries arch', { EXPECTED_ARCH });

  const chromiumDir = browserDirs.find(dir => dir.startsWith('chromium-'));
  const ffmpegDir = browserDirs.find(dir => dir.startsWith('ffmpeg'));
  const binaries = [
    path.join(browsersPath, chromiumDir, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
    path.join(browsersPath, ffmpegDir, 'ffmpeg-mac'),
  ];

  for (const binary of binaries) {
    if (!fs.existsSync(binary)) {
      logError('Missing mac binary', { binary });
      return false;
    }
    if (!isMachOForArch(binary, EXPECTED_ARCH)) {
      logError('Mac binary arch mismatch', { EXPECTED_ARCH, binary });
      return false;
    }
  }

  logInfo('Mac binaries match expected arch', { EXPECTED_ARCH });
  return true;
};

const isMachOForArch = (binaryPath: string, arch: string): boolean => {
  const expectedCpuType = MACHO_CPU_TYPES[arch as MacArch];
  if (expectedCpuType === undefined) {
    logError('Unsupported arch for Mach-O check', { arch });
    return false;
  }

  const header = Buffer.alloc(4096);
  const fd = fs.openSync(binaryPath, 'r');
  let bytesRead: number;
  try {
    bytesRead = fs.readSync(fd, header, 0, header.length, 0);
  } finally {
    fs.closeSync(fd);
  }
  if (bytesRead < 8) {
    return false;
  }

  // Thin 64-bit Mach-O is little-endian on both x86_64 and arm64
  if (header.readUInt32LE(0) === MH_MAGIC_64) {
    return header.readUInt32LE(4) === expectedCpuType;
  }

  // Universal binary: big-endian header followed by 20-byte fat_arch entries
  if (header.readUInt32BE(0) === FAT_MAGIC) {
    const archCount = header.readUInt32BE(4);
    for (let i = 0; i < archCount && 8 + (i + 1) * 20 <= bytesRead; i++) {
      if (header.readUInt32BE(8 + i * 20) === expectedCpuType) {
        return true;
      }
    }
    return false;
  }

  logError('Not a 64-bit Mach-O binary', { binaryPath });
  return false;
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
    const command = 'npx playwright install --with-deps --no-shell chromium';
    logInfo('Running', { command });
    execSync(command, {
      cwd: TARGET_DIR,
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: '0', // Install browsers in  node_modules/playwright-core/.local-browsers
        ...(TARGET_ARCH && { PLAYWRIGHT_HOST_PLATFORM_OVERRIDE: MAC_HOST_PLATFORMS[TARGET_ARCH] }),
      },
      stdio: 'inherit',
    });

    logInfo('✅ Chromium browser installed');
  } catch (error) {
    logError('❌ Failed to install Chromium browser:', error);
    throw error;
  }
};

main();
