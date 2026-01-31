
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Map, Layers, LayoutGrid } from "lucide-react";

/**
 * Zone-Aware Analysis Section
 * 9. Zone-wise Failure Rate - Bar Chart
 * 10. Mean Metrics by Zone - Table
 * 11. Zone x Class Heatmap
 */
export default function Zone({ data }) {

  // 9. Zone Failure Rate
  const failureData = useMemo(() => {
    if (!data) return [];
    const zones = ['low', 'mid', 'high'];
    return zones.map(z => {
      const zoneRows = data.filter(d => d.level === z);
      const failed = zoneRows.filter(d => d.metrics.R_norm && d.metrics.R_norm > 1).length;
      const pct = zoneRows.length ? (failed / zoneRows.length) * 100 : 0;
      return { name: z, pct, total: zoneRows.length };
    });
  }, [data]);

  // 10. Mean Metrics
  const meanMetrics = useMemo(() => {
    if (!data) return [];
    const zones = ['low', 'mid', 'high'];
    return zones.map(z => {
      const zoneRows = data.filter(d => d.level === z);
      const count = zoneRows.length || 1;
      const sumAMB = zoneRows.reduce((a, b) => a + (b.metrics.AMB || 0), 0);
      const sumRnorm = zoneRows.reduce((a, b) => a + (b.metrics.R_norm || 0), 0);
      const sumG = zoneRows.reduce((a, b) => a + (b.metrics.G || 0), 0);
      return {
        zone: z,
        amb: (sumAMB / count).toFixed(1),
        r_norm: (sumRnorm / count).toFixed(2),
        g: (sumG / count).toFixed(1)
      };
    });
  }, [data]);

  // 11. Heatmap Data
  const heatmapData = useMemo(() => {
    if (!data) return [];
    const zones = ['low', 'mid', 'high'];
    const classes = ['small_nonvolatile', 'small_volatile', 'peptide'];
    const grid = [];

    zones.forEach(z => {
      classes.forEach(c => {
        const matches = data.filter(d => d.level === z && d.class === c);
        const fails = matches.filter(d => d.metrics.R_norm > 1).length;
        const risk = matches.length ? fails / matches.length : 0;
        grid.push({ zone: z, class: c, risk });
      });
    });
    return grid;
  }, [data]);

  const getHeatmapColor = (risk) => {
    // Risk 0 -> 1 (0% -> 100% failure)
    // Green to Red
    if (risk < 0.05) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (risk < 0.15) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (risk < 0.30) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 rounded-full bg-orange-500/10 text-orange-400">
          <Map size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-100">Zone-Aware Analysis</h2>
          <p className="text-gray-400">Scientific Context - "Not all fails are equal"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Zone Failure Rate */}
        <div className="lg:col-span-1 bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-gray-200 mb-4">Zone-wise Failure Rate</h3>
          <div className="h-64 w-full" style={{ width: '100%', height: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" unit="%" />
                <Tooltip
                  cursor={{ fill: '#374151', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                />
                <Bar dataKey="pct" name="Failure %" radius={[4, 4, 0, 0]}>
                  {failureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'mid' ? '#F59E0B' : '#4B5563'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-gray-500 italic">"Mid-zone is where decisions should be made."</p>
        </div>

        {/* Mean Metrics Table */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-gray-200 mb-6">Mean Metrics by Zone</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="py-3 px-4">Zone</th>
                  <th className="py-3 px-4">Mean AMB (%)</th>
                  <th className="py-3 px-4">Mean R_norm</th>
                  <th className="py-3 px-4">Mean G-Score</th>
                  <th className="py-3 px-4">Interpretation</th>
                </tr>
              </thead>
              <tbody className="text-gray-200">
                {meanMetrics.map((row) => (
                  <tr key={row.zone} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 px-4 capitalize font-semibold">{row.zone}</td>
                    <td className="py-4 px-4">{row.amb}</td>
                    <td className={`py-4 px-4 ${parseFloat(row.r_norm) > 1 ? 'text-red-400 font-bold' : ''}`}>{row.r_norm}</td>
                    <td className="py-4 px-4">{row.g}</td>
                    <td className="py-4 px-4 text-sm text-gray-400">
                      {row.zone === 'low' && 'Noise dominance'}
                      {row.zone === 'mid' && 'Decision window'}
                      {row.zone === 'high' && 'Chemistry chaos'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Zone x Class Heatmap */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-200">Risk Concentration Heatmap (Zone × Class)</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <LayoutGrid size={16} />
            <span>Color = % R_norm &gt; 1</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="col-span-1"></div>
          {['Low', 'Mid', 'High'].map(z => (
            <div key={z} className="text-center font-bold text-gray-400 uppercase tracking-wider">{z} Zone</div>
          ))}

          {['small_nonvolatile', 'small_volatile', 'peptide'].map(c => (
            <React.Fragment key={c}>
              <div className="flex items-center justify-end pr-4 font-mono text-xs text-gray-400">{c}</div>
              {['low', 'mid', 'high'].map(z => {
                const cell = heatmapData.find(d => d.zone === z && d.class === c);
                return (
                  <div
                    key={`${z}-${c}`}
                    className={`aspect-video rounded-xl border flex flex-col items-center justify-center transition-all hover:scale-105 ${getHeatmapColor(cell?.risk || 0)}`}
                  >
                    <span className="text-2xl font-bold">{Math.round((cell?.risk || 0) * 100)}%</span>
                    <span className="text-[10px] uppercase opacity-70">Fail Rate</span>
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
        <p className="mt-8 text-center text-gray-500 italic">"Shows where risk concentrates - typically Mid/High zones for volatiles."</p>
      </div>

    </div>
  );
}
