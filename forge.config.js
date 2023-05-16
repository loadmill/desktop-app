require('dotenv').config();

module.exports = {
  makers: [
    {
      'config': {
        'name': 'loadmill'
      },
      'name': '@electron-forge/maker-squirrel',
    },
    {
      'name': '@electron-forge/maker-zip',
      'platforms': [
        'darwin'
      ]
    },
    {
      config: {
        additionalDMGOptions: {
          window: {
            size: {
              height: 460,
              width: 650,
            }
          }
        },
        background: './images/dmg-background.png',
        format: 'ULFO',
        icon: './images/disk-icon.icns',
      },
      name: '@electron-forge/maker-dmg',
    },
  ],
  packagerConfig: {
    icon: './images/MyIcon',
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.LOADMILL_KEY_CODE,
      tool: 'notarytool',
    },
    osxSign: {
      entitlements: 'entitlements.plist',
      'entitlements-inherit': 'entitlements.plist',
      'hardened-runtime': true,
      identity: `Developer ID Application: Loadmill LTD (${process.env.LOADMILL_KEY_CODE})`,
      'signature-flags': 'library',
    },
  },
  plugins: [
    [
      '@electron-forge/plugin-webpack',
      {
        'mainConfig': './webpack.main.config.js',
        'renderer': {
          'config': './webpack.renderer.config.js',
          'entryPoints': [
            {
              'html': './src/renderer-process/main-window/index.html',
              'js': './src/renderer-process/main-window/renderer.ts',
              'name': 'main_window',
              'preload': {
                'js': './src/renderer-process/main-window/preload.ts'
              }
            },
            {
              'html': './src/renderer-process/loadmill-view/index.html',
              'js': './src/renderer-process/loadmill-view/renderer.ts',
              'name': 'loadmill_view',
              'preload': {
                'js': './src/renderer-process/loadmill-view/preload.ts'
              }
            },
            {
              'html': './src/renderer-process/proxy-window/index.html',
              'js': './src/renderer-process/proxy-window/renderer.ts',
              'name': 'proxy_window',
              'preload': {
                'js': './src/renderer-process/proxy-window/preload.ts'
              }
            },
            {
              'html': './src/renderer-process/agent-view/index.html',
              'js': './src/renderer-process/agent-view/renderer.ts',
              'name': 'agent_view',
              'preload': {
                'js': './src/renderer-process/agent-view/preload.ts'
              }
            },
          ]
        }
      }
    ],
    [
      '@timfish/forge-externals-plugin',
      {
        'externals': [
          'vm2'
        ],
        'includeDeps': true
      }
    ]
  ],
  publishers: [
    {
      config: {
        authToken: process.env.GITHUB_TOKEN,
        draft: false,
        prerelease: false,
        repository: {
          name: 'desktop-app',
          owner: 'loadmill',
        },
      },
      name: '@electron-forge/publisher-github',
    }
  ],
};
