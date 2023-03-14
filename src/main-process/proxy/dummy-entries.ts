import { ProxyEntry } from '../../types/proxy-entry';

export const dummyEntries: ProxyEntry[] = [
  {
    id: '1',
    request: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'John Doe'
        }),
      },
      headers: [
        {
          name: 'Accept',
          value: 'application/json'
        },
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      method: 'POST',
      url: 'https://www.dummy.com/user',
    },
    response: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          id: '123-456-789',
          name: 'John Doe'
        }),
      },
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      status: 200,
      statusText: 'OK',
    },
    timestamp: 1610000000000,
  },
  {
    id: '2',
    request: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          age: 30,
        }),
      },
      headers: [
        {
          name: 'Accept',
          value: 'application/json'
        },
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      method: 'PATCH',
      url: 'https://www.dummy.com/users/123-456-789',
    },
    response: {
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      status: 200,
    },
    timestamp: 1612000000333,
  },
  {
    id: '3',
    request: {
      headers: [
        {
          name: 'Accept',
          value: 'application/json'
        },
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      method: 'GET',
      url: 'https://www.dummy.com/users/123-456-789',
    },
    response: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          age: 30,
          id: '123-456-789',
          name: 'John Doe',
        }),
      },
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      status: 200,
    },
    timestamp: 1612000000555,
  },
  {
    id: '4',
    request: {
      headers: [
        {
          name: 'Accept',
          value: 'application/json'
        },
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      method: 'GET',
      url: 'https://www.dummy.com/cats/',
    },
    response: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify([
          {
            age: 4.5,
            id: '777-777-777',
            name: 'Mitzi',
          },
        ]),
      },
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      status: 200,
    },
    timestamp: 1612000000777,
  },
];
