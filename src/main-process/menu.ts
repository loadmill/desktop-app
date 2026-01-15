import { app, Menu } from 'electron';

import { downloadMainLog } from '../log/download-logs';
import { READY } from '../universal/constants';

import { showAuthTokenInput } from './authentication';
import { symlinkPlaywright } from './standalone-playwright/symlink-playwright';
import { checkForUpdates } from './updates';
import { switchToAgentView, switchToSettingsView } from './views';

const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';

const windowsHelpSubmenu = [
  {
    click: () => checkForUpdates(),
    label: 'Check for Updates...',
  },
  {
    click: () => app.showAboutPanel(),
    label: 'About Loadmill Desktop App',
  },
];

const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      {
        click: () => checkForUpdates(),
        label: 'Check for Updates...',
      },
      { type: 'separator' },
      {
        click: () => switchToSettingsView(),
        label: 'Settings...',
      },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
    ],
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      ...(!isMac ? [
        {
          click: () => switchToSettingsView(),
          label: 'Settings',
        },
        { type: 'separator' },
      ] : []),
      isMac ? { role: 'close' } : { role: 'quit' },
    ],
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' },
          ],
        },
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
      ]),
    ],
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      {
        click: () => switchToAgentView(),
        label: 'Private Agent Log',
      },
      {
        click: () => showAuthTokenInput(),
        label: 'Enter authentication token',
      },
    ],
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' },
      ] : [
        { role: 'close' },
      ]),
    ],
  },
  {
    role: 'help',
    submenu: [
      ...(isWindows ? windowsHelpSubmenu : []),
      {
        click: () => downloadMainLog(),
        label: 'Download App Logs',
      },
      {
        type: 'separator',
      },
      {
        click: () => symlinkPlaywright({ triggeredByUser: true }),
        label: 'Reinstall Playwright',
      },
      {
        type: 'separator',
      },
      {
        click: async () => {
          const { shell } = require('electron');
          await shell.openExternal('https://loadmill.com');
        },
        label: 'Learn More',
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template as Electron.MenuItemConstructorOptions[]);
app.on(READY, () => Menu.setApplicationMenu(menu));
