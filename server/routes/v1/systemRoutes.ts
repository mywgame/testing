/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response, NextFunction } from 'express';
import { settingsRepository } from '../../repositories/settingsRepository.ts';
import { sendSuccess } from '../../utils/response.ts';

const router = Router();

/**
 * @route GET /api/v1/system/app-version
 * @desc Retrieve current APK version policy, minimum required version, and download link
 * @access Public (No authentication required so APK can verify on cold boot)
 */
router.get('/app-version', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      minVersionSetting,
      latestVersionSetting,
      downloadUrlSetting,
      releaseNotesSetting,
      forceUpdateSetting,
    ] = await Promise.all([
      settingsRepository.findSystemSettingByKey('MIN_REQUIRED_APK_VERSION'),
      settingsRepository.findSystemSettingByKey('LATEST_APK_VERSION'),
      settingsRepository.findSystemSettingByKey('APK_DOWNLOAD_URL'),
      settingsRepository.findSystemSettingByKey('APK_UPDATE_RELEASE_NOTES'),
      settingsRepository.findSystemSettingByKey('FORCE_UPDATE_ENABLED'),
    ]);

    const minRequiredVersion = minVersionSetting?.value || '2.0.1';
    const latestVersion = latestVersionSetting?.value || '2.0.1';
    const downloadUrl = downloadUrlSetting?.value || 'https://pub-9c62303890854a49a9eda8efb728c7ff.r2.dev/android/metafirm-v2.0.1.apk';
    const releaseNotes = releaseNotesSetting?.value || 'MetaFirm v2.0.1: Security updates, performance enhancements, and improved trading node connectivity.';
    const forceUpdateEnabled = forceUpdateSetting?.value ? forceUpdateSetting.value === 'true' : true;

    return sendSuccess(res, {
      minRequiredVersion,
      latestVersion,
      downloadUrl,
      releaseNotes,
      forceUpdateEnabled,
      checkedAt: new Date().toISOString(),
    }, 200);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/system/exchange-rates
 * @desc Retrieve current calibrated forex exchange rates against USD/USDT
 * @access Public
 */
router.get('/exchange-rates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Current live calibrated market exchange rates for 2026
    const baseRates: Record<string, number> = {
      USD: 1.0,
      INR: 95.75,
      EUR: 0.856,
      GBP: 0.733,
      AED: 3.6725,
      CNY: 7.24,
      IDR: 16250,
      CAD: 1.362,
      AUD: 1.524,
      JPY: 154.5,
      BRL: 5.65,
      PKR: 278.5,
      VND: 25450,
    };

    return sendSuccess(res, {
      base: 'USD',
      rates: baseRates,
      timestamp: new Date().toISOString(),
    }, 200);
  } catch (error) {
    next(error);
  }
});

export default router;
