/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../contexts/AuthContext.tsx';

/**
 * Custom Hook: Access the MetaFirm authentication context simply.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be consumed within an AuthProvider.');
  }
  return context;
};

export default useAuth;
