require('dotenv').config();

const isWindowsOS = process.platform === 'win32';

const { name, version, productName } = require('./package.json');

module.exports = {
  makers: [
    {
      config: {
        certificateFile: './cert.pfx',
        certificatePassword: process.env.CERTIFICATE_PASSWORD,
        iconUrl: 'https://loadmill.com/favicon.ico',
        setupExe: `${productName}-${name}-${version}-Setup.exe`,
        setupIcon: './images/loadmill-icon-256-256.ico',
        // windowsSign: {
        //   // tell signtool where to find the certificate and password
        //   signWithParams: `/f ./cert.pfx /p ${process.env.CERTIFICATE_PASSWORD} /fd SHA256 /v /debug`,
        // },
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
    afterCopyExtraResources: [
      (buildPath, electronVersion, platform, arch, callback) => {
        const path = require('path');
        const fs = require('fs');
        const glob = require('glob');
        console.log('Running afterCopyExtraResources hook...');
        console.log({ arch, buildPath, electronVersion, platform });

        const chromiumDir = path.join(
          buildPath,
          'Loadmill.app',
          'Contents',
          'Resources',
          'standalone_playwright',
          'node_modules',
          'playwright-core',
          '.local-browsers',
        );

        console.log({ chromiumDir });

        try {
          const matches = glob.sync(
            path.join(chromiumDir, '**/gpu_shader_cache.bin'),
            { nodir: true },
          );

          matches.forEach(file => {
            console.log(`Changing permissions for: ${file}`);
            fs.chmodSync(file, 0o644);
          });

          console.log('Permissions changed successfully.');
        } catch (err) {
          console.warn('Permission fix failed (may be fine if files don’t exist):', err.message);
        }

        callback();
      },
    ],
    extraResource: [
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
              html: './src/renderer-process/startup-window/index.html',
              js: './src/renderer-process/startup-window/renderer.ts',
              name: 'startup_window',
              preload: {
                js: './src/renderer-process/startup-window/preload.ts',
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
