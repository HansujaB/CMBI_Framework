import { FileText, CheckCircle, AlertOctagon, Info } from 'lucide-react';

export default function Regulatory({ data }) {
  if (!data || data.length === 0) return null;

  const total = data.length;
  const q2Count = data.filter(d => d.quadrant === 'Q2').length;
  const q3q4Count = data.filter(d => d.quadrant === 'Q3' || d.quadrant === 'Q4').length;
  const compliant = total - q2Count - q3q4Count;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <FileText className="w-6 h-6 text-primary-400" />
        Regulatory Compliance Report
      </h2>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-8 rounded-xl">

        <div className="flex flex-col md:flex-row gap-8">

          <div className="flex-1 space-y-6">
            <h3 className="text-xl font-semibold text-gray-200 border-b border-gray-700/50 pb-2">Automatic Assessment</h3>

            <div className="space-y-4">
              {/* Compliant Section */}
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                <div>
                  <h4 className="font-medium text-white">Standard Compliance ({compliant} Runs)</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    These runs meet standard ICH mass balance criteria (95-105%) and show no indications of hidden degradation (R_norm ≤ 1).
                    <span className="text-green-400 block mt-1">Recommendation: Standard Reporting (No additional justification needed).</span>
                  </p>
                </div>
              </div>

              {/* Hidden Risk Section */}
              {q2Count > 0 && (
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-amber-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-white">Gap Analysis Required ({q2Count} Runs)</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      These runs pass standard mass balance criteria but fail the CMBI R_norm check (&gt;1). This suggests non-specific degradation or volatile loss not captured by standard assays.
                      <span className="text-amber-400 block mt-1">Recommendation: Provide mechanistic justification for mass loss or identify secondary degradation products.</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Failure Section */}
              {q3q4Count > 0 && (
                <div className="flex items-start gap-4">
                  <AlertOctagon className="w-6 h-6 text-red-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-white">OOS / Critical Failure ({q3q4Count} Runs)</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      These outcomes are Out of Specification (OOS) for Mass Balance.
                      <span className="text-red-400 block mt-1">Recommendation: Root cause analysis required. Data cannot be used for stability shelf-life estimation without correction.</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Side Summary */}
          <div className="md:w-64 bg-gray-900/50 rounded-lg p-6 h-fit border border-gray-700/30">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Submission Readiness</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Samples</span>
                <span className="font-mono text-white">{total}</span>
              </div>
              <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: `${(compliant / total) * 100}%` }}></div>
              </div>
              <div className="text-xs text-gray-500">
                {(compliant / total * 100).toFixed(1)}% Ready for Submission
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
