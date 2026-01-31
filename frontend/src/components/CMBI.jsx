
import React, { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Legend
} from "recharts";
import { AlertTriangle, Microscope, Search } from "lucide-react";

/**
 * CMBI Intelligence Section
 * 6. AMB Pass but CMBI Fail Detector - Scatter
 * 7. R_norm Distribution by API Class - Jittered Scatter (simulating boxplot/strip plot)
 * 8. R_norm vs API Loss (Zone-gated) - Scatter
 */
export default function CMBI({ data }) {

  // 6. AMB Pass but CMBI Fail
  const detectorData = useMemo(() => {
    if (!data) return [];
    // Filter for relevant range to keep chart clean
    return data
      .filter(d => d.metrics.AMB > 90 && d.metrics.AMB < 110 && d.metrics.R_norm !== null)
      .map(d => ({
        x: d.metrics.AMB,
        y: d.metrics.R_norm,
        fail: d.metrics.R_norm > 1 && d.metrics.AMB >= 95 && d.metrics.AMB <= 105 // Hidden failure
      }));
  }, [data]);

  // 7. R_norm by Class
  const classData = useMemo(() => {
    if (!data) return [];
    const classes = ['small_nonvolatile', 'small_volatile', 'peptide'];
    const result = [];
    data.forEach(d => {
      if (d.metrics.R_norm !== null) {
        // Add random jitter to X for visualization
        const classIndex = classes.indexOf(d.class);
        if (classIndex === -1) return;
        // X: 0, 1, 2 +/- 0.3
        result.push({
          xRaw: classIndex,
          x: classIndex + (Math.random() - 0.5) * 0.4,
          y: d.metrics.R_norm,
          class: d.class
        });
      }
    });
    return result;
  }, [data]);

  // 8. R_norm vs API Loss (Mid Zone only)
  const zoneGatedData = useMemo(() => {
    if (!data) return [];
    return data
      .filter(d => d.level === 'mid' && d.metrics.R_norm !== null)
      .map(d => ({
        x: d.initial_API - d.stressed_API_meas, // API Loss
        y: d.metrics.R_norm
      }));
  }, [data]);


  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 rounded-full bg-red-500/10 text-red-500">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-100">CMBI Intelligence</h2>
          <p className="text-gray-400">Detecting the invisible - "Your Core Edge"</p>
        </div>
      </div>

      {/* AMB Pass but CMBI Fail */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Microscope size={100} />
        </div>
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="text-xl font-bold text-gray-200">AMB Pass but CMBI Fail Detector</h3>
          <div className="flex space-x-2">
            <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30">Hidden Failure</span>
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30">Clean</span>
          </div>
        </div>

        <div className="h-96 w-full relative z-10" style={{ width: '100%', height: 384 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis type="number" dataKey="x" name="AMB" unit="%" domain={[90, 110]} stroke="#9CA3AF" />
              <YAxis type="number" dataKey="y" name="R_norm" stroke="#9CA3AF" domain={[0, 4]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
              />
              <ReferenceLine x={95} stroke="#374151" strokeDasharray="3 3" />
              <ReferenceLine x={105} stroke="#374151" strokeDasharray="3 3" />
              <ReferenceLine y={1} stroke="#EF4444" strokeWidth={2} label={{ value: 'R_norm Limit', fill: '#EF4444', position: 'insideTopLeft' }} />

              <Scatter data={detectorData} fill="#8884d8">
                {detectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fail ? "#EF4444" : "#10B981"} opacity={entry.fail ? 0.8 : 0.3} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-red-500/5 rounded-xl border border-red-500/10 text-red-200 text-sm">
          <strong className="block text-red-400 mb-1">Critical Insight:</strong>
          "The red points are hidden failures. They pass standard AMB (95-105%) but fail CMBI logic (R_norm &gt; 1). Industry misses these."
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* R_norm by Class */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-gray-200 mb-4">R_norm Distribution by API Class</h3>
          <div className="h-72 w-full" style={{ width: '100%', height: 288 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Class"
                  ticks={[0, 1, 2]}
                  tickFormatter={(v) => ['Small Non-Vol', 'Small Vol', 'Peptide'][v]}
                  stroke="#9CA3AF"
                  domain={[-0.5, 2.5]}
                />
                <YAxis type="number" dataKey="y" name="R_norm" stroke="#9CA3AF" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                <Scatter data={classData} fill="#818CF8" opacity={0.5} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-gray-500 italic">"Same degradation, different detectability expectations."</p>
        </div>

        {/* R_norm vs API Loss (Zone Gated) */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-gray-200 mb-4">R_norm vs API Loss (Mid-Zone Only)</h3>
          <div className="h-72 w-full" style={{ width: '100%', height: 288 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" dataKey="x" name="API Loss" unit="%" stroke="#9CA3AF" />
                <YAxis type="number" dataKey="y" name="R_norm" stroke="#9CA3AF" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                <Scatter data={zoneGatedData} fill="#F59E0B" opacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-gray-500 italic">"Detectability only makes sense in mid-zone (3-25% loss)."</p>
        </div>
      </div>

    </div>
  );
}
