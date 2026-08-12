/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StakingView } from '../Staking/StakingView.tsx';

interface RewardsViewProps {
  onBack: () => void;
}

export const RewardsView: React.FC<RewardsViewProps> = (props) => {
  return <StakingView {...props} />;
};

export default RewardsView;
