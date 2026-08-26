/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardData } from '../types/index.ts';
import { api } from './api.ts';

let memoryCachedDashboard: DashboardData | null = null;
let activeFetchPromise: Promise<DashboardData | null> | null = null;

const CACHE_KEY = 'metafirm_cached_dashboard_data';

/**
 * Retrieve synchronously cached dashboard snapshot for 0ms initial render
 */
export const getCachedDashboardData = (): DashboardData | null => {
  if (memoryCachedDashboard) return memoryCachedDashboard;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      memoryCachedDashboard = JSON.parse(raw);
      return memoryCachedDashboard;
    }
  } catch {
    // ignore
  }
  return null;
};

/**
 * Store snapshot in memory and sessionStorage
 */
export const setCachedDashboardData = (data: DashboardData | null) => {
  memoryCachedDashboard = data;
  try {
    if (data) {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } else {
      sessionStorage.removeItem(CACHE_KEY);
    }
  } catch {
    // ignore
  }
};

/**
 * Clear cached dashboard data on logout
 */
export const clearDashboardCache = () => {
  memoryCachedDashboard = null;
  activeFetchPromise = null;
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
};

/**
 * Fetch fresh dashboard data with deduplicated in-flight promises
 */
export const fetchDashboardCached = async (forceFresh = false): Promise<DashboardData | null> => {
  if (!forceFresh && activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    try {
      const response = await api.get<DashboardData>('/users/dashboard');
      if (response.success && response.data) {
        setCachedDashboardData(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      console.warn('Dashboard sync note:', err);
      return null;
    } finally {
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
};

/**
 * Background prefetch trigger (e.g. while user is on Ventures page or upon login)
 */
export const prefetchDashboardData = () => {
  const token = localStorage.getItem('metafirm_token');
  if (token) {
    fetchDashboardCached(false);
  }
};
