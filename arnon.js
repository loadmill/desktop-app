const a = {
  'lo0': [
    {
      'address': '127.0.0.1',
      'netmask': '255.0.0.0',
      'family': 'IPv4',
      'mac': '00:00:00:00:00:00',
      'internal': true,
      'cidr': '127.0.0.1/8'
    },
    {
      'address': '::1',
      'netmask': 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      'family': 'IPv6',
      'mac': '00:00:00:00:00:00',
      'internal': true,
      'cidr': '::1/128',
      'scopeid': 0
    },
    {
      'address': 'fe80::1',
      'netmask': 'ffff:ffff:ffff:ffff::',
      'family': 'IPv6',
      'mac': '00:00:00:00:00:00',
      'internal': true,
      'cidr': 'fe80::1/64',
      'scopeid': 1
    }
  ],
  'en0': [
    {
      'address': 'fe80::414:ef4f:2fd3:7f03',
      'netmask': 'ffff:ffff:ffff:ffff::',
      'family': 'IPv6',
      'mac': 'f0:18:98:2d:04:18',
      'internal': false,
      'cidr': 'fe80::414:ef4f:2fd3:7f03/64',
      'scopeid': 4
    },
    {
      'address': '192.168.0.69',
      'netmask': '255.255.255.0',
      'family': 'IPv4',
      'mac': 'f0:18:98:2d:04:18',
      'internal': false,
      'cidr': '192.168.0.69/24'
    }
  ],
  'awdl0': [
    {
      'address': 'fe80::ac90:43ff:fe10:da9f',
      'netmask': 'ffff:ffff:ffff:ffff::',
      'family': 'IPv6',
      'mac': 'ae:90:43:10:da:9f',
      'internal': false,
      'cidr': 'fe80::ac90:43ff:fe10:da9f/64',
      'scopeid': 9
    }
  ],
  'llw0': [
    {
      'address': 'fe80::ac90:43ff:fe10:da9f',
      'netmask': 'ffff:ffff:ffff:ffff::',
      'family': 'IPv6',
      'mac': 'ae:90:43:10:da:9f',
      'internal': false,
      'cidr': 'fe80::ac90:43ff:fe10:da9f/64',
      'scopeid': 10
    }
  ],
  'utun0': [
    {
      'address': 'fe80::4e0e:6f6a:dc53:754d',
      'netmask': 'ffff:ffff:ffff:ffff::',
      'family': 'IPv6',
      'mac': '00:00:00:00:00:00',
      'internal': false,
      'cidr': 'fe80::4e0e:6f6a:dc53:754d/64',
      'scopeid': 11
    }
  ],
  'utun1': [
    {
      'address': 'fe80::f300:8fef:b2ca:bb4',
      'netmask': 'ffff:ffff:ffff:ffff::',
      'family': 'IPv6',
      'mac': '00:00:00:00:00:00',
      'internal': false,
      'cidr': 'fe80::f300:8fef:b2ca:bb4/64',
      'scopeid': 12
    }
  ],
  'utun2': [
    {
      'address': 'fe80::ce81:b1c:bd2c:69e',
      'netmask': 'ffff:ffff:ffff:ffff::',
      'family': 'IPv6',
      'mac': '00:00:00:00:00:00',
      'internal': false,
      'cidr': 'fe80::ce81:b1c:bd2c:69e/64',
      'scopeid': 13
    }
  ],
  'utun3': [
    {
      'address': 'fe80::bdb4:1c72:a8b9:69b9',
      'netmask': 'ffff:ffff:ffff:ffff::',
      'family': 'IPv6',
      'mac': '00:00:00:00:00:00',
      'internal': false,
      'cidr': 'fe80::bdb4:1c72:a8b9:69b9/64',
      'scopeid': 14
    }
  ],
  'utun4': [
    {
      'address': 'fe80::3223:2dbe:3896:9a5e',
      'netmask': 'ffff:ffff:ffff:ffff::',
      'family': 'IPv6',
      'mac': '00:00:00:00:00:00',
      'internal': false,
      'cidr': 'fe80::3223:2dbe:3896:9a5e/64',
      'scopeid': 15
    }
  ]
};

const r = a.en0.find(networkInterfaceInfo =>
  networkInterfaceInfo.family === 'IPv4'
)['address'];

console.log(r);
