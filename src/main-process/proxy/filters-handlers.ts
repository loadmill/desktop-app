import {
  sendFromProxyViewToRenderer,
} from '../../inter-process-communication/to-renderer-process/main-to-renderer';
import { MainMessage } from '../../types/messaging';
import { INIT_FILTER_REGEX, SET_FILTER_REGEX } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';

import { getFilterRegex, initFilterRegex, setFilterRegex } from './filters';
import { sendUpdatedEntries } from './refresh-entries';

export const subscribeToFilterRegexEvents = (): void => {
  initFilterRegex();
  subscribeToInitFilterRegexFromRenderer();
  subscribeToSetFilterRegexFromRenderer();
};

const subscribeToInitFilterRegexFromRenderer = (): void => {
  subscribeToMainProcessMessage(INIT_FILTER_REGEX, () => {
    sendFromProxyViewToRenderer({
      data: {
        filterRegex: getFilterRegex(),
      },
      type: INIT_FILTER_REGEX,
    });
  });
};

const subscribeToSetFilterRegexFromRenderer = (): void => {
  subscribeToMainProcessMessage(SET_FILTER_REGEX, (_event, { filterRegex }: MainMessage['data']) => {
    setFilterRegex(filterRegex);
    sendUpdatedEntries();
  });
};
