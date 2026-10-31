import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { useVoltSureStore } from '../../store/useVoltSureStore';
import { X, Download, Copy, Check, ShieldCheck, Zap } from 'lucide-react';
import { BoltIcon } from '../common/BoltIcon';
import { ProvenanceChip } from '../common/ProvenanceChip';

export const ProofCertificateModal: React.FC = () => {
  const { proofCertificateOpen, setProofCertificateOpen, getVehicle, getRoutePlan, selectedRouteId, scenarioInputs } = useVoltSureStore();
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!proofCertificateOpen) return null;

  const vehicle = getVehicle();
  const { evaluatedRoutes, recommendedRouteId } = getRoutePlan();
  const activeRoute = evaluatedRoutes.find((r) => r.routeId === selectedRouteId) || evaluatedRoutes[0];
  const isRecommended = activeRoute.routeId === recommendedRouteId;

  const handleCopy = () => {
    const text = `
=== VOLTSURE AI JOURNEY PROOF CERTIFICATE ===
Trip: Gandhipuram to Anaikatti Foothills (35-42 km)
Vehicle: ${vehicle.name} (${vehicle.variant})
Initial SoC: ${scenarioInputs.startingSoC}% | Protected Reserve: ${scenarioInputs.reservePercent}%
Estimated Feasibility: ${(activeRoute.pFeasibleArrival * 100).toFixed(1)}% (Confidence Target: ${scenarioInputs.confidenceTarget}%)
Verdict: ${activeRoute.isFeasibleAtTarget ? 'FEASIBLE & SAFE' : 'REJECTED — RISK BUDGET BREACH'}
Charging Stop: ${activeRoute.chargingStop?.charger.name || 'Direct (No Stop)'}
Fallback Stop: ${activeRoute.chargingStop?.fallbackCharger?.name || 'N/A'}
Model Version: VoltSure-v1.2-physics (2,000 Monte Carlo runs)
Data Provenance: SIMULATED (All unvalidated values are illustrative)
Notice: Estimated probability of arriving with reserve intact, under stated data and model assumptions.
==============================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadImage = async () => {
    if (!certRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        backgroundColor: '#FFFFFF',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `voltsure-proof-certificate-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export certificate image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <BoltIcon size={20} className="text-lime-600" />
            <span className="font-heading font-bold text-slate-900 text-base">
              Journey Feasibility Certificate
            </span>
          </div>
          <button
            onClick={() => setProofCertificateOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Printable Boarding-Pass Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div
            ref={certRef}
            className="bg-white p-6 rounded-2xl border-2 border-slate-800 shadow-sm relative overflow-hidden"
          >
            {/* Top Pass Strip */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500 block">
                  Mobility Intelligence Pass
                </span>
                <span className="font-heading font-black text-2xl text-slate-900 tracking-tight">
                  VoltSure <span className="text-lime-600 font-mono">AI</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-lime-100 text-lime-800 border border-lime-300">
                  PROOF CERTIFIED
                </span>
                <span className="block text-[10px] text-slate-500 font-mono mt-1">
                  ID: VS-{Math.abs(selectedRouteId.length * 1024 + 4829).toString(16).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs font-sans mb-4">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-mono block">Origin & Destination</span>
                <p className="font-bold text-slate-900 text-sm">Gandhipuram → Anaikatti</p>
                <p className="text-slate-600 font-mono">{activeRoute.totalDistanceKm} km • {activeRoute.durationMinutes} mins</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-mono block">Vehicle Reference</span>
                <p className="font-bold text-slate-900">{vehicle.name}</p>
                <p className="text-slate-500 font-mono text-[10px]">{vehicle.variant}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-mono block">Initial Battery State</span>
                <p className="font-mono font-bold text-slate-900 text-base">{scenarioInputs.startingSoC}% SoC</p>
                <p className="text-slate-500 font-mono text-[10px]">Protected Reserve: {scenarioInputs.reservePercent}%</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-mono block">Estimated Feasibility</span>
                <p
                  className={`font-mono font-bold text-2xl ${
                    activeRoute.isFeasibleAtTarget ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {(activeRoute.pFeasibleArrival * 100).toFixed(0)}%
                </p>
                <p className="text-slate-500 font-mono text-[10px]">
                  Target: {scenarioInputs.confidenceTarget}% confidence
                </p>
              </div>
            </div>

            {/* Route Stop / Fallback Section */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs font-mono space-y-1 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Selected Path:</span>
                <span className="font-bold text-slate-800">{activeRoute.routeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Planned Charging Stop:</span>
                <span className="font-semibold text-slate-900">
                  {activeRoute.chargingStop?.charger.name || 'Direct Corridor (Zero Stops)'}
                </span>
              </div>
              {activeRoute.chargingStop?.fallbackCharger && (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500">Designated Fallback:</span>
                  <span>{activeRoute.chargingStop.fallbackCharger.name}</span>
                </div>
              )}
            </div>

            {/* Perforated Tear Line */}
            <div className="relative my-4 border-b-2 border-dashed border-slate-300">
              <div className="absolute -left-8 -top-3 w-6 h-6 rounded-full bg-slate-100 border border-slate-200" />
              <div className="absolute -right-8 -top-3 w-6 h-6 rounded-full bg-slate-100 border border-slate-200" />
            </div>

            {/* Mandatory Honesty & Legal Disclaimer Strip */}
            <div className="space-y-1 text-[10px] text-slate-500 font-mono pt-1">
              <div className="flex items-center justify-between">
                <span>Model: VoltSure-v1.2 (2,000 MC samples)</span>
                <ProvenanceChip provenance="SIMULATED" size="xs" />
              </div>
              <p className="italic text-slate-600 leading-tight">
                * Estimated probability of arriving with reserve intact, under stated data and model assumptions.
                Illustrative concept prototype; not a guaranteed outcome.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Summary!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-lime-600 text-white hover:bg-lime-700 text-xs font-semibold transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating PNG...' : 'Download Certificate (PNG)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

