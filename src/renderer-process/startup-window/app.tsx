import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { ThemeWrapper } from './ui/theme-wrapper';

function render() {
  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(<ThemeWrapper/>);
}

render();
