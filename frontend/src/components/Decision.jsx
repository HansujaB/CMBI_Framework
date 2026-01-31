
import React, { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  PieChart,
  Pie,
  BarChart,
  Bar,
  ReferenceLine
} from "recharts";
import { GitBranch, CheckCircle, AlertOctagon, HelpCircle } from "lucide-react";

/**
 * Decision & Routing Section
 * 12. CMBI Quadrant Map (2x2)
 * 13. Quadrant Distribution
 * 14. Chemistry vs Method Routing
 * 15. Recommended Action Frequency
 */
export default function Decision({ data }) {

  // 12. Quadrant Map
  // Need to process data to get coordinates and color by Quad
  const quadMapData = useMemo(() => {
    if (!data) return [];
    // Downsample?
    return data.filter(d => d.metrics.AMB !== null && d.metrics.R_norm !== null).map(d => ({
      x: d.metrics.AMB,
      y: d.metrics.R_norm,
      q: d.quadrant
    })).filter(() => Math.random() < 0.5); // 50% sample
  }, [data]);

  // 13. Distribution
  const distributionData = useMemo(() => {
    if (!data) return [];
    const counts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    data.forEach(d => { if (d.quadrant) counts[d.quadrant]++ });
    const total = data.length;
    return Object.keys(counts).map(k => ({
      name: k,
      value: counts[k],
      pct: Math.round(counts[k] / total * 100)
    }));
  }, [data]);

  // 14. Chemistry vs Method by Stress
  const routingData = useMemo(() => {
    if (!data) return [];
    const stressTypes = ['acid', 'base', 'oxidation', 'thermal', 'photolysis'];
    const result = [];

    stressTypes.forEach(s => {
      const subset = data.filter(d => d.stress === s);
      // Action Logic
      // Q1 -> Pass
      // Q2 -> Method (Hidden fail)
      // Q3, Q4 -> Chemistry (AMB fail or High R_norm)
      let pass = 0, method = 0, chemistry = 0;

      subset.forEach(d => {
        if (d.quadrant === 'Q1') pass++;
        else if (d.quadrant === 'Q2') method++;
        else chemistry++;
      });

      result.push({
        name: s,
        Pass: pass,
        Method: method,
        Chemistry: chemistry
      });
    });
    return result;
  }, [data]);

  // 15. Action Frequency
  const actionData = useMemo(() => {
    if (!data) return [];
    let pass = 0, method = 0, chemistry = 0;
    data.forEach(d => {
      if (d.quadrant === 'Q1') pass++;
      else if (d.quadrant === 'Q2') method++;
      else chemistry++;
    });
    return [
      { name: 'Continue Study', value: pass, fill: '#10B981' }, // Green
      { name: 'Method Upgrade', value: method, fill: '#F59E0B' }, // Yellow/Orange
      { name: 'Chemistry Inv.', value: chemistry, fill: '#EF4444' } // Red
    ];
  }, [data]);

  const COLORS = {
    Q1: '#10B981',
    Q2: '#EF4444', // Hidden fail is dangerous
    Q3: '#F59E0B',
    Q4: '#8B5CF6'
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 rounded-full bg-teal-500/10 text-teal-400">
          <GitBranch size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-100">Decision & Routing</h2>
          <p className="text-gray-400">Actionable Intelligence - "We don't fail data, we route investigations"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Quadrant Map */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-gray-200 mb-4 h-8">CMBI Quadrant Map</h3>
          <div className="h-80 w-full relative" style={{ width: '100%', height: 320 }}>
            {/* Overlay Quadrant Labels */}
            <span className="absolute top-2 right-2 text-xs font-bold text-red-400 z-10">Q2: Hidden Gap</span>
            <span className="absolute top-2 left-2 text-xs font-bold text-purple-400 z-10">Q4: Harsh</span>
            <span className="absolute bottom-2 right-2 text-xs font-bold text-green-400 z-10">Q1: Safe</span>
            <span className="absolute bottom-2 left-2 text-xs font-bold text-yellow-400 z-10">Q3: Recovery</span>

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" dataKey="x" name="AMB" unit="%" stroke="#9CA3AF" domain={[85, 115]} />
                <YAxis type="number" dataKey="y" name="R_norm" stroke="#9CA3AF" domain={[0, 3]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                <Scatter data={quadMapData} fill="#8884d8">
                  {quadMapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.q] || '#fff'} opacity={0.6} />
                  ))}
                </Scatter>
                {/* Crosshairs */}
                <ReferenceLine x={95} stroke="#374151" strokeDasharray="3 3" />
                <ReferenceLine x={105} stroke="#374151" strokeDasharray="3 3" />
                <ReferenceLine y={1} stroke="#374151" strokeDasharray="3 3" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-gray-200 mb-4 h-8">Recommended Action Frequency</h3>
          <div className="h-80 w-full" style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" width={120} stroke="#9CA3AF" className="text-sm font-semibold" />
                <Tooltip cursor={{ fill: '#374151', opacity: 0.2 }} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]} barSize={40}>
                  {actionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Routing by Stress */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-gray-200 mb-4">Chemistry vs Method Routing</h3>
          <div className="h-72 w-full" style={{ width: '100%', height: 288 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                <Legend />
                <Bar dataKey="Method" stackId="a" fill="#F59E0B" />
                <Bar dataKey="Chemistry" stackId="a" fill="#EF4444" />
                <Bar dataKey="Pass" stackId="a" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-gray-500 italic">"Same AMB, different stress → different action."</p>
        </div>

        {/* Quadrant Distribution Pie */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold text-gray-200 mb-4 self-start">Quadrant Distribution</h3>
          <div className="h-64 w-full" style={{ width: '100%', height: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
