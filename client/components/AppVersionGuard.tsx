/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { App } from '@capacitor/app';
import { checkAppVersionRequirement, AppVersionStatus } from '../utils/versionCheck.ts';
import { ForceUpdateModal } from './ForceUpdateModal.tsx';

interface AppVersionGuardProps {
  children: React.ReactNode;
}

export const AppVersionGuard: React.FC<AppVersionGuardProps> = ({ children }) => {
  const [versionStatus, setVersionStatus] = useState<AppVersionStatus | null>(null);

  const runCheck = async () => {
    try {
      const status = await checkAppVersionRequirement();
      if (status) {
        setVersionStatus(status);
      }
    } catch (err) {
      console.warn('AppVersionGuard check failed:', err);
    }
  };

  useEffect(() => {
    // 1. Run check on initial app startup
    runCheck();

    // 2. Re-check whenever user brings the app back to foreground
    let appStateListener: any = null;
    const registerAppStateListener = async () => {
      try {
        appStateListener = await App.addListener('appStateChange', (state) => {
          if (state.isActive) {
            runCheck();
          }
        });
      } catch (err) {
        // Not native / web environment
      }
    };

    registerAppStateListener();

    // 3. Fallback interval check every 15 minutes
    const interval = setInterval(runCheck, 15 * 60 * 1000);

    return () => {
      clearInterval(interval);
      if (appStateListener && typeof appStateListener.remove === 'function') {
        appStateListener.remove();
      }
    };
  }, []);

  return (
    <>
      {children}
      {versionStatus && versionStatus.isForceUpdate && (
        <ForceUpdateModal versionStatus={versionStatus} />
      )}
    </>
  );
};
export default AppVersionGuard;
