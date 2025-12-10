import { dialog, ipcMain } from 'electron';

import log from '../../log';
import { TransformResult } from '../../types/loadmill-types';
import { PlaywrightStepLocation } from '../../types/playwright';
import { CODEGEN, REFRESH_PAGE } from '../../universal/constants';
import { callLoadmillApi } from '../call-loadmill-api';
import { subscribeToMainProcessMessage } from '../main-events';

import { runPlaywrightCodegen } from './codegen-runner';

export const subscribeToCodegenEvents = (): void => {
  subscribeToMainProcessMessage(CODEGEN, async (_event, data) => {
    const { playwrightStepLocation, url } = data || {};
    try {
      await handleCodegenEvent(playwrightStepLocation, url);
    } catch (error) {
      log.error('Error handling codegen event:', error);
      dialog.showErrorBox(
        'Codegen Error',
        `An error occurred while generating code: ${error.message || error}`,
      );
    }
  });
};

export const handleCodegenEvent = async (playwrightStepLocation: PlaywrightStepLocation, url?: string): Promise<void> => {
  const generatedCode = await runPlaywrightCodegen(url);

  const { suiteId, flowId, stepId } = playwrightStepLocation;
  const response = await callLoadmillApi(`api/test-suites/${suiteId}/flows/${flowId}`);
  const flow = await response.json() as TransformResult;
  const step = flow.conf.requests.find((s) => s.id === stepId);

  const strippedCode = cleanGeneratedCode(generatedCode);
  step.postScript = strippedCode;

  await callLoadmillApi(`api/test-suites/${suiteId}/flows/${flowId}`, {
    body: JSON.stringify(flow.conf),
    method: 'PUT',
  });

  ipcMain.emit(REFRESH_PAGE);
};

const cleanGeneratedCode = (code: string): string =>
  code
    .split('\n')
    .map(l => l.trim())
    .filter(l => !isWrapperTestLine(l))
    .filter(l => !isEmptyLine(l))
    .filter(l => !isImportLine(l))
    .filter(l => !isEndTestBlockLine(l))
    .join('\n');

const isWrapperTestLine = (line: string): boolean =>
  line.startsWith('test(');

const isEmptyLine = (line: string): boolean =>
  line === '';

const isImportLine = (line: string): boolean =>
  line.startsWith('import ');

const isEndTestBlockLine = (line: string): boolean =>
  line === '});';
