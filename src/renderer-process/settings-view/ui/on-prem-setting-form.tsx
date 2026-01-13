
import React from 'react';

import { ChangedSetting } from '../../../types/settings';

import { UrlSettingForm } from './url-setting-form';

export const OnPremSettingForm = ({
  onSave,
  setOnPremURL,
  onPremURL,
}: OnPremSettingFormProps): JSX.Element =>
  <UrlSettingForm
    label='On Premises URL'
    onSave={ onSave }
    setUrl={ setOnPremURL }
    settingName='onPremURL'
    title='Loadmill On Premises URL'
    url={ onPremURL }
  />;

export type OnPremSettingFormProps = {
  onPremURL: string;
  onSave: (changedSetting: ChangedSetting) => void;
  setOnPremURL: (onPremURL: string) => void;
};
