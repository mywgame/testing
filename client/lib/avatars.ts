/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * System avatar catalog. Every SVG under `client/assets/avatars/` is
 * auto-discovered via Vite's `import.meta.glob` — dropping a new avatar
 * file into that folder is enough to make it selectable, no manual
 * registration needed here.
 */
const modules = import.meta.glob('../assets/avatars/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export interface SystemAvatar {
  id: string;
  url: string;
}

export const SYSTEM_AVATARS: SystemAvatar[] = Object.entries(modules)
  .map(([path, url]) => {
    const fileName = path.split('/').pop() || path;
    const id = fileName.replace(/\.svg$/, '');
    return { id, url };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

export const DEFAULT_AVATAR_ID = SYSTEM_AVATARS[0]?.id ?? '';

export const getAvatarUrl = (id: string | null | undefined): string => {
  const found = SYSTEM_AVATARS.find((a) => a.id === id);
  return found?.url ?? SYSTEM_AVATARS[0]?.url ?? '';
};

export default SYSTEM_AVATARS;
