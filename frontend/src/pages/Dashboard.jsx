import { useEffect, useState } from "react";
import Overview from "../components/Overview";
import Classical from "../components/Classical";
import CMBI from "../components/CMBI";
import Zone from "../components/Zone";
import Decision from "../components/Decision";
import Regulatory from "../components/Regulatory";

import { computeMetrics, decideQuadrant } from "../utils/metrics";

export default function Dashboard({ data }) {
  const [processed, setProcessed] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const enriched = data.map((row) => {
      const metrics = computeMetrics(row);
      const quadrant = decideQuadrant(metrics);
      return { ...row, metrics, quadrant };
    });
    setProcessed(enriched);
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 border-b border-gray-800 pb-6">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            CMBI Framework
          </h1>
          <p className="text-gray-400 text-lg">
            Composite Mass Balance Index Analysis for Pharmaceutical Stability
          </p>
        </header>

        <main className="space-y-6">
          <Overview data={processed} />
          <Classical data={processed} />
          <CMBI data={processed} />
          <Zone data={processed} />
          <Decision data={processed} />
          <Regulatory data={processed} />
        </main>

        <footer className="mt-12 text-center text-gray-600 text-sm py-8 border-t border-gray-800/50">
          <p>© 2024 Kinetic Analysis Team. CMBI Framework v1.0</p>
        </footer>
      </div>
    </div>
  );
}
