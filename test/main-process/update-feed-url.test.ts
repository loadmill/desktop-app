import { getFeedURL } from '../../src/main-process/update-feed-url';

const HOST = 'https://update.electronjs.org';
const REPO = 'loadmill/desktop-app';
const VERSION = '3.1.0';

const feedURL = (
  platform: NodeJS.Platform,
  arch: string,
  runningUnderARM64Translation = false,
): string => getFeedURL({ arch, host: HOST, platform, repo: REPO, runningUnderARM64Translation, version: VERSION });

describe('getFeedURL', () => {
  test('darwin x64', () => {
    expect(feedURL('darwin', 'x64')).toBe(`${HOST}/${REPO}/darwin-x64/${VERSION}`);
  });

  test('darwin arm64', () => {
    expect(feedURL('darwin', 'arm64')).toBe(`${HOST}/${REPO}/darwin-arm64/${VERSION}`);
  });

  test('darwin x64 under Rosetta crossgrades to the latest arm64 release', () => {
    expect(feedURL('darwin', 'x64', true)).toBe(`${HOST}/${REPO}/darwin-arm64/0.0.0`);
  });

  test('win32 x64', () => {
    expect(feedURL('win32', 'x64')).toBe(`${HOST}/${REPO}/win32-x64/${VERSION}`);
  });

  test('translation flag is ignored on non-darwin platforms', () => {
    expect(feedURL('win32', 'x64', true)).toBe(`${HOST}/${REPO}/win32-x64/${VERSION}`);
  });
});
