import {
  sendFromProxyViewToRenderer,
} from '../inter-process-communication/to-renderer-process/main-to-renderer';
import log from '../log';
import { MainMessage } from '../types/messaging';
import { FETCH_PROFILES, GET_PROFILE, SET_PROFILE, UPDATED_PROFILES } from '../universal/constants';

import { callLoadmillApi } from './call-loadmill-api';
import { subscribeToMainProcessMessage } from './main-events';
import { get, set } from './persistence-store';
import { PROFILE } from './persistence-store/constants';

export const fetchProfiles = async (): Promise<string[]> => {
  try {
    const response = await callLoadmillApi('settings/recordings/profiles');
    if (response.status === 401) {
      throw new Error('Unauthorized 401');
    }
    const { profiles } = await response.json() as { profiles: string[] };
    return profiles;
  } catch (error) {
    log.error('Error fetching profiles, reason:', error);
  }
  return [];
};

export const subscribeToFetchProfiles = (): void => {
  subscribeToMainProcessMessage(FETCH_PROFILES, onFetchProfiles);
};

const onFetchProfiles = async (_event: Electron.IpcMainEvent, _data: MainMessage['data']) => {
  const profiles = await fetchProfiles();
  sendFromProxyViewToRenderer({
    data: { profiles },
    type: UPDATED_PROFILES,
  });
};

export const subscribeToSetProfile = (): void => {
  subscribeToMainProcessMessage(SET_PROFILE, onSetProfile);
};

const onSetProfile = async (_event: Electron.IpcMainEvent, { profile }: MainMessage['data']) => {
  set(PROFILE, profile);
};

export const getProfile = (): string => {
  const profile = get(PROFILE);
  if (!profile) {
    return 'Default';
  }
  return profile as string;
};

export const subscribeToGetProfile = (): void => {
  subscribeToMainProcessMessage(GET_PROFILE, onGetProfile);
};

const onGetProfile = async (_event: Electron.IpcMainEvent, _data: MainMessage['data']) => {
  const profile = getProfile();
  sendFromProxyViewToRenderer({
    data: { profile },
    type: GET_PROFILE,
  });
};

export const subscribeToProfileEvents = (): void => {
  subscribeToFetchProfiles();
  subscribeToSetProfile();
  subscribeToGetProfile();
};
