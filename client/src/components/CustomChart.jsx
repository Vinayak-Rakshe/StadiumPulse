import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const CustomChart = ({ data = [] }) => {
  // Format data for chart display
  const chartData = data
    .filter(z => z.type === 'Gate' || z.type === 'Zone') // show gates and zones on density chart
    .map(z => ({
      name: z.name,
      occupancy: z.currentOccupancy,
      capacity: z.capacity,
      density: Math.round(z.density)
    }));

  // Define bar color based on density levels
  const getBarColor = (density) => {
    if (density >= 85) return '#EF4444'; // Red (critical)
    if (density >= 65) return '#F59E0B'; // Gold/Amber (heavy)
    return '#10B981'; // Emerald Green (safe)
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Chart container */}
      <div 
        className="h-64 sm:h-80 bg-stadium-slate p-4 rounded-xl border border-stadium-border"
        role="img"
        aria-label="Stadium zone density bar chart. Red indicates critical overcrowding, orange indicates heavy traffic, green indicates safe flow."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="#94A3B8" 
              fontSize={10} 
              tickLine={false} 
            />
            <YAxis 
              stroke="#94A3B8" 
              fontSize={10} 
              tickLine={false} 
              domain={[0, 100]} 
              unit="%" 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px'
              }}
              formatter={(value, name) => [`${value}%`, name === 'density' ? 'Density' : name]}
            />
            <Bar dataKey="density" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.density)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible tabular alternative for screen readers */}
      <div className="sr-only">
        <h3>Live Zone Density Table</h3>
        <table>
          <thead>
            <tr>
              <th scope="col">Zone Name</th>
              <th scope="col">Current Occupancy</th>
              <th scope="col">Total Capacity</th>
              <th scope="col">Congestion Density</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((z, idx) => (
              <tr key={idx}>
                <td>{z.name}</td>
                <td>{z.occupancy}</td>
                <td>{z.capacity}</td>
                <td>{z.density}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomChart;
