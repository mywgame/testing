/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useState, useEffect } from 'react';
import { User, ApiResponse } from '../../shared/types/index.ts';
import { getApiUrl } from '../services/apiConfig.ts';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (
    emailOrUsername: string,
    password?: string,
    isRegister?: boolean,
    referralCode?: string,
    signupData?: { name?: string; username?: string; phone?: string; country?: string }
  ) => Promise<any>;
  verifyAdminMfa: (mfaToken: string, emailOtp: string, totpCode: string) => Promise<any>;
  resendAdminMfaOtp: (mfaToken: string) => Promise<any>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  syncProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-restore session from localStorage on initialization
  useEffect(() => {
    const savedToken = localStorage.getItem('metafirm_token');
    const savedUser = localStorage.getItem('metafirm_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('metafirm_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('metafirm_unauthorized', handleUnauthorized);
    };
  }, []);

  /**
   * Synchronize profile info from PostgreSQL back-end using active token
   */
  const syncProfile = async () => {
    if (!token) return;
    try {
      const response = await fetch(getApiUrl('/users/profile'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('metafirm_token');
          localStorage.removeItem('metafirm_user');
          setToken(null);
          setUser(null);
        }
        throw new Error('Failed to fetch user state from MetaFirm backend.');
      }

      const resData: ApiResponse<User> = await response.json();
      if (resData.success && resData.data) {
        setUser(resData.data);
        localStorage.setItem('metafirm_user', JSON.stringify(resData.data));
      }
    } catch (err: any) {
      console.error('MetaFirm Profile Sync Error:', err);
      setError(err.message || 'Profile sync failed');
    }
  };

  /**
   * Perform secure login/register flow using the MetaFirm backend API
   */
  const login = async (
    emailOrUsername: string,
    password?: string,
    isRegister?: boolean,
    referralCode?: string,
    signupData?: { name?: string; username?: string; phone?: string; country?: string }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const pwd = password || 'SecurePass123!';

      if (isRegister) {
        // Step A: Register the user with referral code and additional fields
        const registerResponse = await fetch(getApiUrl('/auth/register'), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: emailOrUsername,
            username: signupData?.username || emailOrUsername.split('@')[0],
            name: signupData?.name || '',
            phone: signupData?.phone || '',
            country: signupData?.country || 'United States',
            password: pwd,
            referralCode: referralCode || undefined,
          }),
        });

        if (!registerResponse.ok) {
          const errData = await registerResponse.json().catch(() => ({}));
          throw new Error(errData.error?.message || 'Failed to register account with MetaFirm backend.');
        }
      }

      // Step B: Authenticate the user to retrieve real JWT
      let loginResponse = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername: isRegister ? (signupData?.username || emailOrUsername) : emailOrUsername,
          password: pwd,
        }),
      });

      // If login failed, and we did not explicitly request registration, AND password was omitted (i.e. developer sync/simulation)
      if (!loginResponse.ok && !isRegister && !password) {
        console.log('Sync login failed. Attempting automatic user registration (upsert)...');
        const registerResponse = await fetch(getApiUrl('/auth/register'), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: emailOrUsername,
            username: emailOrUsername.split('@')[0],
            name: 'Institutional Client',
            phone: '',
            country: 'United States',
            password: pwd,
          }),
        });

        if (registerResponse.ok) {
          // Retry login
          loginResponse = await fetch(getApiUrl('/auth/login'), {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              emailOrUsername: emailOrUsername,
              password: pwd,
            }),
          });
        }
      }

      if (!loginResponse.ok) {
        const errData = await loginResponse.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Failed to authenticate with MetaFirm backend.');
      }

      const resData = await loginResponse.json();
      if (resData.success && resData.data) {
        if (resData.data.requiresMfa) {
          return resData.data;
        }

        const returnedUser = resData.data.user;
        const returnedToken = resData.data.accessToken || 'cookie_based_token';

        setToken(returnedToken);
        setUser(returnedUser);
        localStorage.setItem('metafirm_token', returnedToken);
        localStorage.setItem('metafirm_user', JSON.stringify(returnedUser));
        return resData.data;
      } else {
        throw new Error('MetaFirm authentication response returned invalid payload');
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.message || 'Authentication failed');
      localStorage.removeItem('metafirm_token');
      localStorage.removeItem('metafirm_user');
      setToken(null);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify Admin Multi-Factor Authentication (Email OTP + Google Authenticator)
   */
  const verifyAdminMfa = async (mfaToken: string, emailOtp: string, totpCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getApiUrl('/auth/admin/verify-mfa'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken, emailOtp, totpCode }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Admin MFA verification failed.');
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const returnedUser = resData.data.user;
        const returnedToken = resData.data.accessToken || 'cookie_based_token';

        setToken(returnedToken);
        setUser(returnedUser);
        localStorage.setItem('metafirm_token', returnedToken);
        localStorage.setItem('metafirm_user', JSON.stringify(returnedUser));
        return resData.data;
      } else {
        throw new Error('MFA verification response returned invalid payload');
      }
    } catch (err: any) {
      setError(err.message || 'MFA verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend Admin MFA Email OTP
   */
  const resendAdminMfaOtp = async (mfaToken: string) => {
    const response = await fetch(getApiUrl('/auth/admin/resend-mfa-otp'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mfaToken }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || 'Failed to resend verification OTP.');
    }
    return await response.json();
  };

  /**
   * Disconnect/Sign Out
   */
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch(getApiUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      }).catch(() => {});

      localStorage.removeItem('metafirm_token');
      localStorage.removeItem('metafirm_user');
      setToken(null);
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify registration OTP and sign in user immediately
   */
  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getApiUrl('/auth/verify-otp'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Failed to verify registration code.');
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const returnedUser = resData.data.user;
        const returnedToken = resData.data.accessToken || 'cookie_based_token';

        setToken(returnedToken);
        setUser(returnedUser);
        localStorage.setItem('metafirm_token', returnedToken);
        localStorage.setItem('metafirm_user', JSON.stringify(returnedUser));
      } else {
        throw new Error('Verification response did not return valid user data.');
      }
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      setError(err.message || 'Verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        verifyAdminMfa,
        resendAdminMfaOtp,
        verifyOtp,
        logout,
        syncProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
