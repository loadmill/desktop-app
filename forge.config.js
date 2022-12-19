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
              'html': './src/index.html',
              'js': './src/renderer.ts',
              'name': 'main_window',
              'preload': {
                'js': './src/preload-window.ts'
              }
            },
            {
              'html': './src/loadmill-view/index.html',
              'js': './src/loadmill-view/renderer.ts',
              'name': 'loadmill_view',
              'preload': {
                'js': './src/loadmill-view/preload.ts'
              }
            }
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
