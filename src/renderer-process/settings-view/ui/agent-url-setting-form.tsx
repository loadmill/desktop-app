
import React from 'react';

import { ChangedSetting } from '../../../types/settings';

import { UrlSettingForm } from './url-setting-form';

export const AgentUrlSettingForm = ({
  onSave,
  setAgentUrl,
  agentUrl,
}: AgentUrlSettingFormProps): JSX.Element =>
  <UrlSettingForm
    label='Agent URL'
    onSave={ onSave }
    setUrl={ setAgentUrl }
    settingName='agentUrl'
    title='Loadmill Agent URL'
    url={ agentUrl }
  />;

export type AgentUrlSettingFormProps = {
  agentUrl: string;
  onSave: (changedSetting: ChangedSetting) => void;
  setAgentUrl: (agentUrl: string) => void;
};
