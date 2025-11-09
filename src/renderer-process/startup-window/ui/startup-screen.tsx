import React, { useEffect, useState } from 'react';

import { isFromPreload } from '../../../inter-process-communication';
import { StartupRendererMessage } from '../../../types/messaging';
import { StartupProgress } from '../../../types/startup-progress';
import { MESSAGE, STARTUP_PROGRESS } from '../../../universal/constants';

import { LoadmillIconColor } from './loadmill-icon-color';
import { AnimatedProgressBar } from './progress-bar';

const initLabel = 'Initializing secure environment';
const loadingLabel = 'Loading core modules';
const finalizingLabel = 'Finalizing startup';
const readyLabel = 'App is Ready';

const baseStyle = {
  background: 'rgba(16,30,44,0.95)',
  borderRadius: 16,
  boxShadow: '0 8px 32px #0006',
  gap: 32,
  maxWidth: 420,
  width: '100%',
};

const finalStyle = {
  ...baseStyle,
  opacity: 0.8,
  transform: 'scale(0.95)',
  transition: 'all 1s ease',
};

export const StartupScreen = (): JSX.Element => {
  window.desktopApi.startupProgress('startScreenStarted');
  const [currentStep, setCurrentStep] = useState<StartupProgress | 'init'>('init');
  const [lastEventTimestamp, setLastEventTimestamp] = useState<number | null>(Date.now());
  const [isAppDoneLoading, setIsAppDoneLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState(initLabel);
  const [maxProgress, setMaxProgress] = useState(1);
  const [finalEffect, setFinalEffect] = useState(false);
  const isReady = ['fullLoad', 'readyStateComplete'].includes(currentStep) && isAppDoneLoading;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isReady) {
        window.desktopApi.startupProgress('appReady');
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [isReady]);

  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => {
        setFinalEffect(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (currentStep === 'init') {
      timeout = setTimeout(() => {
        handleHeadTag();
      }, 10000);
    } else if (currentStep === 'headTag') {
      timeout = setTimeout(() => {
        handleComponentDidMount();
      }, 30000);
    } else if (currentStep === 'componentDidMount') {
      timeout = setTimeout(() => {
        handleFullLoad();
      }, 30000);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [currentStep]);

  useEffect(() => {
    window.addEventListener(MESSAGE, onPreloadMessage);
    return () => {
      window.removeEventListener(MESSAGE, onPreloadMessage);
    };
  }, []);

  const onPreloadMessage = (event: MessageEvent<StartupRendererMessage>) => {
    if (isFromPreload(event)) {
      const { data: { data, type } } = event;
      if (type === STARTUP_PROGRESS) {
        onStartupProgress(data);
      }
    }
  };

  const onStartupProgress = (data: StartupRendererMessage['data']) => {
    if (data?.startupProgress) {
      const event = data.startupProgress;
      switch (event) {
        case 'headTag':
          handleHeadTag();
          break;
        case 'componentDidMount':
          handleComponentDidMount();
          break;
        case 'fullLoad':
        case 'readyStateComplete':
          handleFullLoad();
          break;
        default:
          break;
      }
    }
  };

  const isEventArrivedTooFast = (currentTimestamp: number): boolean => {
    return (!!lastEventTimestamp && currentTimestamp - lastEventTimestamp < 1250);
  };

  const handleHeadTag = () => {
    executeWithDelayIfNeeded(() => {
      setCurrentStep('headTag');
      setProgress(Math.random() * (0.35 - 0.25) + 0.25);
      setLabel(loadingLabel);
    });
  };

  const handleComponentDidMount = () => {
    executeWithDelayIfNeeded(() => {
      setCurrentStep('componentDidMount');
      setMaxProgress(0.99);
      setProgress(Math.random() * (0.90 - 0.85) + 0.85);
      setLabel(finalizingLabel);
    });
  };

  const handleFullLoad = () => {
    executeWithDelayIfNeeded(() => {
      setCurrentStep('fullLoad');
      setMaxProgress(1);
      setProgress(1);
      setLabel(readyLabel);
      setIsAppDoneLoading(true);
    });
  };

  const executeWithDelayIfNeeded = (callback: () => void) => {
    const currentTimestamp = Date.now();
    if (isEventArrivedTooFast(currentTimestamp)) {
      setTimeout(() => {
        callback();
      }, 1250 - (Date.now() - lastEventTimestamp));
    } else {
      callback();
    }
    setLastEventTimestamp(currentTimestamp);
  };

  return (
    <div
      style={ {
        background: '#101e2c',
        display: 'grid',
        height: '100vh',
        placeItems: 'center',
      } }
    >
      <div
        className={ `page-wrapper${finalEffect ? ' final-effect' : ''}` }
        style={ finalEffect ? finalStyle : baseStyle }
      >
        <StartupTitle />
        <SpinningLoadmillIcon />
        <ProgressLabel
          label={ label }
          showDots={ !isReady }
        />
        <AnimatedProgressBar
          max={ maxProgress }
          progress={ progress }
          stepInterval={ 300 }
          stepPercent={ 0.005 }
        />
      </div>
    </div>
  );
};

const StartupTitle = (): JSX.Element => (
  <h2
    style={ {
      color: '#fff',
      letterSpacing: 1,
      marginBlockEnd: 0,
      marginBlockStart: 0,
      textAlign: 'center',
    } }
  >
    Launching Loadmill Desktop
  </h2>
);

const SpinningLoadmillIcon = (): JSX.Element => (
  <>
    <div style={ { alignItems: 'center', display: 'flex', justifyContent: 'center', width: '100%' } }>
      <LoadmillIconColor style={ { animation: 'spin 4s linear infinite', display: 'block' } } />
    </div>
    <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
    </style>
  </>
);

function ProgressLabel({ showDots, label }: { label: string, showDots: boolean }): JSX.Element {
  const [dotCount, setDotCount] = useState(0);
  useEffect(() => {
    setDotCount(0);
    const interval = setInterval(() => {
      setDotCount((prev) => (prev < 3 ? prev + 1 : 0));
    }, 300);
    return () => clearInterval(interval);
  }, [label]);
  return (
    <div
      style={ {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      } }
    >
      <span
        style={ {
          alignItems: 'center',
          color: '#fff',
          display: 'inline-flex',
          fontSize: 16,
          fontWeight: 600,
          position: 'relative',
          textAlign: 'center',
        } }
      >
        <span>{label}</span>
        {showDots && (
          <span
            style={ {
              display: 'inline-block',
              fontFamily: 'monospace',
              marginLeft: 4,
              overflow: 'hidden',
              textAlign: 'left',
              verticalAlign: 'bottom',
              width: '1.6em',
            } }
          >
            {'.'.repeat(dotCount)}
          </span>
        )}
      </span>
    </div>
  );
}
