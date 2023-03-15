import { sendFromProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
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
    sendFromProxyToRenderer({
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
