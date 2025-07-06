import { observer } from 'mobx-react-lite';
import React from 'react';
import { Property } from '@/features/property/stores/Property';
import { themeStore } from '@/features/core/theme/ThemeStore';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';

interface PropertyChartProps {
  asset: Property;
  showBalance?: boolean;
  showMortgage?: boolean;
  showCashFlow?: boolean;
}

export const PropertyChart: React.FC<PropertyChartProps> = observer(({ 
  asset, 
  showBalance = true, 
  showMortgage = true, 
  showCashFlow = false 
}) => {
  const isDark = themeStore.theme === 'dark';
  
  if (!asset.hasResults || asset.results.length === 0) return null;

  const data = asset.results;
  
  // Find min and max values across all enabled series
  const allValues: number[] = [];
  data.forEach(d => {
    if (showBalance) allValues.push(d.balance, d.realBalance);
    if (showMortgage) allValues.push(d.mortgageBalance);
    if (showCashFlow) allValues.push(d.annualCashFlow);
  });

  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues, 0);
  const range = maxValue - minValue;
  
  const chartHeight = 400;
  const chartWidth = 700;
  const padding = 60;

  const xScale = (index: number) => {
    return padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
  };

  const yScale = (value: number) => {
    return chartHeight - padding - ((value - minValue) / range * (chartHeight - 2 * padding));
  };

  // Create paths for different data series
  const balancePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.balance)}`)
    .join(' ');

  const realBalancePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.realBalance)}`)
    .join(' ');

  const mortgagePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.mortgageBalance)}`)
    .join(' ');

  const cashFlowPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.annualCashFlow)}`)
    .join(' ');

  // Find sale events
  const saleEvents = data.filter(d => d.isSaleYear);

  const icon = (
    <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  return (
    <CollapsibleSection 
      title="Property Value & Mortgage Chart" 
      icon={icon}
      className="mt-6 animate-slide-up animation-delay-400"
      defaultExpanded={false}
    >

      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6">
        <div className="relative overflow-x-auto flex-1">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full">
            <defs>
              <linearGradient id="propertyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: isDark ? 'rgb(251, 146, 60)' : 'rgb(249, 115, 22)', stopOpacity: isDark ? 0.4 : 0.3 }} />
                <stop offset="100%" style={{ stopColor: isDark ? 'rgb(251, 146, 60)' : 'rgb(249, 115, 22)', stopOpacity: 0 }} />
              </linearGradient>
              <linearGradient id="realPropertyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: isDark ? 'rgb(34, 197, 94)' : 'rgb(22, 163, 74)', stopOpacity: isDark ? 0.3 : 0.2 }} />
                <stop offset="100%" style={{ stopColor: isDark ? 'rgb(34, 197, 94)' : 'rgb(22, 163, 74)', stopOpacity: 0 }} />
              </linearGradient>
              <linearGradient id="mortgageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: isDark ? 'rgb(239, 68, 68)' : 'rgb(220, 38, 38)', stopOpacity: isDark ? 0.3 : 0.2 }} />
                <stop offset="100%" style={{ stopColor: isDark ? 'rgb(239, 68, 68)' : 'rgb(220, 38, 38)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>

            {/* Grid lines and Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const y = padding + tick * (chartHeight - 2 * padding);
              const value = maxValue - tick * range;

              let formattedValue: string;
              const absValue = Math.abs(value);
              const isNegative = value < 0;
              
              if (absValue >= 1000000) {
                formattedValue = `${isNegative ? '-' : ''}$${(absValue / 1000000).toFixed(absValue >= 10000000 ? 0 : 1)}M`;
              } else if (absValue >= 1000) {
                formattedValue = `${isNegative ? '-' : ''}$${(absValue / 1000).toFixed(absValue >= 10000 ? 0 : 1)}k`;
              } else {
                formattedValue = `${isNegative ? '-' : ''}$${absValue.toFixed(0)}`;
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

            {/* X-axis labels */}
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
                    Year {d.year}
                  </text>
                );
              }
              return null;
            })}

            {/* Zero line if cash flow is shown */}
            {showCashFlow && minValue < 0 && (
              <line
                x1={padding}
                y1={yScale(0)}
                x2={chartWidth - padding}
                y2={yScale(0)}
                stroke={isDark ? "#6b7280" : "#9ca3af"}
                strokeWidth="2"
                strokeDasharray="3,3"
              />
            )}

            {/* Real balance area and line */}
            {showBalance && (
              <>
                <path
                  d={`${realBalancePath} L ${xScale(data.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`}
                  fill="url(#realPropertyGradient)"
                />
                <path
                  d={realBalancePath}
                  fill="none"
                  stroke={isDark ? "rgb(34, 197, 94)" : "rgb(22, 163, 74)"}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </>
            )}

            {/* Mortgage balance area and line */}
            {showMortgage && (
              <>
                <path
                  d={`${mortgagePath} L ${xScale(data.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`}
                  fill="url(#mortgageGradient)"
                />
                <path
                  d={mortgagePath}
                  fill="none"
                  stroke={isDark ? "rgb(239, 68, 68)" : "rgb(220, 38, 38)"}
                  strokeWidth="2"
                />
              </>
            )}

            {/* Property balance (nominal) area and line */}
            {showBalance && (
              <>
                <path
                  d={`${balancePath} L ${xScale(data.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`}
                  fill="url(#propertyGradient)"
                />
                <path
                  d={balancePath}
                  fill="none"
                  stroke={isDark ? "rgb(251, 146, 60)" : "rgb(249, 115, 22)"}
                  strokeWidth="3"
                />
              </>
            )}

            {/* Cash flow line */}
            {showCashFlow && (
              <path
                d={cashFlowPath}
                fill="none"
                stroke={isDark ? "rgb(168, 85, 247)" : "rgb(147, 51, 234)"}
                strokeWidth="2"
                strokeDasharray="8,4"
              />
            )}

            {/* Data points */}
            {data.map((d, i) => (
              <g key={i}>
                {showBalance && (
                  <>
                    <circle
                      cx={xScale(i)}
                      cy={yScale(d.balance)}
                      r="3"
                      fill={isDark ? "rgb(251, 146, 60)" : "rgb(249, 115, 22)"}
                      className="hover:r-5 transition-all cursor-pointer"
                    >
                      <title>
                        Year {d.year}: Property Value ${d.balance.toLocaleString()}
                      </title>
                    </circle>
                    <circle
                      cx={xScale(i)}
                      cy={yScale(d.realBalance)}
                      r="2"
                      fill={isDark ? "rgb(34, 197, 94)" : "rgb(22, 163, 74)"}
                      className="hover:r-4 transition-all cursor-pointer"
                    >
                      <title>
                        Year {d.year}: Real Value ${d.realBalance.toLocaleString()}
                      </title>
                    </circle>
                  </>
                )}
                {showMortgage && (
                  <circle
                    cx={xScale(i)}
                    cy={yScale(d.mortgageBalance)}
                    r="2"
                    fill={isDark ? "rgb(239, 68, 68)" : "rgb(220, 38, 38)"}
                    className="hover:r-4 transition-all cursor-pointer"
                  >
                    <title>
                      Year {d.year}: Mortgage Balance ${d.mortgageBalance.toLocaleString()}
                    </title>
                  </circle>
                )}
                {showCashFlow && (
                  <circle
                    cx={xScale(i)}
                    cy={yScale(d.annualCashFlow)}
                    r="2"
                    fill={isDark ? "rgb(168, 85, 247)" : "rgb(147, 51, 234)"}
                    className="hover:r-4 transition-all cursor-pointer"
                  >
                    <title>
                      Year {d.year}: Cash Flow ${d.annualCashFlow.toLocaleString()}
                    </title>
                  </circle>
                )}
              </g>
            ))}

            {/* Sale event markers */}
            {saleEvents.map((saleEvent) => {
              const saleIndex = data.findIndex(d => d.year === saleEvent.year);
              if (saleIndex === -1) return null;

              return (
                <g key={`sale-${saleEvent.year}`}>
                  {/* Sale event line */}
                  <line
                    x1={xScale(saleIndex)}
                    y1={padding}
                    x2={xScale(saleIndex)}
                    y2={chartHeight - padding}
                    stroke={isDark ? "rgb(252, 211, 77)" : "rgb(245, 158, 11)"}
                    strokeWidth="3"
                    strokeDasharray="8,4"
                  />
                  {/* Sale event icon */}
                  <circle
                    cx={xScale(saleIndex)}
                    cy={padding - 20}
                    r="8"
                    fill={isDark ? "rgb(252, 211, 77)" : "rgb(245, 158, 11)"}
                    stroke={isDark ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
                    strokeWidth="2"
                  />
                  <text
                    x={xScale(saleIndex)}
                    y={padding - 15}
                    textAnchor="middle"
                    className="text-xs font-bold fill-gray-900"
                  >
                    $
                  </text>
                  {/* Sale event label */}
                  <text
                    x={xScale(saleIndex)}
                    y={padding - 30}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700 dark:fill-gray-300"
                  >
                    SALE
                  </text>
                  {/* Sale proceeds tooltip */}
                  <title>
                    Year {saleEvent.year} Sale: ${saleEvent.grossSalePrice?.toLocaleString()} gross, ${saleEvent.netSaleProceeds?.toLocaleString()} net proceeds
                  </title>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-row lg:flex-col items-center justify-center mt-6 lg:mt-0 lg:ml-4 gap-3 lg:gap-2">
          {showBalance && (
            <>
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                <div className="w-4 h-4 bg-orange-500 rounded mr-2 shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Property Value</span>
              </div>
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                <div className="w-6 h-1 mr-2" style={{
                  backgroundImage: isDark
                    ? 'repeating-linear-gradient(90deg, rgb(34, 197, 94) 0px, rgb(34, 197, 94) 5px, transparent 5px, transparent 10px)'
                    : 'repeating-linear-gradient(90deg, rgb(22, 163, 74) 0px, rgb(22, 163, 74) 5px, transparent 5px, transparent 10px)'
                }}></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Real Value</span>
              </div>
            </>
          )}
          {showMortgage && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <div className="w-4 h-4 bg-red-500 rounded mr-2 shadow-sm"></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Mortgage Balance</span>
            </div>
          )}
          {showCashFlow && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <div className="w-6 h-1 mr-2" style={{
                backgroundImage: isDark
                  ? 'repeating-linear-gradient(90deg, rgb(168, 85, 247) 0px, rgb(168, 85, 247) 8px, transparent 8px, transparent 12px)'
                  : 'repeating-linear-gradient(90deg, rgb(147, 51, 234) 0px, rgb(147, 51, 234) 8px, transparent 8px, transparent 12px)'
              }}></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Cash Flow</span>
            </div>
          )}
          {asset.inputs.saleConfig.isPlannedForSale && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2 shadow-sm"></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Sale Event</span>
            </div>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
});