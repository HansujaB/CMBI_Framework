import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, BarChart, Bar, Legend } from 'recharts';

export default function CMBI({ data }) {
  if (!data || data.length === 0) return null;

  // Scatter: AMB vs R_norm
  const scatterData = data.map((d, i) => ({
    id: i,
    AMB: d.metrics?.AMB || 0,
    R_norm: d.metrics?.R_norm || 0,
    class: d.class,
    stress: d.stress,
    isGap: (d.metrics?.AMB >= 95 && d.metrics?.AMB <= 105 && (d.metrics?.R_norm || 0) > 1)
  })).filter(d => d.R_norm !== null && d.R_norm !== undefined); // Filter out null R_norm

  // Bar: Average R_norm by Class
  const classes = [...new Set(data.map(d => d.class))];
  const barData = classes.map(cls => {
    const subset = data.filter(d => d.class === cls && d.metrics?.R_norm !== null);
    const avgR = subset.length > 0 ? subset.reduce((acc, curr) => acc + (curr.metrics?.R_norm || 0), 0) / subset.length : 0;
    return { name: cls, R_norm: parseFloat(avgR.toFixed(2)) };
  });

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">CMBI Intelligence</h2>
          <p className="text-gray-400 text-sm mt-1">Detection of hidden degradation gaps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Scatter Chart: The CMBI Plot */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl relative overflow-hidden">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Mass Balance Gap Analysis (AMB vs R_norm)</h3>
          {/* Background Highlight for "Danger Zone" */}
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" dataKey="AMB" name="AMB" unit="%" stroke="#9ca3af" domain={[80, 110]} />
                <YAxis type="number" dataKey="R_norm" name="R_norm" stroke="#9ca3af" domain={[0, 'auto']} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />

                {/* Reference Lines */}
                <ReferenceLine x={95} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Lower Spec', fill: '#10b981', fontSize: 12 }} />
                <ReferenceLine x={105} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Upper Spec', fill: '#10b981', fontSize: 12 }} />
                <ReferenceLine y={1} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'R_norm Limit', fill: '#f59e0b', fontSize: 12 }} />

                {/* Highlight Area: AMB Pass but R_norm Fail */}
                <ReferenceArea x1={95} x2={105} y1={1} stroke="none" fill="#ef4444" fillOpacity={0.15} />

                <Scatter name="Normal" data={scatterData.filter(d => !d.isGap)} fill="#94a3b8" opacity={0.6} />
                <Scatter name="Gap Detected" data={scatterData.filter(d => d.isGap)} fill="#ef4444" />
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: R_norm Sensitivity by Class */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Average R_norm Sensitivity by Molecule Class</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                <ReferenceLine x={1} stroke="#ef4444" strokeDasharray="3 3" />
                <Bar dataKey="R_norm" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
}
