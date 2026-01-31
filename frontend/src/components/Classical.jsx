
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Legend
} from "recharts";
import { TrendingUp, Activity, AlertCircle } from "lucide-react";

/**
 * Classical Metrics Section
 * 3. AMB Distribution
 * 4. RMBD Distribution
 * 5. AMB vs RMBD Scatter
 */
export default function Classical({ data }) {

  // 3. AMB Distribution
  const ambData = useMemo(() => {
    if (!data) return [];
    const bins = {};
    const binSize = 2;
    // Range 60 to 120 maybe? AMB is usually around 100
    data.forEach(row => {
      if (!row.metrics || row.metrics.AMB === null) return;
      const val = row.metrics.AMB;
      if (val < 50 || val > 150) return; // limit outliers for view
      const bin = Math.floor(val / binSize) * binSize;
      if (!bins[bin]) bins[bin] = { x: bin, count: 0 };
      bins[bin].count++;
    });
    return Object.values(bins).sort((a, b) => a.x - b.x);
  }, [data]);

  // 4. RMBD Distribution
  const rmbdData = useMemo(() => {
    if (!data) return [];
    const bins = {};
    const binSize = 0.1;
    data.forEach(row => {
      if (!row.metrics || row.metrics.RMBD === null) return;
      const val = row.metrics.RMBD;
      // RMBD usually 0 to 2? or negative? Assuming 0-1ish mostly, but can be higher.
      if (val < -1 || val > 3) return;
      // Round to 1 decimal
      const bin = Math.floor(val * 10) / 10;
      if (!bins[bin]) bins[bin] = { x: bin, count: 0 };
      bins[bin].count++;
    });
    return Object.values(bins).sort((a, b) => a.x - b.x);
  }, [data]);

  // 5. AMB vs RMBD Scatter (Sampled to avoid 4000 points lag)
  const scatterData = useMemo(() => {
    if (!data) return [];
    // downsample randomly if too big
    return data.filter(() => Math.random() < 0.5).map(row => ({
      x: row.metrics.AMB,
      y: row.metrics.RMBD,
      zone: row.level
    }));
  }, [data]);

  const lowZone = scatterData.filter(d => d.zone === 'low');
  const midZone = scatterData.filter(d => d.zone === 'mid');
  const highZone = scatterData.filter(d => d.zone === 'high');

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400">
          <TrendingUp size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-100">Classical Metrics</h2>
          <p className="text-gray-400">Baseline analysis - "What the industry sees"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* AMB Distribution */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-200">AMB Distribution</h3>
            <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded">Target: 95-105%</span>
          </div>
          <div className="h-64 w-full" style={{ width: '100%', height: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ambData} barCategoryGap={1}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="x" stroke="#9CA3AF" tickFormatter={(v) => `${v}%`} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                  labelFormatter={(v) => `AMB: ${v}%`}
                />
                {/* Reference Band imitation with ReferenceLine? hard for band. Just line at 95 and 105 */}
                <ReferenceLine x={95} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Lower', fill: '#10B981', fontSize: 10 }} />
                <ReferenceLine x={105} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Upper', fill: '#10B981', fontSize: 10 }} />
                <Bar dataKey="count" fill="#818CF8" name="Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-gray-500 italic">"This is what industry normally looks at - mostly passing."</p>
        </div>

        {/* RMBD Distribution */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-200">RMBD Distribution</h3>
            <span className="text-xs font-mono text-gray-400 bg-gray-700/30 px-2 py-1 rounded">Wide Spread</span>
          </div>
          <div className="h-64 w-full" style={{ width: '100%', height: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rmbdData} barCategoryGap={1}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="x" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                  labelFormatter={(v) => `RMBD: ${v}`}
                />
                <Bar dataKey="count" fill="#F472B6" name="Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-gray-500 italic">"Same dataset, very different story. High variability hidden."</p>
        </div>

      </div>

      {/* AMBD vs RMBD */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
        <h3 className="text-xl font-bold text-gray-200 mb-4">Correlation Check: AMBD vs RMBD</h3>
        <div className="h-80 w-full" style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis type="number" dataKey="x" name="AMB" unit="%" stroke="#9CA3AF" domain={[80, 120]} />
              <YAxis type="number" dataKey="y" name="RMBD" stroke="#9CA3AF" domain={[-1, 2]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
              <Legend />
              <Scatter name="Low Zone" data={lowZone} fill="#10B981" shape="circle" />
              <Scatter name="Mid Zone" data={midZone} fill="#F59E0B" shape="triangle" />
              <Scatter name="High Zone" data={highZone} fill="#EF4444" shape="square" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-gray-500 italic">"Weak correlation proves single metric failure."</p>
      </div>
    </div>
  );
}
