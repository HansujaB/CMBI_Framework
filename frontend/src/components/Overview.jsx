import { Activity, Beaker, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Overview({ data }) {
  if (!data || data.length === 0) return null;

  const totalRuns = data.length;
  const avgAMB = data.reduce((acc, curr) => acc + (curr.metrics?.AMB || 0), 0) / totalRuns;
  const passingRuns = data.filter(d => {
    const amb = d.metrics?.AMB || 0;
    return amb >= 95 && amb <= 105;
  }).length;
  const passRate = ((passingRuns / totalRuns) * 100).toFixed(1);

  // Issues detected: R_norm > 1 usually implies degradation issue or hidden mass balance issue
  const issues = data.filter(d => (d.metrics?.R_norm || 0) > 1).length;

  const cards = [
    { title: 'Total Experiments', value: totalRuns, icon: Beaker, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Average AMB', value: `${avgAMB.toFixed(2)}%`, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Pass Rate', value: `${passRate}%`, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Degradation Alerts', value: issues, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Activity className="w-6 h-6 text-primary-400" />
        Dataset Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div key={index} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl hover:bg-gray-800/70 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
