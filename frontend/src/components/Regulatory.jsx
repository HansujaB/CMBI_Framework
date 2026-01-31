
import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts";
import { ShieldCheck, Sliders, RefreshCw, FileText } from "lucide-react";

/**
 * Regulatory & Explainability Section
 * 16. Auto-Generated Justification Panel
 * 17. Threshold Sensitivity Slider
 * 18. Counterfactual Class Comparison
 */
export default function Regulatory({ data }) {
  // Local state for sensitivity analysis
  const [threshold, setThreshold] = useState(0.3); // Default RMBD allow
  const [selectedRunId, setSelectedRunId] = useState("Run_100");

  // 17. Sensitivity Analysis
  const sensitivityStats = useMemo(() => {
    if (!data) return { q2: 0, q2_pct: 0 };
    // Recompute Quadrants based on new threshold
    // R_norm = RMBD / threshold (simplified constant threshold for demo slider)
    // Normally threshold depends on class, here we override for sensitivity demo
    let q2 = 0;
    const total = data.length;
    data.forEach(d => {
      // Using the logic from metrics.js but with dynamic threshold
      if (d.metrics.RMBD !== null && d.level === 'mid') {
        const r_norm = d.metrics.RMBD / threshold;
        const amb = d.metrics.AMB;
        // Check if it becomes Q2 (Hidden Fail)
        // Q2: R_norm > 1 AND AMB in [95, 105]
        if (r_norm > 1 && amb >= 95 && amb <= 105) {
          q2++;
        }
      } else {
        // Keep original if not mid or invalid, simplistic for demo
        if (d.quadrant === 'Q2') q2++;
      }
    });
    return { q2, q2_pct: (q2 / total * 100).toFixed(1) };
  }, [data, threshold]);

  // 16. Justification Text
  const justification = useMemo(() => {
    // Find a "bad" run to talk about
    // A run with AMB ok but High R_norm
    const badRun = data?.find(d => d.metrics.AMB >= 98 && d.metrics.AMB <= 102 && d.metrics.R_norm > 1.5 && d.level === 'mid');
    if (!badRun) return "All runs appear within normal operating parameters.";

    return `Automated Assessment for ${badRun.API}: Although Mass Balance (AMB) is ${(badRun.metrics.AMB).toFixed(1)}% (within limits), an elevated R_norm of ${(badRun.metrics.R_norm).toFixed(2)} in the ${badRun.level} zone indicates undetected degradation. Standard guidelines would pass this batch, but CMBI logic flags it for Method Investigation due to potential volatility masking.`;
  }, [data]);

  // 18. Counterfactuals
  const counterfactualData = useMemo(() => {
    if (!data) return [];
    const run = data.find(d => d.API === selectedRunId);
    if (!run) return [];

    // Logic: RMBD is fixed (measured). 
    // R_norm changes because Allowable limit changes by class.
    // Limits: NonVol: 0.2, Vol: 0.35, Peptide: 0.4
    const rmbd = run.metrics.RMBD;
    if (rmbd === null) return [];

    const scenarios = [
      { name: 'Small Non-Volatile', limit: 0.2 },
      { name: 'Small Volatile', limit: 0.35 },
      { name: 'Peptide', limit: 0.4 }
    ];

    return scenarios.map(s => ({
      name: s.name,
      r_norm: (rmbd / s.limit).toFixed(2),
      limit: 1, // Normalized limit
      isActual: run.class.replace('_', ' ').toLowerCase().includes(s.name.toLowerCase().split(' ')[1]) // approximate match
    }));

  }, [data, selectedRunId]);

  const handleRunChange = (e) => {
    setSelectedRunId(e.target.value);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 rounded-full bg-pink-500/10 text-pink-400">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-100">Regulatory & Explainability</h2>
          <p className="text-gray-400">Trust & Transparency - "The Wow Factor"</p>
        </div>
      </div>

      {/* Justification Panel */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <FileText size={120} />
        </div>
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4 flex items-center">
          <span className="w-2 h-2 rounded-full bg-blue-400 mr-3 animate-pulse"></span>
          AI-Generated Regulatory Justification
        </h3>
        <p className="text-lg text-gray-300 italic font-serif leading-relaxed pr-10">
          "{justification}"
        </p>
        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-sm text-gray-300 transition-colors">Copy to Report</button>
          <button className="px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm border border-blue-500/30 transition-colors">Export PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Threshold Sensitivity */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-200">Threshold Sensitivity</h3>
            <Sliders className="text-gray-500" />
          </div>

          <div className="mb-8">
            <label className="block text-sm text-gray-400 mb-2 flex justify-between">
              <span>Global RMBD Allowable Limit</span>
              <span className="text-white font-mono bg-gray-800 px-2 rounded">{threshold}</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Strict (0.1)</span>
              <span>Loose (1.0)</span>
            </div>
          </div>

          <div className="bg-gray-800/30 rounded-xl p-6 text-center">
            <div className="text-sm text-gray-400 mb-1">Impact on Hidden Failures (Q2)</div>
            <div className="text-4xl font-extrabold text-red-400 transition-all duration-300">
              {sensitivityStats.q2} <span className="text-lg text-gray-500 font-normal">Runs</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              ({sensitivityStats.q2_pct}% of dataset)
            </div>
          </div>
          <p className="mt-4 text-center text-gray-500 italic">"Thresholds become assumptions — not magic numbers."</p>
        </div>

        {/* Counterfactual */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-200">Counterfactual Analysis</h3>
            <RefreshCw className="text-gray-500" />
          </div>

          <div className="mb-6">
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Select Run ID</label>
            <select
              value={selectedRunId}
              onChange={handleRunChange}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {/* Randomly picking some IDs for demo since list is generic */}
              <option value="Run_100">Run_100 (Mid Zone)</option>
              <option value="Run_205">Run_205 (High Zone)</option>
              <option value="Run_42">Run_42 (Low Zone)</option>
              <option value="Run_1337">Run_1337 (Mid Zone)</option>
            </select>
          </div>

          <div className="h-48 w-full" style={{ width: '100%', height: 192 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={counterfactualData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={110} stroke="#9CA3AF" interval={0} fontSize={11} />
                <Tooltip
                  formatter={(value) => [value, 'Hypothetical R_norm']}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                />
                <ReferenceLine x={1} stroke="#EF4444" strokeDasharray="3 3" />
                <Bar dataKey="r_norm" radius={[0, 4, 4, 0]} barSize={20}>
                  {counterfactualData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.r_norm > 1 ? '#EF4444' : '#10B981'} stroke={entry.isActual ? '#fff' : 'none'} strokeWidth={2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs mt-2">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span> Fail</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> Pass</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full border border-white mr-1"></span> Actual Class</span>
          </div>
        </div>
      </div>
    </div>
  );
}
