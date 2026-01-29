import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, BarChart, Bar } from 'recharts';

export default function Classical({ data }) {
  if (!data || data.length === 0) return null;

  // Prepare data for Scatter Plot (Initial vs Stressed Mass)
  const scatterData = data.map((d, i) => ({
    id: i,
    initial: (d.initial_API || 0) + (d.initial_deg || 0),
    stressed: d.metrics?.SMB || 0,
    stressType: d.stress
  }));

  // Prepare data for Bar Chart (Average AMB by Stress Type)
  const stressTypes = [...new Set(data.map(d => d.stress))];
  const barData = stressTypes.map(type => {
    const subset = data.filter(d => d.stress === type);
    const avgAMB = subset.reduce((acc, curr) => acc + (curr.metrics?.AMB || 0), 0) / subset.length;
    return { name: type, AMB: parseFloat(avgAMB.toFixed(2)) };
  });

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-white">Classical Mass Balance</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Scatter Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Stressed vs. Initial Mass</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" dataKey="initial" name="Initial Mass" unit="%" stroke="#9ca3af" domain={[90, 110]} />
                <YAxis type="number" dataKey="stressed" name="Stressed Mass" unit="%" stroke="#9ca3af" domain={[90, 110]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" />
                <ReferenceLine x={100} stroke="#ef4444" strokeDasharray="3 3" />
                {/* Ideal Line x=y roughly translates to 100,100 center */}
                <Scatter name="Runs" data={scatterData} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Average AMB by Stress Condition</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[90, 110]} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                <ReferenceLine y={95} stroke="#ef4444" label="Lower Limit" />
                <ReferenceLine y={105} stroke="#ef4444" label="Upper Limit" />
                <Bar dataKey="AMB" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
}
