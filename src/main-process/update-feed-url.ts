export type FeedURLOptions = {
  arch: string;
  host: string;
  platform: NodeJS.Platform;
  repo: string;
  runningUnderARM64Translation: boolean;
  version: string;
};

/**
 * Builds the update.electronjs.org feed URL.
 * An x64 build running under Rosetta on Apple Silicon is pointed at the darwin-arm64 feed
 * with version 0.0.0, so it is offered the latest arm64 release (crossgrade).
 * Once on arm64 the translation flag is false, so the normal feed is used.
 */
export const getFeedURL = ({
  arch,
  host,
  platform,
  repo,
  runningUnderARM64Translation,
  version,
}: FeedURLOptions): string => {
  if (platform === 'darwin' && runningUnderARM64Translation) {
    return `${host}/${repo}/darwin-arm64/0.0.0`;
  }
  return `${host}/${repo}/${platform}-${arch}/${version}`;
};
