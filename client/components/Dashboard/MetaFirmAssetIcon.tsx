/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import logoMarkImg from '../../../assets/images/branding/logo-mark.png';

interface MetaFirmAssetIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MetaFirmAssetIcon: React.FC<MetaFirmAssetIconProps> = ({
  className = '',
  size = 'md',
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-16 h-16';
      case 'md':
      default:
        return 'w-12 h-12';
    }
  };

  const dims = getDimensions();

  return (
    <div className={`relative flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 shadow-lg shadow-indigo-500/20 text-white font-black ${dims} ${className}`} id="metafirm-asset-icon">
      {/* Outer spinning borders & details */}
      <div className="absolute inset-0.5 rounded-full border border-white/20 animate-spin-slow pointer-events-none" />
      
      {/* Dynamic letter M mark */}
      <img
        src={logoMarkImg}
        alt="MetaFirm Icon"
        referrerPolicy="no-referrer"
        className="w-1/2 h-1/2 object-contain drop-shadow-md z-10"
      />
    </div>
  );
};

export default MetaFirmAssetIcon;
