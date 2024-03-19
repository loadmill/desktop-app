import { toTimestamp } from '../../src/main-process/har-to-proxy/timestamp';

describe('toTimestamp', () => {
  test('Expect to convert an ISO 8601 date to a timestamp', () => {
    expect(toTimestamp('2020-05-20T00:00:00.000Z')).toBe(1589932800000);
  });
  test('Expect to convert an ISO 8601 date with offset to a timestamp', () => {
    expect(toTimestamp('2020-05-20T00:00:00.000+00:00')).toBe(1589932800000);
  });
  test('Expect to convert an ISO 8601 date with missing leading zeros to a timestamp', () => {
    const timestamp = toTimestamp('2020-5-20T0:0:0.000Z');
    expect(typeof timestamp).toBe('number');
    expect(new Date(timestamp)).toBeInstanceOf(Date);
  });
});
