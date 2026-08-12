/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useContext } from 'react';
import { ThemeContext, ThemeContextType } from '../contexts/ThemeContext.tsx';
import { getThemeTokens, ThemeTokens } from '../components/ui/themeTokens.ts';

/**
 * Custom Hook: Access the MetaFirm dark/light theme context, plus the
 * resolved visual token set (`t`) for the current mode — mirrors the
 * `t`-object pattern so styling stays declarative: `className={t.card}`.
 */
export const useTheme = (): ThemeContextType & { t: ThemeTokens } => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be consumed within a ThemeProvider.');
  }
  return { ...context, t: getThemeTokens(context.isDark) };
};

export default useTheme;
