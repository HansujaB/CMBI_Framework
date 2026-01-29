import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function Zone({ data }) {
  if (!data || data.length === 0) return null;

  const zones = ['low', 'mid', 'high'];

  // Data for Stacked Bar (Pass/Fail by Zone)
  const stackData = zones.map(zone => {
    const subset = data.filter(d => d.level === zone);
    const pass = subset.filter(d => d.metrics?.AMB >= 95 && d.metrics?.AMB <= 105 && (d.metrics?.R_norm || 0) <= 1).length;
    const fail = subset.length - pass;
    return { name: zone.toUpperCase(), Pass: pass, Fail: fail };
  });

  // Data for Radar Chart (Average Metrics by Zone)
  // We'll normalize them to visible scales if needed
  const radarData = zones.map(zone => {
    const subset = data.filter(d => d.level === zone);
    const avgAMB = subset.reduce((acc, curr) => acc + (curr.metrics?.AMB || 0), 0) / subset.length;
    const avgQ = subset.reduce((acc, curr) => acc + (curr.metrics?.Q || 0), 0) / subset.length;
    const avgG = subset.reduce((acc, curr) => acc + (curr.metrics?.G || 0), 0) / subset.length;
    return {
      subject: zone.toUpperCase(),
      AMB: avgAMB,
      Q: avgQ * 100, // Scale Q to be visible with AMB
      G: avgG
    };
  });

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-white">Zone Analysis</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Stacked Bar Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Pass/Fail Rate by Stress Level</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                <Legend />
                <Bar dataKey="Pass" stackId="a" fill="#10b981" />
                <Bar dataKey="Fail" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Metric Sensitivity by Level</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                <PolarRadiusAxis stroke="#9ca3af" />
                <Radar name="AMB" dataKey="AMB" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Radar name="Q (x100)" dataKey="Q" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Legend />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
}
