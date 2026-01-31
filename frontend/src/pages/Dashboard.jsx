import { useEffect, useState } from "react";
import Papa from "papaparse";
import Overview from "../components/Overview";
import Classical from "../components/Classical";
import CMBI from "../components/CMBI";
import Zone from "../components/Zone";
import Decision from "../components/Decision";
import Regulatory from "../components/Regulatory";

// Import the raw CSV content
import csvData from "../mass_balance_synthetic_dataset_large.csv?raw";

import { computeMetrics, decideQuadrant } from "../utils/metrics";

export default function Dashboard() {
  const [processed, setProcessed] = useState([]);

  useEffect(() => {
    Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const enriched = results.data
          .filter(row => row.API && row.stress) // Filter empty rows
          .map((row) => {
            const metrics = computeMetrics(row);
            const quadrant = decideQuadrant(metrics);
            return { ...row, metrics, quadrant };
          });
        setProcessed(enriched);
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 border-b border-gray-800 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
              CMBI Framework
            </h1>
            <p className="text-gray-400 text-lg">
              Composite Mass Balance Index Analysis for Pharmaceutical Stability
            </p>
          </div>
          <div className="text-right text-gray-500 text-sm">
            <p>Dataset: Synthetic (4000 rows)</p>
          </div>
        </header>

        <main className="space-y-12">
          <section>
            <Overview data={processed} />
          </section>

          <section>
            <Classical data={processed} />
          </section>

          <section>
            <CMBI data={processed} />
          </section>

          <section>
            <Zone data={processed} />
          </section>

          <section>
            <Decision data={processed} />
          </section>

          <section>
            <Regulatory data={processed} />
          </section>
        </main>

        <footer className="mt-16 text-center text-gray-600 text-sm py-8 border-t border-gray-800/50">
          <p className="mb-2">NEST 2026 Problem Statement 3 (CMBI Framework)</p>
          <p>All rights reserved @byte_blitz 2026</p>
        </footer>
      </div>
    </div>
  );
}
