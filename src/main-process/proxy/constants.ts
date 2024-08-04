import path from 'path';

import { app } from 'electron';

export const PROXY_CERTIFICATES_DIR_PATH = path.join(app.getPath('userData'), 'proxy');
