/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { App } from '@capacitor/app';
import { api } from '../services/api.ts';
import { isCapacitor } from '../services/apiConfig.ts';

export interface AppVersionStatus {
  isNativeApp: boolean;
  currentVersion: string;
  minRequiredVersion: string;
  latestVersion: string;
  downloadUrl: string;
  releaseNotes: string;
  isOutdated: boolean;
  isForceUpdate: boolean;
}

/**
 * Compare two semver strings (e.g. "1.0.0" vs "1.1.0")
 * Returns:
 *  -1 if v1 < v2
 *   0 if v1 === v2
 *   1 if v1 > v2
 */
export function compareSemver(v1: string, v2: string): number {
  const parse = (v: string) =>
    (v || '0')
      .replace(/[^0-9.]/g, '')
      .split('.')
      .map((part) => parseInt(part, 10) || 0);

  const parts1 = parse(v1);
  const parts2 = parse(v2);
  const maxLen = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }
  return 0;
}

/**
 * Get installed app version string from Capacitor runtime or fallback
 */
export async function getInstalledAppVersion(): Promise<string> {
  try {
    if (isCapacitor()) {
      const info = await App.getInfo();
      if (info && info.version) {
        return info.version;
      }
    }
  } catch (error) {
    console.warn('Failed to retrieve Capacitor app version info:', error);
  }
  // Default base version for APK installations without metadata
  return '1.0.0';
}

/**
 * Check if the current app instance requires a forced or optional update
 */
export async function checkAppVersionRequirement(): Promise<AppVersionStatus | null> {
  try {
    const isNative = isCapacitor();
    const currentVersion = await getInstalledAppVersion();

    const response = await api.getAppVersionConfig();
    if (!response.success || !response.data) {
      return null;
    }

    const {
      minRequiredVersion,
      latestVersion,
      downloadUrl,
      releaseNotes,
      forceUpdateEnabled,
    } = response.data;

    // Check if current version is strictly below min required version
    const belowMin = compareSemver(currentVersion, minRequiredVersion) < 0;
    // Check if current version is below the latest available version
    const belowLatest = compareSemver(currentVersion, latestVersion) < 0;

    const isForceUpdate = isNative && belowMin && forceUpdateEnabled;
    const isOutdated = isNative && (belowMin || belowLatest);

    return {
      isNativeApp: isNative,
      currentVersion,
      minRequiredVersion,
      latestVersion,
      downloadUrl: downloadUrl || 'https://metafirm.app',
      releaseNotes: releaseNotes || 'Enhanced security and high-speed network routing.',
      isOutdated,
      isForceUpdate,
    };
  } catch (error) {
    console.error('App version check failed:', error);
    return null;
  }
}
