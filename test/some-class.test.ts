import { jest } from '@jest/globals';

import { SomeClass } from '../src/some-class';

jest.mock('../src/some-class'); // this happens automatically with automocking

const mockMethod = jest.fn<(a: string, b: string) => void>();
jest.mocked(SomeClass).mockImplementation(() => {
  return {
    method: mockMethod,
  };
});

const some = new SomeClass();
some.method('a', 'b');

test('mocked method was called', () => {
  expect(mockMethod).toHaveBeenCalled();
});

console.log('Calls to method: ', mockMethod.mock.calls);
