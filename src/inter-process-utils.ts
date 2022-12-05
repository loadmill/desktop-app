export const isFromPreload = (event: MessageEvent<unknown>): boolean =>
  event.source === window;
