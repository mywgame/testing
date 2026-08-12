/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme.ts';
interface EarningsPoint {
  date: string;
  earnings: number;
}

interface MonthlyEarningsChartProps {
  data: EarningsPoint[];
}

/**
 * Monthly Earnings area chart — pixel-matched to the figma reference
 * (recharts AreaChart, single cyan gradient fill). Receives its dataset via
 * props only, so Phase 2 can swap in a real time-series without touching
 * this component.
 */
export const MonthlyEarningsChart: React.FC<MonthlyEarningsChartProps> = ({ data }) => {
  const { t } = useTheme();

  return (
    <div className={`backdrop-blur-lg rounded-2xl p-5 border transition-all duration-300 lg:col-span-2 flex flex-col ${t.card}`}>
      <h3 className={`text-base font-semibold mb-2 shrink-0 ${t.text}`}>Monthly Earnings</h3>
      <div className="flex-1 w-full min-h-[250px] pt-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 12 }}>
            <defs>
              <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} vertical={false} />
            <XAxis
              dataKey="date"
              stroke={t.chartAxis}
              tick={{ fill: t.chartTick, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              stroke={t.chartAxis}
              tick={{ fill: t.chartTick, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={45}
              tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 10 }}
              labelStyle={{ color: t.isDark ? '#e5e7eb' : '#111827' }}
              itemStyle={{ color: '#06b6d4' }}
            />
            <Area type="monotone" dataKey="earnings" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#earningsGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyEarningsChart;
