"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sliders, 
  Sparkles, 
  Share2, 
  TrendingUp, 
  Coins, 
  AlertTriangle, 
  Home, 
  Droplet, 
  Trash2, 
  Activity,
  Heart,
  User,
  MessageSquare,
  ShieldAlert,
  Flame,
  Scale
} from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Cell 
} from "recharts";

interface Municipality {
  code: string;
  name: string;
  type: "metropolitan" | "local" | "district";
  province: string;
  boundaryVersion: string;
  population: number;
  pipedWaterPercent: number;
  flushToiletPercent: number;
  electricityPercent: number;
  officials: {
    mayor: string;
    municipalManager: string;
    cfo: string;
  };
}

interface AuditOutcome {
  year: number;
  opinionCode: "CLEAN" | "UNQUALIFIED_FINDINGS" | "QUALIFIED" | "ADVERSE" | "DISCLAIMER";
  opinionLabel: string;
  reportUrl: string;
  unauthorizedExpenditure: number;
  irregularExpenditure: number;
  fruitlessWastefulExpenditure: number;
}

interface CitizenAuditSimulatorProps {
  municipality: Municipality;
  latestAudit: AuditOutcome | null;
}

interface SavedSimulation {
  id: string;
  name: string;
  comment: string;
  muniCode: string;
  uifwSavedPercent: number;
  fundsRecovered: number;
  timestamp: any;
}

export default function CitizenAuditSimulator({ municipality, latestAudit }: CitizenAuditSimulatorProps) {
  // Slider states
  const [uifwSavedPercent, setUifwSavedPercent] = useState<number>(50);
  const [realignmentPercent, setRealignmentPercent] = useState<number>(40);

  // Form states
  const [citizenName, setCitizenName] = useState<string>("");
  const [citizenComment, setCitizenComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Real-time simulations from other citizens
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);

  // Calculate totals
  const totalUIFW = latestAudit 
    ? (latestAudit.unauthorizedExpenditure + latestAudit.irregularExpenditure + latestAudit.fruitlessWastefulExpenditure)
    : 120000000; // Fallback to 120M if none

  const fundsRecovered = Math.round(totalUIFW * (uifwSavedPercent / 100));
  const realignedFunds = Math.round(fundsRecovered * (realignmentPercent / 100));

  // standard costs in Rands
  const conversionRates = {
    pipedWater: 18000,     // R18,000 per household tap
    sanitation: 20000,     // R20,000 per household toilet
    housing: 150000,       // R150,000 per modular housing unit
    wasteTrucks: 3200000,  // R3.2 Million per solid waste truck
    clinicUpgrade: 7500000 // R7.5 Million per localized clinic upgrade
  };

  // physical opportunities realized
  const itemsBuilt = {
    waterTaps: Math.floor(realignedFunds / conversionRates.pipedWater),
    flushToilets: Math.floor(realignedFunds / conversionRates.sanitation),
    houses: Math.floor(realignedFunds / conversionRates.housing),
    trucks: Math.floor(realignedFunds / conversionRates.wasteTrucks),
    clinics: Math.floor(realignedFunds / conversionRates.clinicUpgrade)
  };

  // Estimate increase in municipal service delivery indicators
  const estimatedHHPipedWaterIncrease = municipality.population > 0 
    ? parseFloat(((itemsBuilt.waterTaps * 4.2 / municipality.population) * 100).toFixed(2)) 
    : 0;

  const estimatedHHSanitationIncrease = municipality.population > 0 
    ? parseFloat(((itemsBuilt.flushToilets * 4.2 / municipality.population) * 100).toFixed(2)) 
    : 0;

  // Forecast AGSA opinion
  const getForecastedOpinion = () => {
    if (uifwSavedPercent >= 85) return { label: "Clean Audit", code: "CLEAN", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
    if (uifwSavedPercent >= 50) return { label: "Unqualified with Findings", code: "UNQUALIFIED_FINDINGS", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
    if (uifwSavedPercent >= 20) return { label: "Qualified Audit", code: "QUALIFIED", color: "text-orange-400 border-orange-500/30 bg-orange-500/10" };
    return { label: latestAudit?.opinionLabel || "Disclaimer", code: latestAudit?.opinionCode || "DISCLAIMER", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" };
  };

  const forecasted = getForecastedOpinion();

  // Load simulations from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "saved_simulations"),
      where("muniCode", "==", municipality.code),
      orderBy("timestamp", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: SavedSimulation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        docs.push({
          id: doc.id,
          name: data.name || "Anonymous Citizen",
          comment: data.comment || "",
          muniCode: data.muniCode,
          uifwSavedPercent: data.uifwSavedPercent || 0,
          fundsRecovered: data.fundsRecovered || 0,
          timestamp: data.timestamp
        });
      });
      setSavedSimulations(docs);
    }, (error) => {
      console.error("Error loading citizen simulations:", error);
    });

    return () => unsubscribe();
  }, [municipality.code]);

  // Submit simulation
  const handleSaveSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await addDoc(collection(db, "saved_simulations"), {
        name: citizenName,
        comment: citizenComment,
        muniCode: municipality.code,
        uifwSavedPercent,
        fundsRecovered: realignedFunds,
        timestamp: serverTimestamp()
      });

      setCitizenName("");
      setCitizenComment("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to save simulation to Firestore:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recharts Chart Data
  const chartData = [
    {
      name: "Current Model",
      "Unlawful Leakage": Math.round(totalUIFW / 1000000),
      "Optimized Reallocation": 0
    },
    {
      name: "Your Citizen Model",
      "Unlawful Leakage": Math.round((totalUIFW - fundsRecovered) / 1000000),
      "Optimized Reallocation": Math.round(realignedFunds / 1000000)
    }
  ];

  return (
    <div id="citizen-audit-sim" className="space-y-8 mt-12 border-t border-indigo-500/10 pt-12">
      
      {/* Title block */}
      <div className="text-left">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
            <Sliders className="w-5 h-5" />
          </span>
          <h3 className="text-xl font-bold text-white font-display">
            Sovereign Citizen Audit & Reallocation Playground
          </h3>
        </div>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          How would you realign municipal priorities? Take control of <strong className="text-white">R {(totalUIFW / 1000000).toFixed(1)}M</strong> in unlawfully leaked municipal expenditures (UIFW) to see what tangible public services could be delivered under clean governance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sliders and Input Side */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass p-6 bg-slate-950/30 border border-white/5 rounded-3xl text-left space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
                Simulation Variables
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                <Scale className="w-3.5 h-3.5" />
                Live Calculator
              </span>
            </div>

            {/* Slider 1: UIFW Mitigation */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Expenditure Leakage Mitigation Rate
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Reduce Irregular, Fruitless & Wasteful spend
                  </span>
                </div>
                <span className="text-lg font-mono font-extrabold text-indigo-400">
                  {uifwSavedPercent}% Saved
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={uifwSavedPercent}
                onChange={(e) => setUifwSavedPercent(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>0% (As Reported)</span>
                <span>50% (Sovereign Target)</span>
                <span>100% (Zero Leakage)</span>
              </div>
            </div>

            {/* Slider 2: Reallocation of saved funds */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Citizen Service Delivery Reinvestment Rate
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Reallocate mitigated leakage directly into local community infrastructure
                  </span>
                </div>
                <span className="text-lg font-mono font-extrabold text-purple-400">
                  {realignmentPercent}% Reinvested
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={realignmentPercent}
                onChange={(e) => setRealignmentPercent(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>0% (General Budget)</span>
                <span>50% (High Intensity reinvestment)</span>
                <span>100% (Absolute Service Delivery focus)</span>
              </div>
            </div>

            {/* Ledger summary */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="border-r border-white/5 pr-4">
                <span className="text-[10px] text-slate-400 block">FUNDS RETRIEVED</span>
                <span className="text-base font-extrabold text-emerald-400 mt-1 block">
                  R {(fundsRecovered / 1000000).toFixed(2)}M
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5 block">From R {(totalUIFW / 1000000).toFixed(1)}M leakage</span>
              </div>
              <div className="pl-4">
                <span className="text-[10px] text-slate-400 block">REINVESTED IN INFRASTRUCTURE</span>
                <span className="text-base font-extrabold text-indigo-400 mt-1 block">
                  R {(realignedFunds / 1000000).toFixed(2)}M
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5 block">R {((fundsRecovered - realignedFunds) / 1000000).toFixed(2)}M general reserve</span>
              </div>
            </div>

            {/* Forecast Audit Opinion */}
            <div className="p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 bg-[#0d1527]/40">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                  FORECASTED AUDIT OPINION
                </span>
                <span className="text-xs text-slate-300 block">
                  If this governance realignment remains sustainable over a 12-month period:
                </span>
              </div>
              <span className={`text-[10px] font-extrabold font-mono uppercase px-3 py-1.5 rounded-lg border tracking-wider text-center ${forecasted.color}`}>
                {forecasted.label}
              </span>
            </div>

          </div>

          {/* Opportunity Cost Realized Bento Grid */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono">
              Real-World Opportunity Cost Realized (The Truth of Opportunities Lost)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="glass p-5 bg-gradient-to-br from-blue-950/30 to-slate-900/40 border border-blue-500/10 rounded-2xl flex flex-col justify-between hover:border-blue-500/20 transition-all">
                <div>
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 w-fit">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <h5 className="text-[10px] font-bold font-mono text-blue-300 uppercase mt-3">Household Piped Water</h5>
                  <p className="text-2xl font-extrabold text-white mt-1 font-mono">
                    +{itemsBuilt.waterTaps.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Installed clean water connections.</p>
                </div>
                {estimatedHHPipedWaterIncrease > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/5 text-[9px] text-emerald-400 font-mono">
                    +{estimatedHHPipedWaterIncrease}% local supply coverage
                  </div>
                )}
              </div>

              <div className="glass p-5 bg-gradient-to-br from-emerald-950/30 to-slate-900/40 border border-emerald-500/10 rounded-2xl flex flex-col justify-between hover:border-emerald-500/20 transition-all">
                <div>
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 w-fit">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h5 className="text-[10px] font-bold font-mono text-emerald-300 uppercase mt-3">Sewerage & Flush Toilets</h5>
                  <p className="text-2xl font-extrabold text-white mt-1 font-mono">
                    +{itemsBuilt.flushToilets.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Dignified waterborne flush toilet units.</p>
                </div>
                {estimatedHHSanitationIncrease > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/5 text-[9px] text-emerald-400 font-mono">
                    +{estimatedHHSanitationIncrease}% local sanitation coverage
                  </div>
                )}
              </div>

              <div className="glass p-5 bg-gradient-to-br from-purple-950/30 to-slate-900/40 border border-purple-500/10 rounded-2xl flex flex-col justify-between hover:border-purple-500/20 transition-all">
                <div>
                  <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400 w-fit">
                    <Home className="w-4 h-4" />
                  </div>
                  <h5 className="text-[10px] font-bold font-mono text-purple-300 uppercase mt-3">Family Housing Units</h5>
                  <p className="text-2xl font-extrabold text-white mt-1 font-mono">
                    +{itemsBuilt.houses.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Sovereign-funded housing units constructed.</p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[9px] text-slate-500 font-mono">
                  Unit Cost: R {conversionRates.housing.toLocaleString()}
                </div>
              </div>

              <div className="glass p-5 bg-gradient-to-br from-amber-950/30 to-slate-900/40 border border-amber-500/10 rounded-2xl flex flex-col justify-between hover:border-amber-500/20 transition-all md:col-span-1">
                <div>
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 w-fit">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <h5 className="text-[10px] font-bold font-mono text-amber-300 uppercase mt-3">Municipal Refuse Trucks</h5>
                  <p className="text-2xl font-extrabold text-white mt-1 font-mono">
                    +{itemsBuilt.trucks.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Compactor service trucks bought.</p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[9px] text-slate-500 font-mono">
                  Compactor Unit: R 3.2M
                </div>
              </div>

              <div className="glass p-5 bg-gradient-to-br from-rose-950/30 to-slate-900/40 border border-rose-500/10 rounded-2xl flex flex-col justify-between hover:border-rose-500/20 transition-all md:col-span-2">
                <div>
                  <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-400 w-fit">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h5 className="text-[10px] font-bold font-mono text-rose-300 uppercase mt-3">Primary Health Clinic Upgrades</h5>
                  <p className="text-2xl font-extrabold text-white mt-1 font-mono">
                    +{itemsBuilt.clinics.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Upgraded primary medical clinics with triage space, vaccines cold-rooms, and essential services.</p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[9px] text-slate-500 font-mono">
                  Standard Clinic Upgrade Budget: R 7.5 Million each
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Visual Charts & Citizen Social Proof */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Comparison Bar Chart */}
          <div className="glass p-5 bg-slate-950/20 border border-white/10 rounded-3xl text-left space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono">
              Visual realigned budget impact
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Bar dataKey="Unlawful Leakage" name="Leakage / Deficit (R Million)" fill="#f43f5e" />
                  <Bar dataKey="Optimized Reallocation" name="Reinvested Capital (R Million)" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
              *Leakage is calculated directly from AGSA reported municipal accounts (UIFW), converted into millions. Reallocation models modular community-facing investment.
            </p>
          </div>

          {/* Share/Save Form */}
          <div className="glass p-5 bg-slate-950/30 border border-white/10 rounded-3xl text-left space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-purple-400" />
                Publish Citizen Audit Proposal
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Commit your budget realignment model to the Firestore database to let other South African citizens view your truth.
              </p>
            </div>

            <form onSubmit={handleSaveSimulation} className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold font-mono uppercase text-slate-400 mb-1">Your Name / Title</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="e.g. Citizen Khumalo, Ward 12 Activist" 
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    required
                    className="w-full bg-slate-950/60 border border-white/5 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold font-mono uppercase text-slate-400 mb-1">Budget Rationale / Comment</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <textarea 
                    placeholder="Why should this money be spent this way? e.g. Ward 12 has a major sanitation backlog..." 
                    value={citizenComment}
                    onChange={(e) => setCitizenComment(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950/60 border border-white/5 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !citizenName}
                className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSubmitting 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                {isSubmitting ? "Uploading Proposal..." : "Publish to National Registry"}
              </button>

              <AnimatePresence>
                {submitSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-2 bg-emerald-500/15 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-300 font-mono text-center"
                  >
                    ✔ Proposal synchronized to Africa-South1 Firestore nodes successfully!
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Social Proof Registry of Verified Proposals */}
          <div className="glass p-5 bg-slate-950/15 border border-white/10 rounded-3xl text-left space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              Community Realignment Registry ({savedSimulations.length})
            </h4>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {savedSimulations.length > 0 ? (
                savedSimulations.map((sim) => (
                  <div key={sim.id} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <strong className="text-white block truncate">{sim.name}</strong>
                      <span className="text-[9px] font-mono font-bold text-indigo-400 shrink-0 uppercase">
                        R {(sim.fundsRecovered / 1000000).toFixed(1)}M SAVED
                      </span>
                    </div>
                    {sim.comment && (
                      <p className="text-slate-300 italic text-[11px] leading-relaxed">
                        &ldquo;{sim.comment}&rdquo;
                      </p>
                    )}
                    <div className="text-[9px] text-slate-500 font-mono flex justify-between items-center pt-1 border-t border-white/5">
                      <span>Mitigation Target: {sim.uifwSavedPercent}%</span>
                      <span>Verified Sync Node</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-white/5 rounded-xl">
                  No citizen budget realignments published yet. Be the first to publish a model for {municipality.name}!
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
