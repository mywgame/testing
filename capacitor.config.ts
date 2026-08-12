import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.meta.metafirm',
  appName: 'MetaFirm',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;