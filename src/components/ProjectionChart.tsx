import { observer } from 'mobx-react-lite';
import React from 'react';
import { themeStore } from '../stores/ThemeStore';

interface ChartData {
  year: number;
  balance: number;
  realBalance: number;
  annualContribution: number;
  realAnnualContribution: number;
  yearlyGain: number;
  realYearlyGain: number;
}

interface ProjectionChartProps {
  data: ChartData[];
}

export const ProjectionChart: React.FC<ProjectionChartProps> = observer(({ data }) => {
  const isDark = themeStore.theme === 'dark';
  if (data.length === 0) return null;

  const maxBalance = Math.max(...data.map(d => Math.max(d.balance, d.realBalance)));
  const chartHeight = 300;
  const chartWidth = 600;
  const padding = 50;

  const xScale = (index: number) => {
    return padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
  };

  const yScale = (value: number) => {
    return chartHeight - padding - ((value / maxBalance) * (chartHeight - 2 * padding));
  };

  const nominalPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.balance)}`)
    .join(' ');

  const realPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.realBalance)}`)
    .join(' ');


  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 mt-8 border border-gray-200 dark:border-gray-700 animate-slide-up animation-delay-400">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
        <svg className="w-6 h-6 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        Investment Growth Chart
      </h2>

      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full max-w-2xl">
          <defs>
            <linearGradient id="nominalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: isDark ? 'rgb(147, 197, 253)' : 'rgb(59, 130, 246)', stopOpacity: isDark ? 0.4 : 0.3 }} />
              <stop offset="100%" style={{ stopColor: isDark ? 'rgb(147, 197, 253)' : 'rgb(59, 130, 246)', stopOpacity: 0 }} />
            </linearGradient>
            <linearGradient id="realGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: isDark ? 'rgb(74, 222, 128)' : 'rgb(34, 197, 94)', stopOpacity: isDark ? 0.3 : 0.2 }} />
              <stop offset="100%" style={{ stopColor: isDark ? 'rgb(74, 222, 128)' : 'rgb(34, 197, 94)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = padding + tick * (chartHeight - 2 * padding);
            const value = maxBalance * (1 - tick);

            let formattedValue: string;
            if (value >= 1000000) {
              formattedValue = `$${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
            } else if (value >= 1000) {
              formattedValue = `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
            } else {
              formattedValue = `$${value.toFixed(0)}`;
            }

            return (
              <g key={tick}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke={isDark ? "#374151" : "#e5e7eb"}
                  strokeWidth="1"
                />
                <text
                  x={padding - 5}
                  y={y + 5}
                  textAnchor="end"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  {formattedValue}
                </text>
              </g>
            );
          })}

          {data.map((d, i) => {
            if (i % Math.ceil(data.length / 10) === 0 || i === data.length - 1) {
              return (
                <text
                  key={i}
                  x={xScale(i)}
                  y={chartHeight - padding + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  {d.year}
                </text>
              );
            }
            return null;
          })}

          <path
            d={`${realPath} L ${xScale(data.length - 1)} ${chartHeight - padding} L ${xScale(0)} ${chartHeight - padding} Z`}
            fill="url(#realGradient)"
          />

          <path
            d={`${nominalPath} L ${xScale(data.length - 1)} ${chartHeight - padding} L ${xScale(0)} ${chartHeight - padding} Z`}
            fill="url(#nominalGradient)"
          />

          <path
            d={realPath}
            fill="none"
            stroke={isDark ? "rgb(74, 222, 128)" : "rgb(34, 197, 94)"}
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          <path
            d={nominalPath}
            fill="none"
            stroke={isDark ? "rgb(147, 197, 253)" : "rgb(59, 130, 246)"}
            strokeWidth="3"
          />

          {data.map((d, i) => (
            <g key={i}>
              <circle
                cx={xScale(i)}
                cy={yScale(d.balance)}
                r="3"
                fill={isDark ? "rgb(147, 197, 253)" : "rgb(59, 130, 246)"}
                className="hover:r-5 transition-all cursor-pointer"
              >
                <title>
                  Year {d.year}: Nominal ${d.balance.toLocaleString()}
                </title>
              </circle>
              <circle
                cx={xScale(i)}
                cy={yScale(d.realBalance)}
                r="3"
                fill={isDark ? "rgb(74, 222, 128)" : "rgb(34, 197, 94)"}
                className="hover:r-5 transition-all cursor-pointer"
              >
                <title>
                  Year {d.year}: Real ${d.realBalance.toLocaleString()}
                </title>
              </circle>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-center mt-6 space-x-8">
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
          <div className="w-4 h-4 bg-primary-500 dark:bg-primary-400 rounded mr-3 shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nominal Balance</span>
        </div>
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
          <div className="w-8 h-1 mr-3" style={{
            backgroundImage: isDark
              ? 'repeating-linear-gradient(90deg, rgb(74, 222, 128) 0px, rgb(74, 222, 128) 5px, transparent 5px, transparent 10px)'
              : 'repeating-linear-gradient(90deg, rgb(34, 197, 94) 0px, rgb(34, 197, 94) 5px, transparent 5px, transparent 10px)'
          }}></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Real Balance (Inflation-Adjusted)</span>
        </div>
      </div>
    </div>
  );
});