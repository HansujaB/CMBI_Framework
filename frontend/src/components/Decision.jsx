import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function Decision({ data }) {
  if (!data || data.length === 0) return null;

  const quadrantCounts = data.reduce((acc, curr) => {
    const q = curr.quadrant || 'Unknown';
    acc[q] = (acc[q] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: 'Q1: Pass', value: quadrantCounts['Q1'] || 0, color: '#10b981', action: 'Release' }, // Green
    { name: 'Q2: Investigate', value: quadrantCounts['Q2'] || 0, color: '#f59e0b', action: 'Gap Analysis' }, // Amber
    { name: 'Q3: Process Check', value: quadrantCounts['Q3'] || 0, color: '#f43f5e', action: 'Root Cause' }, // Red
    { name: 'Q4: Critical', value: quadrantCounts['Q4'] || 0, color: '#6366f1', action: 'Full Review' }, // Indigo
  ].filter(d => d.value > 0);

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-white">Decision & Routing</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Pie Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Quadrant Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action List */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl overflow-y-auto max-h-[400px]">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Recommended Actions</h3>
          <div className="space-y-3">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 border border-gray-600/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-gray-200">{item.name}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {item.value} Runs &rarr; <span className="text-white font-semibold">{item.action}</span>
                </div>
              </div>
            ))}

            <div className="mt-6 pt-4 border-t border-gray-700/50">
              <p className="text-sm text-gray-400 italic">
                * Q2 indicates hidden degradation where Mass Balance passes standard checks (95-105%) but R_norm triggers a warning.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
