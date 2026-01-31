
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
import { Activity, Layers, Zap, Database } from "lucide-react";

/**
 * Overview Section
 * 1. Dataset Composition Cards (KPIs)
 * 2. Distribution of API Loss (%) - Histogram colored by zone
 */
export default function Overview({ data }) {
  const kpis = useMemo(() => {
    if (!data || data.length === 0) return null;

    const totalRuns = data.length;

    // Zones
    const zones = data.reduce((acc, row) => {
      acc[row.level] = (acc[row.level] || 0) + 1;
      return acc;
    }, {});

    // Classes
    const classes = data.reduce((acc, row) => {
      acc[row.class] = (acc[row.class] || 0) + 1;
      return acc;
    }, {});

    // Stress Types
    const stress = data.reduce((acc, row) => {
      acc[row.stress] = (acc[row.stress] || 0) + 1;
      return acc;
    }, {});

    return { totalRuns, zones, classes, stress };
  }, [data]);

  // Histogram Data for API Loss
  const apiLossData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Create bins
    const bins = {};
    const binSize = 2; // 2% bins

    data.forEach(row => {
      if (!row.metrics) return;
      const loss = row.initial_API - row.stressed_API_meas;
      const bin = Math.floor(loss / binSize) * binSize;
      if (!bins[bin]) bins[bin] = { name: `${bin}-${bin + binSize}%`, count: 0, low: 0, mid: 0, high: 0 };
      bins[bin].count++;
      bins[bin][row.level]++;
    });

    return Object.values(bins).sort((a, b) => parseInt(a.name) - parseInt(b.name));
  }, [data]);

  if (!kpis) return <div className="p-10 text-center animate-pulse">Loading Dataset Overview...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
          <Database size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-100">Dataset Overview</h2>
          <p className="text-gray-400">Scale, coverage, and stress distribution</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          icon={<Activity />}
          title="Total Runs"
          value={kpis.totalRuns}
          subtitle="Synthetic Points"
          color="blue"
        />
        <Card
          icon={<Layers />}
          title="Zone Coverage"
          value={`${Math.round(kpis.zones.mid / kpis.totalRuns * 100)}%`}
          subtitle="Mid-Zone Focus"
          color="purple"
        />
        <Card
          icon={<Zap />}
          title="Stress Types"
          value={Object.keys(kpis.stress).length}
          subtitle="Physical & Chemical"
          color="amber"
        />
        <Card
          icon={<Database />}
          title="API Classes"
          value={Object.keys(kpis.classes).length}
          subtitle="Volatile & Fixed"
          color="emerald"
        />
      </div>

      {/* API Loss Histogram */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-xl hover:border-gray-700 transition-all duration-300">
        <h3 className="text-xl font-semibold mb-6 text-gray-200 flex items-center">
          <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
          Distribution of API Loss (%)
        </h3>
        <div className="h-80 w-full" style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={apiLossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Bar dataKey="low" stackId="a" fill="#10B981" name="Low Zone" />
              <Bar dataKey="mid" stackId="a" fill="#F59E0B" name="Mid Zone" />
              <Bar dataKey="high" stackId="a" fill="#EF4444" name="High Zone" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 text-center text-gray-500 italic">
          "Shows realistic forced degradation behavior across 3 zones."
        </p>
      </div>
    </div>
  );
}

function Card({ icon, title, value, subtitle, color }) {
  const colors = {
    blue: "text-blue-400 bg-blue-400/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-400/10 border-purple-500/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-500/20",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20",
  };

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${colors[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-gray-950/30">
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <span className={`text-xs font-mono px-2 py-1 rounded-full bg-gray-950/30 opacity-70`}>KPI</span>
      </div>
      <div className="text-3xl font-extrabold mb-1">{value}</div>
      <div className="font-semibold opacity-90">{title}</div>
      <div className="text-sm opacity-60 mt-1">{subtitle}</div>
    </div>
  )
}
