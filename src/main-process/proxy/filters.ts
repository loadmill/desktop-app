import { sendFromProxyToRenderer } from '../../inter-process-communication/proxy-to-render';
import log from '../../log';
import { MainMessage } from '../../types/messaging';
import { ProxyFilters } from '../../types/proxy-filters';
import { /* FILTERS, */ REFRESH_FILTERS, SET_FILTERS, UPDATED_FILTERS } from '../../universal/constants';
import { subscribeToMainProcessMessage } from '../main-events';
// import { get, set } from '../store';

const DEFULAT_FILTERS = [
  'google-analytics',
  'googleads',
  'goog.',
  'google',
  'facebook',
  'youtube',
  'twitter',
  'instagram',
  'linkedin',
  'pinterest',
  'apple',
  'microsoft',
  'amazon',
  'netflix',
  'spotify',
  'twitch',
  'tiktok',
];

let filters: ProxyFilters;

export const shouldFilter = (ctx: HttpMitmProxy.IContext): boolean => {
  try {
    const { headers: { host }, url } = ctx.clientToProxyRequest;
    const urlToFilter = host + url;
    const isFiltered = filters.some((filter) => urlToFilter.includes(filter));
    log.info('filtered', urlToFilter);
    return isFiltered;
  } catch (error) {
    log.error('error filtering', error);
  }
  return false;
};

export const subscribeToFiltersFromRenderer = (): void => {
  let filters = /* get(FILTERS) as ProxyFilters || */ DEFULAT_FILTERS;
  log.info('filters1', filters);

  subscribeToMainProcessMessage(SET_FILTERS, (_event, { filters: newFilters }: MainMessage['data']) => {
    log.info('setting filters', newFilters);
    filters = newFilters;
    // set(FILTERS, newFilters);
    // filters = get(FILTERS) as ProxyFilters;
  });

  subscribeToMainProcessMessage(REFRESH_FILTERS, () => {
    log.info('refreshing filters');
    log.info('filters', filters);
    sendFromProxyToRenderer({
      data: {
        filters,
      },
      type: UPDATED_FILTERS,
    });
  });
};
