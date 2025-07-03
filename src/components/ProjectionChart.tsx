import React from 'react';

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

export const ProjectionChart: React.FC<ProjectionChartProps> = ({ data }) => {
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
    <div className="bg-white shadow-md rounded-lg p-6 mt-8">
      <h2 className="text-xl font-semibold mb-4">Investment Growth Chart</h2>
      
      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full max-w-2xl">
          <defs>
            <linearGradient id="nominalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0 }} />
            </linearGradient>
            <linearGradient id="realGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 0 }} />
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
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padding - 5}
                  y={y + 5}
                  textAnchor="end"
                  className="text-xs fill-gray-600"
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
                  className="text-xs fill-gray-600"
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
            stroke="rgb(34, 197, 94)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          <path
            d={nominalPath}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="3"
          />
          
          {data.map((d, i) => (
            <g key={i}>
              <circle
                cx={xScale(i)}
                cy={yScale(d.balance)}
                r="3"
                fill="rgb(59, 130, 246)"
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
                fill="rgb(34, 197, 94)"
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
      
      <div className="flex items-center justify-center mt-4 space-x-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span className="text-sm text-gray-700">Nominal Balance</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-1 bg-green-500 mr-2" style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgb(34, 197, 94) 0px, rgb(34, 197, 94) 5px, transparent 5px, transparent 10px)' }}></div>
          <span className="text-sm text-gray-700">Real Balance (Inflation-Adjusted)</span>
        </div>
      </div>
    </div>
  );
};