import { callLoadmillApi } from './call-loadmill-api';

export const getUser = async (): Promise<User> => {
  const response = await callLoadmillApi('auth/logged-in-user', {
    method: 'GET',
  });

  const user = await response.json() as User;

  return user;
};

export type User = {
  displayName: string;
  email: string;
  id: string;
};
