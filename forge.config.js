// const fs = require('fs');
// const path = require('path');

// const { log } = console;

require('dotenv').config();

const isWindowsOS = process.platform === 'win32';

const { name, version, productName } = require('./package.json');

module.exports = {
  // hooks: {
  //   postPackage: (config, packageResult) => {
  //     // 1. copy standalone_npx and standalone_playwright to the app directory
  //     // 2. delete the standalone_npx and standalone_playwright folders from Resources
  //     // 3. create a symlink from Resources/standalone_npx/bin/node to the Electron binary in Frameworks/Electron Helper.app/Contents/MacOS/Electron Helper
  //     log('Inside Loadmill Forge postPackage hook');
  //     log(`config: ${JSON.stringify(config, null, 2)}`);
  //     log(`packageResult: ${JSON.stringify(packageResult, null, 2)}`);
  //     const arch = packageResult.arch;
  //     const platform = packageResult.platform;
  //     const outputPath = path.resolve(packageResult.outputPaths[0]);
  //     log(`Architecture: ${arch}`);
  //     log(`Platform: ${platform}`);
  //     log(`Output Path: ${outputPath}`); // /Users/giladgurandelman/desktop-app/out/Loadmill-darwin-x64

  //     const ApplicationPath = path.join(outputPath, 'Loadmill.app');
  //     // step 1: copy standalone_npx and standalone_playwright to the app directory
  //     const resourcesPath = path.join(ApplicationPath, 'Contents', 'Resources');
  //     const standaloneNpxPath = path.join(resourcesPath, 'standalone_npx');
  //     const standalonePlaywrightPath = path.join(resourcesPath, 'standalone_playwright');
  //     const targetStandaloneNpxPath = path.join(ApplicationPath, 'Contents', 'Resources', 'app', 'standalone_npx');
  //     const targetStandalonePlaywrightPath = path.join(ApplicationPath, 'Contents', 'Resources', 'app', 'standalone_playwright');
  //     log('Copying standalone_npx', { standaloneNpxPath, targetStandaloneNpxPath });
  //     // fs.copyFileSync(standaloneNpxPath, targetStandaloneNpxPath);
  //     require('child_process').execSync(`cp -R ${standaloneNpxPath} ${targetStandaloneNpxPath}`, { stdio: 'inherit' });
  //     log('Copying standalone_playwright', { standalonePlaywrightPath, targetStandalonePlaywrightPath });
  //     // fs.copyFileSync(standalonePlaywrightPath, targetStandalonePlaywrightPath);
  //     require('child_process').execSync(`cp -R ${standalonePlaywrightPath} ${targetStandalonePlaywrightPath}`, { stdio: 'inherit' });
  //     // step 2: delete the standalone_npx and standalone_playwright folders from Resources
  //     log('Deleting original standalone_npx and standalone_playwright folders from Resources');
  //     fs.rmSync(standaloneNpxPath, { force: true, recursive: true });
  //     fs.rmSync(standalonePlaywrightPath, { force: true, recursive: true });
  //     // step 3: create a symlink from Resources/standalone_npx/bin/node to the Electron binary in Frameworks/Electron Helper.app/Contents/MacOS/Electron Helper
  //     log('Creating symlink from Resources/standalone_npx/bin/node to the Electron binary in Frameworks/Electron Helper.app/Contents/MacOS/Electron Helper');
  //     const targetPath = path.join(ApplicationPath, 'Frameworks', 'Electron Helper.app', 'Contents', 'MacOS', 'Electron Helper');
  //     const nodeSymlink = path.join(ApplicationPath, 'Contents', 'Resources', 'app', 'standalone_npx', 'bin', 'node');
  //     if (fs.existsSync(nodeSymlink)) {
  //       fs.unlinkSync(nodeSymlink);
  //     }
  //     const targetRelativeToBin = '../../../../MacOS/Electron'; // This is a relative path from bin/ to Electron binary
  //     log(`Creating fixed symlink: ${nodeSymlink} -> ${targetPath}`);
  //     fs.symlinkSync(targetRelativeToBin, nodeSymlink);
  //   },
  // },
  makers: [
    {
      config: {
        certificateFile: './cert.pfx',
        certificatePassword: process.env.CERTIFICATE_PASSWORD,
        iconUrl: 'https://loadmill.com/favicon.ico',
        setupExe: `${productName}-${name}-${version}-Setup.exe`,
        setupIcon: './images/loadmill-icon-256-256.ico',
      },
      name: '@electron-forge/maker-squirrel',
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32'],
    },
    {
      config: {
        additionalDMGOptions: {
          window: {
            size: {
              height: 460,
              width: 650,
            },
          },
        },
        background: './images/dmg-background.png',
        format: 'ULFO',
        icon: './images/disk-icon.icns',
      },
      name: '@electron-forge/maker-dmg',
    },
  ],
  packagerConfig: {
    extraResource: [
      'standalone_npx',
      'standalone_playwright',
    ],
    icon: isWindowsOS ? './images/loadmill-icon-256-256' : './images/MyIcon',
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.LOADMILL_KEY_CODE,
      tool: 'notarytool',
    },
    osxSign: {
      entitlements: 'entitlements.plist',
      'entitlements-inherit': 'entitlements.plist',
      'gatekeeper-assess': false,
      'hardened-runtime': true,
      identity: `Developer ID Application: Loadmill LTD (${process.env.LOADMILL_KEY_CODE})`,
      'signature-flags': 'library',
    },
  },
  plugins: [
    {
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/renderer-process/main-window/index.html',
              js: './src/renderer-process/main-window/renderer.ts',
              name: 'main_window',
              preload: {
                js: './src/renderer-process/main-window/preload.ts',
              },
            },
            {
              html: './src/renderer-process/loadmill-view/index.html',
              js: './src/renderer-process/loadmill-view/renderer.ts',
              name: 'loadmill_view',
              preload: {
                js: './src/renderer-process/loadmill-view/preload.ts',
              },
            },
            {
              html: './src/renderer-process/proxy-view/index.html',
              js: './src/renderer-process/proxy-view/renderer.ts',
              name: 'proxy_view',
              preload: {
                js: './src/renderer-process/proxy-view/preload.ts',
              },
            },
            {
              html: './src/renderer-process/agent-view/index.html',
              js: './src/renderer-process/agent-view/renderer.ts',
              name: 'agent_view',
              preload: {
                js: './src/renderer-process/agent-view/preload.ts',
              },
            },
            {
              html: './src/renderer-process/settings-view/index.html',
              js: './src/renderer-process/settings-view/renderer.ts',
              name: 'settings_view',
              preload: {
                js: './src/renderer-process/settings-view/preload.ts',
              },
            },
          ],
        },
      },
      name: '@electron-forge/plugin-webpack',
    },
    {
      config: {
        externals: ['vm2', 'jsonpath'],
        includeDeps: true,
      },
      name: '@timfish/forge-externals-plugin',
    },
  ],
  protocols: [
    {
      name: 'Loadmill Desktop App',
      schemes: ['loadmill-desktop-app'],
    },
  ],
  publishers: [
    {
      config: {
        authToken: process.env.GITHUB_API_TOKEN,
        draft: false,
        prerelease: false,
        repository: {
          name: 'desktop-app',
          owner: 'loadmill',
        },
      },
      name: '@electron-forge/publisher-github',
    },
  ],
};
