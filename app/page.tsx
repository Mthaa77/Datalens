"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  TrendingUp, 
  FileText, 
  MapPin, 
  Vote, 
  Search, 
  ShieldAlert, 
  ExternalLink, 
  Layers, 
  Clock, 
  BookOpen, 
  UserCheck, 
  Sparkles, 
  Bookmark, 
  Bell, 
  User, 
  FileCheck, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Mail,
  Lock,
  Cpu,
  Database,
  Network,
  Activity,
  Wifi,
  Globe,
  Terminal,
  Settings,
  ChevronDown,
  ChevronUp,
  Check,
  Droplet,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  municipalitiesList, 
  financialMetricsData, 
  auditOutcomesData, 
  tendersData, 
  electionsData, 
  wardLevelData,
  sourceRegistryList,
  documentChunksData,
  Municipality,
  FinancialMetric,
  AuditOutcome,
  TenderNotice,
  DocumentChunk,
  ElectionResult,
  WardData
} from "@/lib/fixtures";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-xs font-mono font-bold text-slate-400 mb-1.5">FY {label}</p>
        <div className="space-y-1 text-xs">
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-slate-300 font-medium">{p.name}:</span>
              </span>
              <span className="font-mono font-bold text-white">{p.value} Weeks</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const formatDate = (dateInput: string | Date | number): string => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "N/A";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parsePercent = (val: string): number => {
  if (!val) return 0;
  const match = val.match(/(\d+)%/);
  return match ? parseInt(match[1], 10) : 0;
};

const renderComparisonBadge = (valA: string, valB: string) => {
  const pA = parsePercent(valA);
  const pB = parsePercent(valB);
  const diff = pA - pB;
  if (diff > 0) {
    return (
      <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
        Ward A leads by +{diff}%
      </span>
    );
  } else if (diff < 0) {
    return (
      <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
        Ward B leads by +{Math.abs(diff)}%
      </span>
    );
  } else {
    return (
      <span className="bg-slate-500/10 text-slate-400 border border-white/5 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
        Access parity
      </span>
    );
  }
};

export default function CivicLensDashboard() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"directory" | "overview" | "finance" | "tenders" | "governance" | "elections" | "documents" | "sources">("directory");
  
  // Selected municipality state
  const [selectedMuniCode, setSelectedMuniCode] = useState<string>("TSH");

  // API Developer Console States
  const [isApiConsoleOpen, setIsApiConsoleOpen] = useState<boolean>(false);
  const [apiLogs, setApiLogs] = useState<Array<{ timestamp: string; method: string; url: string; status: number; type: "request" | "success" | "error"; elapsed?: number }>>([]);
  const [activePayload, setActivePayload] = useState<any>(null);

  // Live dynamic data states
  const [municipalities, setMunicipalities] = useState<Municipality[]>(municipalitiesList);
  const [liveMuniData, setLiveMuniData] = useState<Municipality | null>(null);
  const [liveFinance, setLiveFinance] = useState<FinancialMetric[] | null>(null);
  const [liveAuditOutcomes, setLiveAuditOutcomes] = useState<AuditOutcome[] | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [freshnessDate, setFreshnessDate] = useState<string>("2026-07-02T08:00:00Z");

  const handleSelectMuni = (code: string) => {
    setSelectedMuniCode(code);
    setIsLoadingData(true);
  };

  const selectedMuni = liveMuniData && liveMuniData.code === selectedMuniCode
    ? liveMuniData
    : (municipalities.find(m => m.code === selectedMuniCode) || municipalitiesList.find(m => m.code === selectedMuniCode) || municipalitiesList[0]);

  // Load list of all municipalities once on mount
  useEffect(() => {
    async function loadAllMunis() {
      const startTime = Date.now();
      const timestamp = new Date().toLocaleTimeString();
      setApiLogs(prev => [...prev, { timestamp, method: "GET", url: "/api/municipal-money", status: 0, type: "request" }]);
      try {
        const res = await fetch("/api/municipal-money");
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setMunicipalities(json.data);
          const elapsed = Date.now() - startTime;
          setApiLogs(prev => [
            ...prev,
            { 
              timestamp: new Date().toLocaleTimeString(), 
              method: "GET", 
              url: "/api/municipal-money", 
              status: res.status, 
              type: "success",
              elapsed 
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to load live municipalities:", err);
        setApiLogs(prev => [
          ...prev,
          { 
            timestamp: new Date().toLocaleTimeString(), 
            method: "GET", 
            url: "/api/municipal-money", 
            status: 500, 
            type: "error" 
          }
        ]);
      }
    }
    loadAllMunis();
  }, []);

  // Fetch live detailed data on selected municipality changes
  useEffect(() => {
    let isSubscribed = true;

    async function loadLiveData() {
      const startTime = Date.now();
      const currentTimestamp = new Date().toLocaleTimeString();
      
      setApiLogs(prev => [
        ...prev,
        { timestamp: currentTimestamp, method: "GET", url: `/api/municipal-money?code=${selectedMuniCode}`, status: 0, type: "request" },
        { timestamp: currentTimestamp, method: "GET", url: `/api/municipal-money?code=${selectedMuniCode}&endpoint=finance`, status: 0, type: "request" },
        { timestamp: currentTimestamp, method: "GET", url: `/api/municipal-money?code=${selectedMuniCode}&endpoint=governance`, status: 0, type: "request" }
      ]);

      try {
        const [profileRes, financeRes, govRes] = await Promise.all([
          fetch(`/api/municipal-money?code=${selectedMuniCode}`),
          fetch(`/api/municipal-money?code=${selectedMuniCode}&endpoint=finance`),
          fetch(`/api/municipal-money?code=${selectedMuniCode}&endpoint=governance`)
        ]);

        const [profileJson, financeJson, govJson] = await Promise.all([
          profileRes.json(),
          financeRes.json(),
          govRes.json()
        ]);

        if (!isSubscribed) return;

        if (profileJson.data) {
          setLiveMuniData(profileJson.data);
        }
        if (financeJson.data?.financialObservations) {
          setLiveFinance(financeJson.data.financialObservations);
        }
        if (govJson.data?.auditOutcomes) {
          setLiveAuditOutcomes(govJson.data.auditOutcomes);
        }
        if (profileJson.meta?.generatedAt) {
          setFreshnessDate(profileJson.meta.generatedAt);
        }

        const elapsed = Date.now() - startTime;
        const successTimestamp = new Date().toLocaleTimeString();

        setApiLogs(prev => [
          ...prev,
          { timestamp: successTimestamp, method: "GET", url: `/api/municipal-money?code=${selectedMuniCode}`, status: profileRes.status, type: "success", elapsed },
          { timestamp: successTimestamp, method: "GET", url: `/api/municipal-money?code=${selectedMuniCode}&endpoint=finance`, status: financeRes.status, type: "success", elapsed },
          { timestamp: successTimestamp, method: "GET", url: `/api/municipal-money?code=${selectedMuniCode}&endpoint=governance`, status: govRes.status, type: "success", elapsed }
        ]);

        // Keep active payload format gorgeous for display
        setActivePayload({
          municipality: profileJson.data ? {
            code: profileJson.data.code,
            name: profileJson.data.name,
            province: profileJson.data.province,
            population: profileJson.data.population,
            officials: profileJson.data.officials
          } : null,
          financeSummary: financeJson.data?.financialObservations?.[0] ? {
            year: financeJson.data.financialObservations[0].year,
            cashCoverageWeeks: financeJson.data.financialObservations[0].cashCoverageWeeks,
            repairsMaintenanceIntensity: financeJson.data.financialObservations[0].repairsMaintenanceIntensity,
            uifwExpenditureRands: financeJson.data.financialObservations[0].uifwExpenditureRands
          } : null,
          latestAuditOpinion: govJson.data?.auditOutcomes?.[0] ? {
            year: govJson.data.auditOutcomes[0].year,
            opinionCode: govJson.data.auditOutcomes[0].opinionCode,
            opinionLabel: govJson.data.auditOutcomes[0].opinionLabel
          } : null
        });

      } catch (err) {
        console.error("Failed to load live data:", err);
        const errorTimestamp = new Date().toLocaleTimeString();
        setApiLogs(prev => [
          ...prev,
          { timestamp: errorTimestamp, method: "GET", url: `/api/municipal-money?code=${selectedMuniCode}`, status: 500, type: "error" }
        ]);
      } finally {
        if (isSubscribed) {
          setIsLoadingData(false);
        }
      }
    }

    loadLiveData();

    return () => {
      isSubscribed = false;
    };
  }, [selectedMuniCode]);

  // Auth/Watchlist States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("guest@civiclens.co.za");
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  
  // Watchlist stored locally
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [subscribedAlerts, setSubscribedAlerts] = useState<Record<string, boolean>>({
    "TSH_audit": true,
    "TSH_tender": false,
    "JHB_audit": true
  });

  // Load auth & watchlist from localStorage after component mounts on the client
  useEffect(() => {
    const email = localStorage.getItem("civiclens_email");
    const stored = localStorage.getItem("civiclens_watchlist");

    Promise.resolve().then(() => {
      if (email) {
        setIsLoggedIn(true);
        setUserEmail(email);
      }

      if (stored) {
        try {
          setWatchlist(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse stored watchlist", e);
          setWatchlist(["TSH"]);
        }
      } else {
        setWatchlist(["TSH"]);
      }
    });
  }, []);

  // Tender filters
  const [tenderSearch, setTenderSearch] = useState<string>("");
  const [tenderCategory, setTenderCategory] = useState<string>("All");
  const [tenderStatus, setTenderStatus] = useState<string>("All");

  // Document Search
  const [docSearchQuery, setDocSearchQuery] = useState<string>("");
  const [docSearchResults, setDocSearchResults] = useState<DocumentChunk[]>([]);
  const [hasSearchedDocs, setHasSearchedDocs] = useState<boolean>(false);

  // AI-assisted Summary States
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiGroundingDocs, setAiGroundingDocs] = useState<any[]>([]);
  const [showSummaryDrawer, setShowSummaryDrawer] = useState<boolean>(false);
  const [summaryType, setSummaryType] = useState<"finance" | "governance">("finance");

  // Ward Selector
  const [selectedWardNumber, setSelectedWardNumber] = useState<string>("");
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareWardNumber, setCompareWardNumber] = useState<string>("");

  // Default to first ward for selected municipality when it changes
  useEffect(() => {
    const wards = wardLevelData[selectedMuniCode] || [];
    const firstWard = wards[0]?.wardNumber || "";
    const secondWard = wards[1]?.wardNumber || wards[0]?.wardNumber || "";
    Promise.resolve().then(() => {
      setSelectedWardNumber(firstWard);
      setCompareWardNumber(secondWard);
    });
  }, [selectedMuniCode]);

  // Municipal Money Comparison States
  const [financeCompareA, setFinanceCompareA] = useState<string>("TSH");
  const [financeCompareB, setFinanceCompareB] = useState<string>("JHB");
  const [isChartMounted, setIsChartMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsChartMounted(true);
  }, []);

  // Sync compare A with selected municipality when it changes
  useEffect(() => {
    setFinanceCompareA(selectedMuniCode);
    const other = selectedMuniCode === "TSH" ? "JHB" : "TSH";
    setFinanceCompareB(other);
  }, [selectedMuniCode]);

  const compareData = React.useMemo(() => {
    const dataA = financialMetricsData[financeCompareA] || [];
    const dataB = financialMetricsData[financeCompareB] || [];
    
    // Get all unique years and sort them ascending
    const allYears = Array.from(new Set([
      ...dataA.map(d => d.year),
      ...dataB.map(d => d.year)
    ])).sort((a, b) => a - b);

    const nameA = municipalitiesList.find(m => m.code === financeCompareA)?.name || financeCompareA;
    const nameB = municipalitiesList.find(m => m.code === financeCompareB)?.name || financeCompareB;

    return allYears.map(yr => {
      const metricA = dataA.find(d => d.year === yr);
      const metricB = dataB.find(d => d.year === yr);
      return {
        year: `${yr}`,
        [financeCompareA]: metricA ? metricA.cashCoverageWeeks : 0,
        [financeCompareB]: metricB ? metricB.cashCoverageWeeks : 0,
        nameA,
        nameB
      };
    });
  }, [financeCompareA, financeCompareB]);

  // Live Ingestion Orchestrator States
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, { status: "unchecked" | "testing" | "connected" | "failed"; latency?: number; error?: string }>>({
    municipal_money: { status: "unchecked" },
    agsa_mfma: { status: "unchecked" },
    etenders_portal: { status: "unchecked" },
    stats_sa_census: { status: "unchecked" },
    iec_results: { status: "unchecked" }
  });
  const [ingestionLogs, setIngestionLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] System boot. Live ingestion connectors verified.`,
    `[${new Date().toLocaleTimeString()}] Auto-Sync Cascade Daemon initialized: ACTIVE.`
  ]);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [autoSyncCascade, setAutoSyncCascade] = useState<boolean>(true);
  const [selectedIngestionSource, setSelectedIngestionSource] = useState<string>("all");

  // Function to test connectivity via server proxy
  const testSourceConnection = async (sourceId: string) => {
    setConnectionStatuses(prev => ({
      ...prev,
      [sourceId]: { status: "testing" }
    }));

    try {
      const res = await fetch("/api/municipal-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-connection", sourceId })
      });
      const data = await res.json();
      if (data.status === "connected") {
        setConnectionStatuses(prev => ({
          ...prev,
          [sourceId]: { status: "connected", latency: data.latencyMs }
        }));
        setIngestionLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Live Connection Success: ${sourceId.toUpperCase()} responded in ${data.latencyMs}ms.`
        ]);
      } else {
        setConnectionStatuses(prev => ({
          ...prev,
          [sourceId]: { status: "failed", error: data.error || "No response" }
        }));
        setIngestionLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Connection Warning: ${sourceId.toUpperCase()} failed - ${data.error || "No response"}`
        ]);
      }
    } catch (err: any) {
      setConnectionStatuses(prev => ({
        ...prev,
        [sourceId]: { status: "failed", error: err.message }
      }));
    }
  };

  // Function to run data ingestion via server proxy
  const executeIngestion = async (sourceId: string) => {
    setIsIngesting(true);
    setIngestionLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Executing live ingestion cascade for source: ${sourceId.toUpperCase()}...`
    ]);

    try {
      const res = await fetch("/api/municipal-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run-ingestion", sourceId })
      });
      const data = await res.json();
      if (data.success && data.logs) {
        setIngestionLogs(prev => [...prev, ...data.logs]);
      } else {
        setIngestionLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Ingestion Failed: ${data.error || "Unknown server error"}`
        ]);
      }
    } catch (err: any) {
      setIngestionLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Ingestion Pipeline Exception: ${err.message}`
      ]);
    } finally {
      setIsIngesting(false);
    }
  };

  // Handle Auth Mock Submit
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authEmail.includes("@")) {
      setIsLoggedIn(true);
      setUserEmail(authEmail);
      localStorage.setItem("civiclens_email", authEmail);
      setShowAuthModal(false);
    }
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserEmail("guest@civiclens.co.za");
    localStorage.removeItem("civiclens_email");
  };

  // Toggle watchlist
  const toggleWatchlist = (code: string) => {
    let updated = [...watchlist];
    if (updated.includes(code)) {
      updated = updated.filter(c => c !== code);
    } else {
      updated.push(code);
    }
    setWatchlist(updated);
    localStorage.setItem("civiclens_watchlist", JSON.stringify(updated));
  };

  // Toggle Alerts
  const toggleAlert = (key: string) => {
    setSubscribedAlerts(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Run AI Summary using the Next.js server proxy API
  const generateAISummary = async (type: "finance" | "governance") => {
    setAiLoading(true);
    setAiSummary("");
    setSummaryType(type);
    setShowSummaryDrawer(true);

    try {
      const response = await fetch("/api/gemini/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: selectedMuniCode, type })
      });
      const resData = await response.json();
      if (resData.text) {
        setAiSummary(resData.text);
        setAiGroundingDocs(resData.groundingDocs || []);
      } else {
        setAiSummary("Failed to generate a summarized output. Please check your credentials.");
      }
    } catch (err: any) {
      setAiSummary("An error occurred during verification: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Perform document search locally
  const handleDocSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearchedDocs(true);
    if (!docSearchQuery.trim()) {
      setDocSearchResults([]);
      return;
    }
    const query = docSearchQuery.toLowerCase();
    const matches = documentChunksData.filter(chunk => 
      chunk.title.toLowerCase().includes(query) ||
      chunk.heading.toLowerCase().includes(query) ||
      chunk.text.toLowerCase().includes(query)
    );
    setDocSearchResults(matches);
  };

  // Get current financial metric rows
  const muniFinances = liveFinance && liveMuniData?.code === selectedMuniCode
    ? liveFinance
    : (financialMetricsData[selectedMuniCode] || []);
  const latestFinance = muniFinances[0] || null;

  // Get audit outcomes
  const muniAudits = liveAuditOutcomes && liveMuniData?.code === selectedMuniCode
    ? liveAuditOutcomes
    : (auditOutcomesData[selectedMuniCode] || []);
  const latestAudit = muniAudits[0] || null;

  // Filter tenders
  const filteredTenders = tendersData.filter(tender => {
    const matchSearch = tender.title.toLowerCase().includes(tenderSearch.toLowerCase()) || 
                        tender.description.toLowerCase().includes(tenderSearch.toLowerCase()) ||
                        tender.id.toLowerCase().includes(tenderSearch.toLowerCase());
    const matchCategory = tenderCategory === "All" || tender.category === tenderCategory;
    const matchStatus = tenderStatus === "All" || tender.status === tenderStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="min-h-screen mesh-bg text-slate-100 selection:bg-indigo-500/30 font-sans">
      
      {/* Dynamic Live Status Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white text-xs px-4 py-2 text-center font-mono flex justify-between items-center z-50">
        <span className="flex items-center gap-1.5 font-bold">
          <span className="w-2 h-2 bg-white rounded-full animate-ping" />
          🇿🇦 CIVICLENS SOUTH AFRICA — REAL-TIME NATIONAL SOURCE CONNECTIONS GATEWAY
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-semibold">ONLINE SYNC ACTIVE</span>
          <span>Last Ingested: Today, {new Date().toLocaleDateString("en-ZA", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Main Header (Floating Capsule style) */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sticky top-0 z-40 transition-all">
        <div className="glass shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-3xl border border-white/12 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-slate-950/35">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("directory")}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 text-white flex items-center justify-center font-display font-bold text-xl relative shadow-md overflow-hidden shadow-indigo-500/20 transition-transform hover:scale-105 duration-200">
              CL
              <div className="absolute bottom-0 inset-x-0 h-1 bg-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-1.5">
                CivicLens <span className="text-indigo-400">SA</span>
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Municipal Intelligence</p>
            </div>
          </div>

          {/* Center quick selector */}
          <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/8 px-4 py-2 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Exploring Metro:</span>
            <select 
              value={selectedMuniCode} 
              onChange={(e) => handleSelectMuni(e.target.value)}
              className="bg-transparent border-0 text-white text-sm font-bold focus:outline-none cursor-pointer [&>option]:bg-[#131a26] [&>option]:text-white focus:ring-0"
            >
              {municipalities.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          </div>

          {/* User Sign In and watchlist controls */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl py-1 pr-3 pl-1.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-mono text-xs uppercase font-extrabold">
                  {userEmail[0]}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-200 max-w-[120px] truncate">{userEmail}</p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="text-[10px] text-slate-400 hover:text-rose-400 font-bold transition-colors cursor-pointer font-mono"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setAuthEmail("");
                  setAuthPassword("");
                  setShowAuthModal(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4.5 rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/45 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Global Tabs Navigation (Pill container) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 whitespace-nowrap overflow-x-auto scrollbar-none">
        <div className="glass shadow-lg shadow-black/10 rounded-2xl border border-white/8 p-1.5 bg-slate-950/25 flex gap-1 items-center max-w-max mx-auto md:w-full md:justify-around">
          {[
            { id: "directory", label: "Metro Directory", icon: MapPin },
            { id: "overview", label: "Municipal Overview", icon: Building2 },
            { id: "finance", label: "Municipal Money", icon: TrendingUp },
            { id: "tenders", label: "TenderLens Procurement", icon: FileText },
            { id: "governance", label: "Governance & Audits", icon: FileCheck },
            { id: "elections", label: "Elections & Wards", icon: Vote },
            { id: "documents", label: "DocumentLens Search", icon: BookOpen },
            { id: "sources", label: "Sources & Lineage", icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? "bg-white/10 text-white shadow-md border border-white/15 backdrop-blur-sm" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* API Gateway Status Bar & Dev Console */}
      <div className="bg-slate-900/60 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Left Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold">API Gateway Status:</span>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full">
                Active connections (200 OK)
              </span>
              <span className="hidden sm:inline text-slate-500 text-[10px] font-mono">•</span>
              <span className="hidden sm:inline bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full">
                Selected Node: {selectedMuniCode}
              </span>
            </div>
          </div>

          {/* Connected Endpoints Indicators */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-6 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Treasury: <strong className="text-slate-200">Live</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                <span>GIS/Demarcation: <strong className="text-slate-200">2026 Snap</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>Gemini: <strong className="text-slate-200">Active</strong></span>
              </div>
            </div>

            <button
              onClick={() => setIsApiConsoleOpen(!isApiConsoleOpen)}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full transition-all cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              {isApiConsoleOpen ? "Hide API Console" : "Inspect API Console"}
              {isApiConsoleOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Expandable Developer Console Drawer */}
        <AnimatePresence>
          {isApiConsoleOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-white/5 bg-black/45"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                
                {/* Column 1: Network Stream Logs */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h5 className="text-xs font-mono uppercase font-bold text-slate-400 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-indigo-400" />
                      Live Network request stream
                    </h5>
                    <button 
                      onClick={() => setApiLogs([])}
                      className="text-[10px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      Clear stream
                    </button>
                  </div>
                  
                  <div className="h-44 overflow-y-auto font-mono text-[11px] space-y-2 pr-2 no-scrollbar border border-white/5 bg-slate-950/40 rounded-xl p-3 shadow-inner">
                    {apiLogs.length === 0 ? (
                      <p className="text-slate-600 text-center py-12 italic">No requests recorded. Change municipal node to stream events.</p>
                    ) : (
                      [...apiLogs].reverse().map((log, index) => (
                        <div key={index} className="flex items-start justify-between border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                          <div className="space-y-0.5 max-w-[80%]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-slate-500">[{log.timestamp}]</span>
                              <span className={`font-extrabold ${log.method === "GET" ? "text-indigo-400" : "text-amber-400"}`}>{log.method}</span>
                              <span className="text-slate-300 truncate font-medium max-w-[200px] sm:max-w-[280px]">{log.url}</span>
                            </div>
                          </div>
                          <div>
                            {log.status === 0 ? (
                              <span className="text-amber-400 animate-pulse">PENDING...</span>
                            ) : log.type === "success" ? (
                              <span className="text-emerald-400 font-semibold">{log.status} OK {log.elapsed ? `(${log.elapsed}ms)` : ''}</span>
                            ) : (
                              <span className="text-rose-400 font-semibold">{log.status} ERR</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Column 2: Active JSON Payload Inspector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h5 className="text-xs font-mono uppercase font-bold text-slate-400 flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-purple-400" />
                      Active Response Payload (JSON)
                    </h5>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase">
                      Schema v2.5
                    </span>
                  </div>

                  <div className="h-44 overflow-y-auto font-mono text-[11px] border border-white/5 bg-slate-950/40 rounded-xl p-3 shadow-inner text-slate-300">
                    {activePayload ? (
                      <pre className="text-emerald-300 text-left overflow-x-auto selection:bg-indigo-500/30">
                        {JSON.stringify(activePayload, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-slate-600 text-center py-12 italic">Awaiting API dispatch...</p>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: METRO DIRECTORY (MAP VIEW & COMPARE INDEX) */}
        {activeTab === "directory" && (
          <div className="space-y-8">
            {/* Hero Card */}
            <div className="glass p-8 flex flex-col md:flex-row gap-8 items-center justify-between shadow-xl">
              <div className="space-y-4 max-w-2xl text-left">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-1 rounded-full font-mono font-bold uppercase">Public-Interest Analytics</span>
                <h2 className="text-3xl font-bold font-display tracking-tight text-white">
                  Trustworthy South African Civic Intelligence
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  CivicLens SA enables municipal diagnostics with extreme data precision. 
                  Every audit report, section 71 submission, tender notice, and census demographic metric is traceable back to its origin, report cycle, and quality status.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-3 rounded-lg shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Explore {selectedMuni.name} Profile
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setActiveTab("sources")}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs px-5 py-3 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    View Governed Source Registry
                  </button>
                </div>
              </div>
              
              {/* Stat badges */}
              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="glass-dark rounded-xl p-4 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Active Metros</p>
                  <p className="text-2xl font-bold font-display text-indigo-400">5</p>
                </div>
                <div className="glass-dark rounded-xl p-4 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Cubes Loaded</p>
                  <p className="text-2xl font-bold font-display text-purple-400">12 v2</p>
                </div>
                <div className="glass-dark rounded-xl p-4 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Audit Records</p>
                  <p className="text-2xl font-bold font-display text-indigo-400">15 Years</p>
                </div>
                <div className="glass-dark rounded-xl p-4 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Fresh Tenders</p>
                  <p className="text-2xl font-bold font-display text-amber-400">6 Live</p>
                </div>
              </div>
            </div>

            {/* Quick Interactive SVG Map & Selection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* GeoLens Interactive Map */}
              <div className="lg:col-span-2 glass p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-400" />
                    GeoLens — Interactive South Africa Municipal Hub
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Click on the highlighted provincial centers to filter the list and view municipal profiles.
                  </p>
                </div>

                {/* Simulated Interactive SVG South Africa Map (High Craftsmanship) */}
                <div className="my-6 flex justify-center items-center h-[340px] bg-black/25 rounded-2xl border border-white/5 p-4 relative overflow-hidden">
                  
                  {/* Styled Map SVG */}
                  <svg viewBox="0 0 800 500" className="w-full h-full text-slate-500 transition-all">
                    {/* Outline of SA (simplified coordinates for visual perfection) */}
                    <path 
                      d="M200,80 L320,50 L420,30 L550,20 L620,80 L680,120 L730,190 L750,230 L740,290 L680,330 L650,400 L580,440 L500,450 L420,440 L340,450 L250,440 L160,400 L110,360 L80,290 L60,220 L70,180 L110,130 Z" 
                      fill="rgba(255, 255, 255, 0.03)" 
                      stroke="rgba(255, 255, 255, 0.1)" 
                      strokeWidth="2"
                    />

                    {/* Western Cape highlights */}
                    <path 
                      d="M110,360 L160,400 L250,440 L340,450 L340,390 L260,350 L180,310 Z" 
                      fill={selectedMuni.province === "Western Cape" ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.03)"} 
                      stroke="rgba(255, 255, 255, 0.15)" 
                      className="transition-colors duration-300"
                    />

                    {/* Gauteng highlights */}
                    <path 
                      d="M500,160 L540,160 L540,190 L500,190 Z" 
                      fill={selectedMuni.province === "Gauteng" ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.03)"} 
                      stroke="rgba(255, 255, 255, 0.15)"
                      className="transition-colors duration-300"
                    />

                    {/* KwaZulu-Natal */}
                    <path 
                      d="M620,220 L680,220 L710,290 L650,330 L590,280 Z" 
                      fill={selectedMuni.province === "KwaZulu-Natal" ? "rgba(59, 130, 246, 0.25)" : "rgba(255, 255, 255, 0.03)"} 
                      stroke="rgba(255, 255, 255, 0.15)"
                      className="transition-colors duration-300"
                    />

                    {/* Legend circles for metros */}
                    {/* Cape Town (CPT) */}
                    <circle 
                      cx="160" cy="410" r="14" 
                      fill={selectedMuniCode === "CPT" ? "#6366f1" : "rgba(255, 255, 255, 0.2)"} 
                      stroke="rgba(255, 255, 255, 0.4)"
                      strokeWidth="1.5"
                      className="cursor-pointer hover:scale-125 transition-transform duration-200"
                      onClick={() => handleSelectMuni("CPT")}
                    />
                    <text x="160" y="435" textAnchor="middle" className="text-[10px] font-mono font-bold fill-slate-300">CPT</text>

                    {/* Johannesburg (JHB) & Tshwane (TSH) & Ekurhuleni (EKU) clustered */}
                    {/* TSH */}
                    <circle 
                      cx="510" cy="150" r="14" 
                      fill={selectedMuniCode === "TSH" ? "#6366f1" : "rgba(255, 255, 255, 0.2)"} 
                      stroke="rgba(255, 255, 255, 0.4)"
                      strokeWidth="1.5"
                      className="cursor-pointer hover:scale-125 transition-transform duration-200"
                      onClick={() => handleSelectMuni("TSH")}
                    />
                    <text x="510" y="132" textAnchor="middle" className="text-[10px] font-mono font-bold fill-slate-300">TSH</text>

                    {/* JHB */}
                    <circle 
                      cx="495" cy="180" r="14" 
                      fill={selectedMuniCode === "JHB" ? "#6366f1" : "rgba(255, 255, 255, 0.2)"} 
                      stroke="rgba(255, 255, 255, 0.4)"
                      strokeWidth="1.5"
                      className="cursor-pointer hover:scale-125 transition-transform duration-200"
                      onClick={() => handleSelectMuni("JHB")}
                    />
                    <text x="460" y="184" textAnchor="middle" className="text-[10px] font-mono font-bold fill-slate-300">JHB</text>

                    {/* EKU */}
                    <circle 
                      cx="535" cy="180" r="14" 
                      fill={selectedMuniCode === "EKU" ? "#6366f1" : "rgba(255, 255, 255, 0.2)"} 
                      stroke="rgba(255, 255, 255, 0.4)"
                      strokeWidth="1.5"
                      className="cursor-pointer hover:scale-125 transition-transform duration-200"
                      onClick={() => handleSelectMuni("EKU")}
                    />
                    <text x="568" y="184" textAnchor="middle" className="text-[10px] font-mono font-bold fill-slate-300">EKU</text>

                    {/* eThekwini (ETH) */}
                    <circle 
                      cx="660" cy="285" r="14" 
                      fill={selectedMuniCode === "ETH" ? "#6366f1" : "rgba(255, 255, 255, 0.2)"} 
                      stroke="rgba(255, 255, 255, 0.4)"
                      strokeWidth="1.5"
                      className="cursor-pointer hover:scale-125 transition-transform duration-200"
                      onClick={() => handleSelectMuni("ETH")}
                    />
                    <text x="695" y="290" textAnchor="middle" className="text-[10px] font-mono font-bold fill-slate-300">ETH</text>
                  </svg>

                  {/* Informational overlay card */}
                  <div className="absolute bottom-4 right-4 glass-dark p-3 rounded-xl border border-white/10 shadow-lg max-w-[200px] text-left">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Selected Map Pointer</p>
                    <p className="text-sm font-bold font-display text-white mt-1">{selectedMuni.name}</p>
                    <p className="text-xs text-indigo-400 font-medium">{selectedMuni.province} Province</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-mono text-slate-400 border-t border-white/5 pt-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" /> Selected Metro
                  </span>
                  <span>Boundary Year: {selectedMuni.boundaryVersion} (Municipal Demarcation Board)</span>
                </div>
              </div>

              {/* Metro Selector & Brief Scorecard */}
              <div className="space-y-6">
                
                {/* Selector List */}
                <div className="glass p-6 shadow-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono mb-4">Available Metropolitan Councils</h4>
                  <div className="space-y-2">
                    {municipalities.map((muni) => {
                      const isSelected = selectedMuniCode === muni.code;
                      const hasAuditOutcome = auditOutcomesData[muni.code]?.[0];
                      return (
                        <div
                          key={muni.code}
                          onClick={() => handleSelectMuni(muni.code)}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                            isSelected 
                              ? "bg-indigo-500/10 border-indigo-400 ring-1 ring-indigo-400/30 shadow-indigo-500/10 shadow-md" 
                              : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-mono font-bold text-slate-400">{muni.code} • {muni.province}</p>
                            <p className="font-bold text-sm text-white mt-0.5">{muni.name}</p>
                          </div>
                          
                          {/* Opinion badge */}
                          {hasAuditOutcome && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              hasAuditOutcome.opinionCode === "CLEAN" 
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                                : hasAuditOutcome.opinionCode === "UNQUALIFIED_FINDINGS"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            }`}>
                              {hasAuditOutcome.opinionCode === "CLEAN" ? "Clean" : "Findings"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Brief Quick Comparison Box */}
                <div className="glass-dark p-6 space-y-4 shadow-xl border border-white/10 text-left">
                  <div>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase">Diagnostics</span>
                    <h4 className="text-lg font-bold font-display text-white mt-2">Compare Metro Performance</h4>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      Evaluate key financial indicators and audits side-by-side with national standards.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-white/5">
                    <div>
                      <span className="text-slate-400 block">Cape Town (CPT):</span>
                      <span className="text-emerald-400 font-bold">12.4 Weeks Cash</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tshwane (TSH):</span>
                      <span className="text-amber-400 font-bold">2.1 Weeks Cash</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Johannesburg (JHB):</span>
                      <span className="text-emerald-400 font-bold">3.4 Weeks Cash</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">eThekwini (ETH):</span>
                      <span className="text-amber-400 font-bold">3.1 Weeks Cash</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab("finance")}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer text-center block shadow-lg shadow-indigo-600/25"
                  >
                    Load Detailed Finance Analytics
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MUNICIPAL OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            
            {/* Municipality Title and Actions */}
            <div className="glass p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
              <div>
                <span className="text-xs font-mono text-indigo-300 font-bold">{selectedMuni.province} Province • Code: {selectedMuni.code}</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight mt-1 flex flex-wrap items-center gap-3">
                  <span>{selectedMuni.name} Profile</span>
                  {isLoadingData ? (
                    <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30 animate-pulse font-mono">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Live Synced...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                      ● National Treasury Live
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-1">Classification: {selectedMuni.type === "metropolitan" ? "Metropolitan Council" : selectedMuni.type === "district" ? "District Council" : "Local Council"} • Effective Demarcation Version: {selectedMuni.boundaryVersion} • Sync Date: {formatDate(freshnessDate)}</p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => toggleWatchlist(selectedMuniCode)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold py-2 px-4 rounded-lg border transition-all cursor-pointer ${
                    watchlist.includes(selectedMuniCode)
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-white/5 text-slate-200 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  {watchlist.includes(selectedMuniCode) ? "Watching Metro" : "Watch Metro"}
                </button>
                
                <button
                  onClick={() => generateAISummary("finance")}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  AI-Assisted Brief
                </button>
              </div>
            </div>

            {/* Core Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Box 1: Key Officials */}
              <div className="glass p-6 shadow-xl text-left flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-indigo-300 flex items-center gap-2 mb-4">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    Key Council Officials
                  </h3>
                  <div className="space-y-4">
                    <div className="border-b border-white/5 pb-3">
                      <p className="text-[10px] text-slate-400 font-mono uppercase">Executive Mayor</p>
                      <p className="text-sm font-bold text-slate-100">{selectedMuni.officials.mayor}</p>
                      <span className="text-[10px] bg-white/5 text-slate-300 border border-white/10 px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block">Appointed Political Head</span>
                    </div>
                    <div className="border-b border-white/5 pb-3">
                      <p className="text-[10px] text-slate-400 font-mono uppercase">Municipal Manager</p>
                      <p className="text-sm font-bold text-slate-100">{selectedMuni.officials.municipalManager}</p>
                      <span className="text-[10px] bg-white/5 text-slate-300 border border-white/10 px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block">Accountable Accounting Officer</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">Chief Financial Officer</p>
                      <p className="text-sm font-bold text-slate-100">{selectedMuni.officials.cfo}</p>
                      <span className="text-[10px] bg-white/5 text-slate-300 border border-white/10 px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block">Financial Controller</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 mt-4 text-[10px] font-mono text-slate-400">
                  Lineage: National Treasury / Officials Cube v2
                </div>
              </div>

              {/* Box 2: Census 2022 Demographics */}
              <div className="glass p-6 shadow-xl text-left flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-indigo-300 flex items-center gap-2 mb-4">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Demographic & Access Context
                  </h3>
                  
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs text-slate-300 font-medium">Municipal Population</span>
                        <span className="text-sm font-bold font-mono text-white">{selectedMuni.population.toLocaleString()}</span>
                      </div>
                      <p className="text-[9px] text-slate-400">Total residents within municipal boundary lines.</p>
                    </div>

                    {/* Progress bars */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Piped Water Access</span>
                        <span className="font-bold font-mono text-white">{selectedMuni.pipedWaterPercent}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedMuni.pipedWaterPercent}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5">Household piped tap water inside yard or dwelling.</p>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Flush Toilet Access</span>
                        <span className="font-bold font-mono text-white">{selectedMuni.flushToiletPercent}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: `${selectedMuni.flushToiletPercent}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5">Flush toilets connected to sewer mains.</p>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Electrification Ratio</span>
                        <span className="font-bold font-mono text-white">{selectedMuni.electricityPercent}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${selectedMuni.electricityPercent}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5">Grid-connected electricity for lighting and household power.</p>
                    </div>

                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 mt-4 text-[10px] font-mono text-slate-400 flex justify-between">
                  <span>Sourced: Stats SA Census 2022</span>
                  <span className="text-indigo-300">Class B Verified</span>
                </div>
              </div>

              {/* Box 3: Live CivicLens Diagnostic Watchlist & Alerts Settings */}
              <div className="glass p-6 shadow-xl text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-indigo-300 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    Civic Diagnostics & Alerts
                  </h3>
                  
                  {/* Warning signs based on metrics */}
                  <div className="space-y-2">
                    {latestFinance && latestFinance.cashCoverageWeeks < 3 && (
                      <div className="flex items-start gap-2 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-200">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Liquidity Alert Triggered</p>
                          <p className="text-[10px] text-rose-300">Cash coverage is {latestFinance.cashCoverageWeeks} weeks (lower than legislated 4 weeks requirement).</p>
                        </div>
                      </div>
                    )}

                    {latestAudit && latestAudit.opinionCode !== "CLEAN" && (
                      <div className="flex items-start gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Audit Outcome Warning</p>
                          <p className="text-[10px] text-amber-300">Auditor-General issued a &ldquo;{latestAudit.opinionLabel}&rdquo; in the {latestAudit.year} cycle.</p>
                        </div>
                      </div>
                    )}

                    {latestAudit && latestAudit.opinionCode === "CLEAN" && (
                      <div className="flex items-start gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Excellent Audit Integrity</p>
                          <p className="text-[10px] text-emerald-300">Clean AuditOpinion validated by Auditor-General South Africa.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Watchlist Alerts Toggles */}
                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <p className="text-[10px] font-mono font-bold text-indigo-300 uppercase">Alert Subscription Status</p>
                    
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={subscribedAlerts[`${selectedMuniCode}_audit`] || false} 
                        onChange={() => toggleAlert(`${selectedMuniCode}_audit`)}
                        className="rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-black"
                      />
                      <span>Email me Audit Updates & AuditOpinions</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={subscribedAlerts[`${selectedMuniCode}_tender`] || false} 
                        onChange={() => toggleAlert(`${selectedMuniCode}_tender`)}
                        className="rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-black"
                      />
                      <span>Email me New Tenders matching {selectedMuniCode}</span>
                    </label>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Freshness SLA: Passed
                  </span>
                  <span>Calculated Index v1.0</span>
                </div>
              </div>

            </div>

            {/* Quick overview of latest documents available */}
            <div className="glass p-6 shadow-xl text-left">
              <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-indigo-300 flex items-center gap-2 mb-4">
                <FileCheck className="w-4 h-4 text-indigo-400" />
                Latest Available Municipal Evidence Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { type: "IDP", title: "Integrated Development Plan", badge: "2025/26 Cycle", date: "June 2025" },
                  { type: "Budget", title: "Operational & Capital Budget (MTREF)", badge: "2025/26 - 2027/28", date: "May 2025" },
                  { type: "SDBIP", title: "Service Delivery Implementation Plan", badge: "Approved 2025/26", date: "July 2025" },
                  { type: "Annual", title: "AGSA Audit & Performance Report", badge: "Audited 2024/25", date: "December 2025" },
                ].map((doc, idx) => (
                  <div key={idx} className="bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-xl flex flex-col justify-between transition-colors">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded border">
                        {doc.type}
                      </span>
                      <h4 className="font-bold text-xs text-white mt-2.5 leading-snug">{doc.title}</h4>
                      <p className="text-[10px] text-slate-300 font-mono mt-1">{doc.badge}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-3 text-[10px] text-slate-400 font-mono">
                      <span>Published: {doc.date}</span>
                      <button 
                        onClick={() => {
                          setActiveTab("documents");
                          setDocSearchQuery(doc.type);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-0.5 font-bold cursor-pointer"
                      >
                        Search Chunks
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: MUNICIPAL FINANCIAL HEALTH (MUNICIPAL LENS) */}
        {activeTab === "finance" && (
          <div className="space-y-8">
            
            {/* Header info */}
            <div className="glass p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
              <div>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full font-bold uppercase border border-indigo-500/30">Section 71 Submissions</span>
                <h3 className="text-xl font-bold font-display text-white mt-2">MunicipalMoney Financial Diagnostics for {selectedMuni.name}</h3>
                <p className="text-xs text-slate-300 mt-1">All numbers represent audited financial statements for the specified financial cycle.</p>
              </div>

              <button
                onClick={() => generateAISummary("finance")}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                AI Financial Evaluation
              </button>
            </div>

            {/* Financial Metrics Trend Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Box 1: Cash Coverage (Weeks of cash) */}
              <div className="glass p-6 shadow-xl text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono">Cash Coverage weeks</h4>
                    <span className="bg-white/5 border border-white/10 text-slate-300 text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold">Standard: &gt;4 Weeks</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold font-display text-white">{latestFinance?.cashCoverageWeeks}</span>
                    <span className="text-slate-400 text-xs font-mono font-bold">Weeks Cash</span>
                  </div>
                  
                  <p className="text-xs text-slate-300">
                    The number of weeks the municipality can keep running operating processes using available cash reserves alone.
                  </p>

                  {/* SVG Trend visualizer */}
                  <div className="pt-2">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-2">Historical Cash Reserve Weeks</p>
                    <div className="h-28 flex items-end gap-6 bg-black/20 rounded-xl p-3 border border-white/5">
                      {muniFinances.slice().reverse().map((f, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <span className="text-[10px] font-mono font-bold text-slate-300">{f.cashCoverageWeeks}</span>
                          <div 
                            className={`w-full rounded-t-sm transition-all duration-500 ${f.cashCoverageWeeks >= 4 ? 'bg-indigo-500 shadow-md shadow-indigo-500/20' : 'bg-amber-400 shadow-md shadow-amber-400/20'}`} 
                            style={{ height: `${Math.min(f.cashCoverageWeeks * 6.5 + 10, 80)}%` }} 
                          />
                          <span className="text-[9px] font-mono text-slate-400">{f.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 mt-4 flex justify-between text-[9px] font-mono text-slate-400">
                  <span>Lineage: cflow_v2 Cube</span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-1 rounded uppercase font-bold border border-emerald-500/30">Audited actual</span>
                </div>
              </div>

              {/* Box 2: Creditor vs Debtor Ageing Pressures */}
              <div className="glass p-6 shadow-xl text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono">Ageing Pressures (&gt;90 Days Debt)</h4>
                    <span className="bg-white/5 border border-white/10 text-slate-300 text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold">Target: &lt;10%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[9px] text-slate-400 font-mono uppercase">Creditor Debt</p>
                      <p className="text-xl font-bold font-mono text-white">{latestFinance?.creditorAgeingPressure}%</p>
                      <span className="text-[9px] text-slate-400">Creditors unpaid over 90 days.</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[9px] text-slate-400 font-mono uppercase">Debtor Outstanding</p>
                      <p className="text-xl font-bold font-mono text-white">{latestFinance?.debtorAgeingPressure}%</p>
                      <span className="text-[9px] text-slate-400">Uncollected bills over 90 days.</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">
                    High debtor ageing reflects billing collection troubles; high creditor ageing reflects delayed municipal utility settlements (e.g. Rand Water).
                  </p>

                  {/* SVG Bar Visualizer */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono font-bold mb-1">
                        <span className="text-slate-400">Creditor Pressure Trend</span>
                        <span className="text-white">{latestFinance?.creditorAgeingPressure}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${latestFinance && latestFinance.creditorAgeingPressure > 30 ? 'bg-rose-500' : 'bg-amber-500'}`} 
                          style={{ width: `${latestFinance?.creditorAgeingPressure}%` }} 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-mono font-bold mb-1">
                        <span className="text-slate-400">Debtor Collection Gap</span>
                        <span className="text-white">{latestFinance?.debtorAgeingPressure}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full" 
                          style={{ width: `${latestFinance?.debtorAgeingPressure}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 mt-4 flex justify-between text-[9px] font-mono text-slate-400">
                  <span>Lineage: aged_creditor_v2 / aged_debtor_v2</span>
                  <span className="bg-indigo-500/20 text-indigo-300 px-1 rounded uppercase font-bold border border-indigo-500/30">Calculated</span>
                </div>
              </div>

              {/* Box 3: Capital Budget & Maintenance Ratios */}
              <div className="glass p-6 shadow-xl text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono">Infrastructure Investment</h4>
                    <span className="bg-white/5 border border-white/10 text-slate-300 text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold">Standard: &gt;8% PPE</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs text-slate-300 font-medium">Capital Budget Spent Ratio</span>
                        <span className="text-sm font-bold font-mono text-white">{latestFinance?.capitalBudgetSpent}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${latestFinance?.capitalBudgetSpent}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">Percentage of planned capital budget successfully deployed.</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs text-slate-300 font-medium">Repairs & Maintenance Intensity</span>
                        <span className="text-sm font-bold font-mono text-white">{latestFinance?.repairsMaintenanceIntensity}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${latestFinance && latestFinance.repairsMaintenanceIntensity * 10}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">Repairs spending relative to overall property and plant valuation.</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs text-slate-300 font-medium">National Grant Reliance</span>
                        <span className="text-sm font-bold font-mono text-white">{latestFinance?.grantReliance}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${latestFinance?.grantReliance}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">Dependence on equitable share or provincial conditional grants.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 mt-4 flex justify-between text-[9px] font-mono text-slate-400">
                  <span>Lineage: repmaint_v2 / capital_v2 Cubes</span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-1 rounded uppercase font-bold border border-emerald-500/30">Source published</span>
                </div>
              </div>

            </div>

            {/* Cash Coverage Side-by-Side Comparison Chart */}
            <div id="cash-coverage-comparison-card" className="glass p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-left relative overflow-hidden bg-slate-950/25 border border-white/10 rounded-3xl">
              {/* Decorative glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6 pb-6 border-b border-white/5 relative z-10">
                <div>
                  <h4 className="text-base font-bold uppercase font-mono tracking-wider text-indigo-300 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    Cross-Municipal Cash Coverage Benchmark
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Compare available cash reserves (expressed in weeks of operating expenses) side-by-side across financial cycles.
                  </p>
                </div>

                {/* Dropdown Pickers */}
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                  {/* Municipality A Select */}
                  <div className="flex items-center gap-2 bg-slate-900/60 border border-indigo-500/20 rounded-2xl px-3 py-1.5 shadow">
                    <span className="text-[10px] text-indigo-400 uppercase font-mono font-bold">Muni A:</span>
                    <select
                      id="compare-muni-a-select"
                      value={financeCompareA}
                      onChange={(e) => setFinanceCompareA(e.target.value)}
                      className="bg-transparent border-0 text-white text-xs font-bold focus:outline-none font-mono cursor-pointer [&>option]:bg-[#131a26] [&>option]:text-white focus:ring-0"
                    >
                      {municipalitiesList.map((m) => (
                        <option key={m.code} value={m.code} disabled={m.code === financeCompareB}>
                          {m.name} ({m.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Municipality B Select */}
                  <div className="flex items-center gap-2 bg-slate-900/60 border border-purple-500/20 rounded-2xl px-3 py-1.5 shadow">
                    <span className="text-[10px] text-purple-400 uppercase font-mono font-bold">Muni B:</span>
                    <select
                      id="compare-muni-b-select"
                      value={financeCompareB}
                      onChange={(e) => setFinanceCompareB(e.target.value)}
                      className="bg-transparent border-0 text-white text-xs font-bold focus:outline-none font-mono cursor-pointer [&>option]:bg-[#131a26] [&>option]:text-white focus:ring-0"
                    >
                      {municipalitiesList.map((m) => (
                        <option key={m.code} value={m.code} disabled={m.code === financeCompareA}>
                          {m.name} ({m.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Chart Container */}
              <div className="h-72 w-full mt-4 relative z-10">
                {isChartMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={compareData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      barGap={6}
                    >
                      <defs>
                        <linearGradient id="colorMuniA" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorMuniB" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#9333ea" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                      <XAxis 
                        dataKey="year" 
                        stroke="#94a3b8" 
                        fontSize={11} 
                        fontFamily="monospace"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={11} 
                        fontFamily="monospace"
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Weeks', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', color: '#fff' }}
                      />
                      <Bar 
                        name={municipalitiesList.find(m => m.code === financeCompareA)?.name || financeCompareA} 
                        dataKey={financeCompareA} 
                        fill="url(#colorMuniA)" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        name={municipalitiesList.find(m => m.code === financeCompareB)?.name || financeCompareB} 
                        dataKey={financeCompareB} 
                        fill="url(#colorMuniB)" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                    Preparing comparison workspace...
                  </div>
                )}
              </div>

              {/* Quick analytical insights bar */}
              <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30 font-bold">
                    Liquidity Standard
                  </span>
                  <p className="text-slate-300">
                    National Treasury standard requires a minimum of <strong className="text-white">4 weeks</strong> of cash coverage.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Source: National Treasury Section 71 database
                </div>
              </div>
            </div>

            {/* In-depth finance stats chart */}
            <div className="glass p-6 shadow-xl text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono mb-4">Historical Financial Diagnostics Matrix</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 font-mono font-bold uppercase text-indigo-300 text-[10px]">
                      <th className="py-3 px-4">Financial Year</th>
                      <th className="py-3 px-4">Cash Coverage</th>
                      <th className="py-3 px-4">Creditor Pressure</th>
                      <th className="py-3 px-4">Debtor Pressure</th>
                      <th className="py-3 px-4">Repairs Ratio</th>
                      <th className="py-3 px-4">Capital Budget Spent</th>
                      <th className="py-3 px-4">UIFW Loss</th>
                      <th className="py-3 px-4">Report State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {muniFinances.map((f, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-bold font-mono text-white">{f.year} ({f.period})</td>
                        <td className="py-3 px-4 font-mono font-bold text-white">{f.cashCoverageWeeks} Weeks</td>
                        <td className={`py-3 px-4 font-mono ${f.creditorAgeingPressure > 30 ? 'text-rose-400 font-bold' : ''}`}>{f.creditorAgeingPressure}%</td>
                        <td className="py-3 px-4 font-mono">{f.debtorAgeingPressure}%</td>
                        <td className="py-3 px-4 font-mono">{f.repairsMaintenanceIntensity}%</td>
                        <td className="py-3 px-4 font-mono">{f.capitalBudgetSpent}%</td>
                        <td className="py-3 px-4 font-mono text-white font-bold">R {(f.uifwExpenditureRands / 1000000).toFixed(1)}M</td>
                        <td className="py-3 px-4">
                          <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold border border-indigo-500/30">
                            {f.amountType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: PROCUREMENT DISCOVERY (TENDER LENS) */}
        {activeTab === "tenders" && (
          <div className="space-y-6">
            
            {/* Header / Intro */}
            <div className="glass p-6 shadow-xl text-left">
              <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                TenderLens — Public Municipal Tender Discovery
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                A discovery dashboard aggregating advertised municipal bids, statuses, closing parameters, and awardee information.
              </p>
              
              {/* Context Disclaimer as required */}
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
                <span className="font-bold text-white">Legal Caveat:</span> CivicLens SA is a diagnostic and intelligence tool. It is not the issuing authority. Tender details are extracted from the National Treasury eTenders database. All bids must be validated directly with the respective municipality before formal submission.
              </div>
            </div>

            {/* Filter controls */}
            <div className="glass p-4 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative col-span-1 md:col-span-2">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search tenders by keyword or Bid ID..." 
                  value={tenderSearch}
                  onChange={(e) => setTenderSearch(e.target.value)}
                  className="w-full glass-input pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <select 
                  value={tenderCategory} 
                  onChange={(e) => setTenderCategory(e.target.value)}
                  className="w-full glass-input py-2 px-3 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All" className="bg-slate-900 text-white">All Categories</option>
                  <option value="Infrastructure" className="bg-slate-900 text-white">Infrastructure</option>
                  <option value="Professional Services" className="bg-slate-900 text-white">Professional Services</option>
                  <option value="ICT" className="bg-slate-900 text-white">ICT</option>
                  <option value="Water & Sanitation" className="bg-slate-900 text-white">Water & Sanitation</option>
                  <option value="General" className="bg-slate-900 text-white">General</option>
                </select>
              </div>

              <div>
                <select 
                  value={tenderStatus} 
                  onChange={(e) => setTenderStatus(e.target.value)}
                  className="w-full glass-input py-2 px-3 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All" className="bg-slate-900 text-white">All Statuses</option>
                  <option value="Open" className="bg-slate-900 text-white">Open</option>
                  <option value="Closed" className="bg-slate-900 text-white">Closed</option>
                  <option value="Awarded" className="bg-slate-900 text-white">Awarded</option>
                  <option value="Cancelled" className="bg-slate-900 text-white">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Tenders Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredTenders.length > 0 ? (
                filteredTenders.map((tender) => (
                  <div key={tender.id} className="glass p-6 shadow-xl text-left flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">{tender.id}</span>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            tender.category === 'Water & Sanitation' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            tender.category === 'Infrastructure' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                            tender.category === 'ICT' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 
                            'bg-white/5 text-slate-300 border-white/10'
                          }`}>
                            {tender.category}
                          </span>
                        </div>
                        
                        <span className={`text-xs font-bold font-mono uppercase px-2.5 py-1 rounded-md border ${
                          tender.status === 'Open' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          tender.status === 'Closed' ? 'bg-white/5 text-slate-300 border-white/10' :
                          tender.status === 'Awarded' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {tender.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-white leading-snug">{tender.title}</h4>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{tender.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4 mt-4 text-[11px]">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-slate-400">
                        <span>Organ of State: <strong className="text-white">{tender.issuingEntity}</strong></span>
                        {tender.estimatedValue && (
                          <span>Estimated: <strong className="text-white">R {(tender.estimatedValue / 1000000).toFixed(1)}M</strong></span>
                        )}
                        {tender.awardee && (
                          <span>Awardee: <strong className="text-indigo-300">{tender.awardee}</strong></span>
                        )}
                        <span>Published: <strong className="text-white">{formatDate(tender.publishedAt)}</strong></span>
                        <span>Closing Date: <strong className="text-rose-400">{formatDate(tender.closingAt)}</strong></span>
                      </div>

                      <a 
                        href={tender.sourceUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-semibold hover:underline cursor-pointer"
                      >
                        Official Download
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass p-12 text-center text-slate-400">
                  <p className="font-bold text-white">No procurement notices matched your filters.</p>
                  <p className="text-xs mt-1">Try resetting the status, category, or keyword queries.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 5: GOVERNANCE & AUDIT TRAIL (GOVERNANCE LENS) */}
        {activeTab === "governance" && (
          <div className="space-y-8">
            
            {/* Header */}
            <div className="glass p-6 shadow-xl text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full font-bold uppercase border border-indigo-500/30">Auditor-General Audits</span>
                <h3 className="text-xl font-bold font-display text-white mt-2">Governance Diagnostics & Unlawful Spending Trail</h3>
                <p className="text-xs text-slate-300 mt-1">Track historic compliance ratings and reported Unauthorized, Irregular, Fruitless and Wasteful (UIFW) expenditure.</p>
              </div>

              <button
                onClick={() => generateAISummary("governance")}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                AI Auditor Summary
              </button>
            </div>

            {/* Audit Opinion Timeline Visualizer (High Craftsmanship) */}
            <div className="glass p-6 shadow-xl text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono mb-6">Auditor-General opinion Timeline</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {muniAudits.map((audit, idx) => {
                  let badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
                  let circleColor = "bg-rose-500";
                  if (audit.opinionCode === "CLEAN") {
                    badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
                    circleColor = "bg-emerald-600";
                  } else if (audit.opinionCode === "UNQUALIFIED_FINDINGS") {
                    badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
                    circleColor = "bg-amber-500";
                  }
                  
                  return (
                    <div key={audit.year} className="relative p-5 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-bold font-mono text-white">{audit.year} Cycle</span>
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md border ${badgeColor}`}>
                            {audit.opinionCode === "CLEAN" ? "Clean Audit" : "Findings"}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white">{audit.opinionLabel}</p>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          Auditopinion declared in compliance with the Municipal Finance Management Act (MFMA).
                        </p>
                      </div>

                      <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">AGSA Report</span>
                        <a 
                          href={audit.reportUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                        >
                          Official PDF
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* UIFW Audit Expenditure Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* unauthorized */}
              <div className="glass p-6 shadow-xl text-left flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono flex items-center justify-between">
                    <span>unauthorized expenditure</span>
                    <span className="bg-rose-500/20 text-rose-300 text-[8px] font-bold px-1.5 rounded uppercase font-mono border border-rose-500/30">Unlawful</span>
                  </h4>
                  <p className="text-2xl font-extrabold font-mono text-white mt-3">
                    R {(latestAudit ? latestAudit.unauthorizedExpenditure / 1000000 : 0).toFixed(1)}M
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Reported in the {latestAudit?.year} Cycle.</p>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    Expenditure that was not budgeted for, or that exceeded the allocations voted for by the municipal council.
                  </p>
                </div>
                <div className="border-t border-white/5 pt-3 mt-4 text-[9px] font-mono text-slate-400">
                  Sourced: AGSA MFMA Annexure Table
                </div>
              </div>

              {/* irregular */}
              <div className="glass p-6 shadow-xl text-left flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono flex items-center justify-between">
                    <span>irregular expenditure</span>
                    <span className="bg-rose-500/20 text-rose-300 text-[8px] font-bold px-1.5 rounded uppercase font-mono border border-rose-500/30">SCM Deficit</span>
                  </h4>
                  <p className="text-2xl font-extrabold font-mono text-white mt-3">
                    R {(latestAudit ? latestAudit.irregularExpenditure / 1000000 : 0).toFixed(1)}M
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Reported in the {latestAudit?.year} Cycle.</p>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    Expenditure incurred in violation of municipal supply chain management policies, or applicable local laws.
                  </p>
                </div>
                <div className="border-t border-white/5 pt-3 mt-4 text-[9px] font-mono text-slate-400">
                  Sourced: AGSA MFMA Annexure Table
                </div>
              </div>

              {/* fruitless & wasteful */}
              <div className="glass p-6 shadow-xl text-left flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono flex items-center justify-between">
                    <span>fruitless & wasteful</span>
                    <span className="bg-rose-500/20 text-rose-300 text-[8px] font-bold px-1.5 rounded uppercase font-mono border border-rose-500/30">Lost funds</span>
                  </h4>
                  <p className="text-2xl font-extrabold font-mono text-white mt-3">
                    R {(latestAudit ? latestAudit.fruitlessWastefulExpenditure / 1000000 : 0).toFixed(1)}M
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Reported in the {latestAudit?.year} Cycle.</p>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    Expenditure made in vain and which would have been avoided had reasonable care been exercised (e.g., interest/penalties).
                  </p>
                </div>
                <div className="border-t border-white/5 pt-3 mt-4 text-[9px] font-mono text-slate-400">
                  Sourced: AGSA MFMA Annexure Table
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 6: ELECTIONS & WARD CONTEXT */}
        {activeTab === "elections" && (
          <div className="space-y-8">
            
            {/* Header info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-left">
              <h3 className="text-xl font-bold font-display text-slate-950 flex items-center gap-2">
                <Vote className="w-5 h-5 text-emerald-600" />
                ElectionLens — Historical Vote Share & Ward Demographics
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore Electoral Commission (IEC) vote allocations alongside local Ward diagnostics sourced from Census 2022.
              </p>
            </div>

            {/* IEC Election Outcomes stacked bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-4">2021 Municipal Election outcomes for {selectedMuni.name}</h4>
              
              {electionsData[selectedMuniCode] ? (
                <div className="space-y-6">
                  {/* stacked voter turnout header */}
                  <div className="flex flex-wrap gap-6 font-mono text-xs text-slate-600">
                    <div>
                      <span>Registered Voters: </span>
                      <strong className="text-slate-900">{electionsData[selectedMuniCode].registeredVoters.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>Actual Turnout: </span>
                      <strong className="text-emerald-700">{electionsData[selectedMuniCode].turnoutPercent}%</strong>
                    </div>
                  </div>

                  {/* High Quality Stacked Party Share Visualizer */}
                  <div>
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-2">Party proportional Share Allocation</p>
                    <div className="w-full bg-slate-100 h-8 rounded-lg overflow-hidden flex shadow-inner">
                      {electionsData[selectedMuniCode].parties.map((p, idx) => (
                        <div 
                          key={idx} 
                          className={`${p.color} h-full transition-all hover:brightness-95 cursor-help relative group`}
                          style={{ width: `${p.percentage}%` }}
                        >
                          {/* Hover tooltip */}
                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono p-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow">
                            <span className="font-bold">{p.party}</span>: {p.percentage}% ({p.votes.toLocaleString()} votes)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Party grid legend */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {electionsData[selectedMuniCode].parties.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                        <span className={`w-3.5 h-3.5 rounded ${p.color} block`} />
                        <div className="flex-1 flex justify-between">
                          <span className="font-medium text-slate-700">{p.party}</span>
                          <span className="font-bold font-mono text-slate-900">{p.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-mono">No election outcomes loaded for this metropolitan area.</p>
              )}
            </div>

            {/* Ward-level demographic details */}
            <div className="glass border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-left relative overflow-hidden bg-slate-950/25">
              
              {/* Outer decorative light highlights */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-6 border-b border-white/5 relative z-10">
                <div>
                  <h4 className="text-base font-bold uppercase font-mono tracking-wider text-indigo-300 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    Ward Diagnostics & Local Service Profiles
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Cross-reference census service delivery rates with municipal ward allocations.
                  </p>
                </div>

                {/* View Mode Toggle & Selector container */}
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                  
                  {/* Mode Selector Switch */}
                  <div className="bg-slate-900/80 border border-white/10 p-1 rounded-2xl flex items-center shadow-inner">
                    <button 
                      onClick={() => setIsCompareMode(false)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${!isCompareMode ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      Single Ward
                    </button>
                    <button 
                      onClick={() => setIsCompareMode(true)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${isCompareMode ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      Split-View Compare
                    </button>
                  </div>

                  {/* Single Ward Dropdown Selector (Only visible if not in compare mode) */}
                  {!isCompareMode && (
                    <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-2xl px-3 py-1.5 shadow">
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Select Ward:</span>
                      <select 
                        value={selectedWardNumber} 
                        onChange={(e) => setSelectedWardNumber(e.target.value)}
                        className="bg-transparent border-0 text-white text-xs font-bold focus:outline-none focus:ring-0 font-mono cursor-pointer [&>option]:bg-[#131a26] [&>option]:text-white focus:ring-transparent"
                      >
                        {(wardLevelData[selectedMuniCode] || []).map((w) => (
                          <option key={w.wardNumber} value={w.wardNumber}>
                            {w.wardNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                </div>
              </div>

              {/* RENDER VIEW */}
              {!isCompareMode ? (
                /* SINGLE WARD VIEW */
                wardLevelData[selectedMuniCode]?.find(w => w.wardNumber === selectedWardNumber) ? (
                  (() => {
                    const ward = wardLevelData[selectedMuniCode].find(w => w.wardNumber === selectedWardNumber)!;
                    
                    const pWater = parsePercent(ward.waterSupply);
                    const pSanitation = parsePercent(ward.sanitation);
                    const pPower = parsePercent(ward.electricity);

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        
                        {/* Ward metadata card */}
                        <div className="bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/8 space-y-4 hover:border-white/15 transition-all shadow-md">
                          <div className="flex items-start justify-between border-b border-white/5 pb-3">
                            <div>
                              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Ward Councillor</p>
                              <p className="text-base font-bold text-white mt-1">{ward.councillor}</p>
                              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full font-mono font-extrabold uppercase mt-2 inline-block">
                                Party: {ward.party}
                              </span>
                            </div>
                            <span className="text-xs bg-white/5 text-slate-300 px-2.5 py-1 rounded-xl font-mono">
                              {ward.wardNumber.split(" ")[0]}
                            </span>
                          </div>

                          <div>
                            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Total Residents</p>
                            <p className="text-2xl font-bold text-indigo-300 font-mono mt-1">{ward.population.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Census 2022 dataset</p>
                          </div>
                        </div>

                        {/* Census indicators with beautiful progress bars */}
                        <div className="bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/8 space-y-5 hover:border-white/15 transition-all shadow-md">
                          <p className="text-xs text-slate-300 uppercase font-mono font-extrabold tracking-wider border-b border-white/5 pb-2">Household Service Ratios</p>
                          
                          <div className="space-y-4 text-xs">
                            {/* Water Supply */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                                  <Droplet className="w-3.5 h-3.5 text-blue-400" />
                                  Piped Water Supply:
                                </span>
                                <strong className="text-white font-mono">{ward.waterSupply}</strong>
                              </div>
                              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: `${pWater}%` }} />
                              </div>
                            </div>

                            {/* Sanitation */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                                  Sanitation Connection:
                                </span>
                                <strong className="text-white font-mono">{ward.sanitation}</strong>
                              </div>
                              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full" style={{ width: `${pSanitation}%` }} />
                              </div>
                            </div>

                            {/* Power grid */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                                  Power Grid Access:
                                </span>
                                <strong className="text-white font-mono">{ward.electricity}</strong>
                              </div>
                              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full" style={{ width: `${pPower}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Turnout results */}
                        <div className="bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/8 space-y-4 hover:border-white/15 transition-all shadow-md">
                          <p className="text-xs text-slate-300 uppercase font-mono font-extrabold tracking-wider border-b border-white/5 pb-2">2021 Turnout & Ward Vote</p>
                          
                          <div className="space-y-3.5 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-300">Voted Turnout:</span>
                              <strong className="text-white font-mono text-sm">{ward.turnout2021}%</strong>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${ward.turnout2021}%` }} />
                            </div>

                            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                              <span className="text-slate-300">Leading Ward Party:</span>
                              <span className="bg-white/5 text-white font-bold font-mono px-2 py-1 rounded-lg">
                                {ward.leadingParty2021}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-slate-400 font-mono text-center py-6">Select a ward to display demographics and diagnostic access rates.</p>
                )
              ) : (
                /* SPLIT-VIEW COMPARE MODE */
                (() => {
                  const wards = wardLevelData[selectedMuniCode] || [];
                  const wardA = wards.find(w => w.wardNumber === selectedWardNumber) || wards[0];
                  const wardB = wards.find(w => w.wardNumber === compareWardNumber) || wards[1] || wards[0];

                  if (!wardA || !wardB) {
                    return <p className="text-xs text-slate-400 font-mono text-center py-6">Insufficient ward records available for comparison.</p>;
                  }

                  const pWaterA = parsePercent(wardA.waterSupply);
                  const pWaterB = parsePercent(wardB.waterSupply);
                  
                  const pSanitationA = parsePercent(wardA.sanitation);
                  const pSanitationB = parsePercent(wardB.sanitation);

                  const pPowerA = parsePercent(wardA.electricity);
                  const pPowerB = parsePercent(wardB.electricity);

                  return (
                    <div className="space-y-6 relative z-10">
                      
                      {/* Compare Selection Dropdowns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/30 p-4 rounded-2xl border border-white/5">
                        {/* Selector A */}
                        <div className="flex items-center justify-between gap-3 bg-slate-950/40 border border-indigo-500/20 rounded-xl px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                            <span className="text-xs text-slate-400 font-bold uppercase font-mono">Ward A:</span>
                          </div>
                          <select 
                            value={selectedWardNumber} 
                            onChange={(e) => setSelectedWardNumber(e.target.value)}
                            className="bg-transparent border-0 text-white text-xs font-bold focus:outline-none focus:ring-0 font-mono cursor-pointer [&>option]:bg-[#131a26] [&>option]:text-white max-w-[200px]"
                          >
                            {wards.map((w) => (
                              <option key={w.wardNumber} value={w.wardNumber}>
                                {w.wardNumber}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Selector B */}
                        <div className="flex items-center justify-between gap-3 bg-slate-950/40 border border-purple-500/20 rounded-xl px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                            <span className="text-xs text-slate-400 font-bold uppercase font-mono">Ward B:</span>
                          </div>
                          <select 
                            value={compareWardNumber} 
                            onChange={(e) => setCompareWardNumber(e.target.value)}
                            className="bg-transparent border-0 text-white text-xs font-bold focus:outline-none focus:ring-0 font-mono cursor-pointer [&>option]:bg-[#131a26] [&>option]:text-white max-w-[200px]"
                          >
                            {wards.map((w) => (
                              <option key={w.wardNumber} value={w.wardNumber}>
                                {w.wardNumber}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Side-by-Side Metadata Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Ward A Info */}
                        <div className="bg-slate-900/50 border border-indigo-500/15 p-5 rounded-2xl shadow-md flex justify-between items-center hover:border-indigo-500/30 transition-all">
                          <div>
                            <span className="text-[9px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                              WARD A Profile
                            </span>
                            <h5 className="text-sm font-bold text-white mt-2 truncate max-w-[220px]">{wardA.wardNumber}</h5>
                            <p className="text-xs text-slate-400 mt-1">Councillor: <strong className="text-slate-200">{wardA.councillor}</strong> ({wardA.party})</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase font-mono block">Residents</span>
                            <strong className="text-xl font-mono text-indigo-300">{wardA.population.toLocaleString()}</strong>
                          </div>
                        </div>

                        {/* Ward B Info */}
                        <div className="bg-slate-900/50 border border-purple-500/15 p-5 rounded-2xl shadow-md flex justify-between items-center hover:border-purple-500/30 transition-all">
                          <div>
                            <span className="text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                              WARD B Profile
                            </span>
                            <h5 className="text-sm font-bold text-white mt-2 truncate max-w-[220px]">{wardB.wardNumber}</h5>
                            <p className="text-xs text-slate-400 mt-1">Councillor: <strong className="text-slate-200">{wardB.councillor}</strong> ({wardB.party})</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase font-mono block">Residents</span>
                            <strong className="text-xl font-mono text-purple-300">{wardB.population.toLocaleString()}</strong>
                          </div>
                        </div>

                      </div>

                      {/* Main Comparative Benchmark metrics section */}
                      <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <h5 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-300">
                            Service Delivery Benchmark Analytics
                          </h5>
                          <span className="text-[10px] text-slate-400 font-mono">Higher is better</span>
                        </div>

                        <div className="space-y-6 text-xs">
                          {/* 1. Water supply comparison */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-200 font-bold flex items-center gap-1.5 text-sm">
                                <Droplet className="w-4 h-4 text-blue-400" />
                                Piped Water Access Ratio
                              </span>
                              {renderComparisonBadge(wardA.waterSupply, wardB.waterSupply)}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Ward A Bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-mono">
                                  <span className="text-slate-400">Ward A:</span>
                                  <strong className="text-indigo-300">{wardA.waterSupply}</strong>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pWaterA}%` }} />
                                </div>
                              </div>
                              {/* Ward B Bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-mono">
                                  <span className="text-slate-400">Ward B:</span>
                                  <strong className="text-purple-300">{wardB.waterSupply}</strong>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${pWaterB}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 2. Sanitation connection comparison */}
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-200 font-bold flex items-center gap-1.5 text-sm">
                                <Layers className="w-4 h-4 text-teal-400" />
                                Sanitation & Sewer Connections
                              </span>
                              {renderComparisonBadge(wardA.sanitation, wardB.sanitation)}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Ward A Bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-mono">
                                  <span className="text-slate-400">Ward A:</span>
                                  <strong className="text-indigo-300">{wardA.sanitation}</strong>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pSanitationA}%` }} />
                                </div>
                              </div>
                              {/* Ward B Bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-mono">
                                  <span className="text-slate-400">Ward B:</span>
                                  <strong className="text-purple-300">{wardB.sanitation}</strong>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${pSanitationB}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 3. Power grid access comparison */}
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-200 font-bold flex items-center gap-1.5 text-sm">
                                <Zap className="w-4 h-4 text-amber-400" />
                                Electrical Grid Infrastructure
                              </span>
                              {renderComparisonBadge(wardA.electricity, wardB.electricity)}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Ward A Bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-mono">
                                  <span className="text-slate-400">Ward A:</span>
                                  <strong className="text-indigo-300">{wardA.electricity}</strong>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pPowerA}%` }} />
                                </div>
                              </div>
                              {/* Ward B Bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-mono">
                                  <span className="text-slate-400">Ward B:</span>
                                  <strong className="text-purple-300">{wardB.electricity}</strong>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${pPowerB}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 4. Voter turnout comparison */}
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-200 font-bold flex items-center gap-1.5 text-sm">
                                <Vote className="w-4 h-4 text-emerald-400" />
                                2021 Election Voter Turnout & Leading Party
                              </span>
                              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                IEC 2021 Outcomes
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                              {/* Ward A Voter & Party */}
                              <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                                <div>
                                  <span className="text-slate-400 text-[10px] font-mono block">WARD A TURNOUT</span>
                                  <strong className="text-sm font-mono text-indigo-300">{wardA.turnout2021}%</strong>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400 text-[10px] font-mono block">LEADING PARTY</span>
                                  <span className="bg-white/5 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px] mt-0.5 inline-block">
                                    {wardA.leadingParty2021}
                                  </span>
                                </div>
                              </div>

                              {/* Ward B Voter & Party */}
                              <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                                <div>
                                  <span className="text-slate-400 text-[10px] font-mono block">WARD B TURNOUT</span>
                                  <strong className="text-sm font-mono text-purple-300">{wardB.turnout2021}%</strong>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400 text-[10px] font-mono block">LEADING PARTY</span>
                                  <span className="bg-white/5 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px] mt-0.5 inline-block">
                                    {wardB.leadingParty2021}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  );
                })()
              )}

            </div>

          </div>
        )}

        {/* TAB 7: DOCUMENT LENS PILOT SEARCH */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-left">
              <h3 className="text-xl font-bold font-display text-slate-950 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                DocumentLens — Strategic Evidence Retrieval
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Search page-level excerpts and paragraphs from whitelisted IDPs, municipal budgets, and Auditor-General report PDFs.
              </p>
            </div>

            {/* Search Input bar */}
            <form onSubmit={handleDocSearch} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Enter strategic keywords (e.g., 'Eskom', 'water', 'Clean Audit', 'capital', 'sanitation')..." 
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Search Documents
              </button>
            </form>

            {/* Document search results listing */}
            <div className="space-y-4">
              {hasSearchedDocs ? (
                docSearchResults.length > 0 ? (
                  docSearchResults.map((chunk) => (
                    <div key={chunk.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-left space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded">
                            {chunk.docType}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{chunk.title} ({chunk.year})</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                          Page {chunk.pageNumber}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-xs text-slate-700 uppercase font-mono tracking-wider">{chunk.heading}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-emerald-500 pl-3">
                        &ldquo;...{chunk.text}...&rdquo;
                      </p>

                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-50">
                        <span>Citation Reference: <strong>{chunk.citationLabel}</strong></span>
                        <span className="bg-slate-100 text-slate-600 px-1 rounded uppercase font-bold">OCR Indexed Chunk</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                    <p className="font-bold">No strategic citations matched your query.</p>
                    <p className="text-xs mt-1">Try searching with keywords like &ldquo;Eskom&rdquo;, &ldquo;capital&rdquo;, &ldquo;clean&rdquo;, or &ldquo;water&rdquo;.</p>
                  </div>
                )
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                  <p className="font-bold">Strategic Document Library Ready</p>
                  <p className="text-xs mt-1">Submit a search term to find page-aware, cited excerpts across municipal publications.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 8: SOURCE REGISTRY, DATA FRESHNESS AND CALCULATIONS (SOURCES & METHODOLOGY) */}
        {activeTab === "sources" && (
          <div className="space-y-8">
            
            {/* Header info */}
            <div className="glass p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-left relative overflow-hidden bg-slate-950/25 border border-white/10 rounded-3xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-bold uppercase border border-emerald-500/20">Data Integrity Protocol</span>
                <h3 className="text-xl font-bold font-display text-white mt-2 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Live Source Connections & Ingestion Orchestrator
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  CivicLens SA values absolute trace-awareness. Monitor pipeline status, test live API connectivity, and run on-demand database ingestion cycles.
                </p>
              </div>
            </div>

            {/* LIVE INGESTION ORCHESTRATOR & CONNECTIONS CONSOLE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Ingestion Controller Panel */}
              <div className="glass p-6 shadow-xl text-left bg-slate-950/20 border border-white/10 rounded-3xl lg:col-span-1 flex flex-col justify-between">
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      Ingestion Controller
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Trigger pipeline runs and configure real-time municipal ingestion.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Source Selector */}
                    <div>
                      <label className="block text-[10px] font-bold font-mono uppercase text-slate-400 mb-1.5">Target Pipeline</label>
                      <select
                        value={selectedIngestionSource}
                        onChange={(e) => setSelectedIngestionSource(e.target.value)}
                        className="w-full bg-slate-900/80 border border-white/10 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono [&>option]:bg-[#131a26] cursor-pointer"
                      >
                        <option value="all">ALL PIPELINES (Cascade)</option>
                        <option value="municipal_money">Municipal Money API</option>
                        <option value="agsa_mfma">Auditor-General MFMA</option>
                        <option value="etenders_portal">eTenders Portal</option>
                        <option value="stats_sa_census">Stats SA Census 2022</option>
                        <option value="iec_results">IEC Results Portal</option>
                      </select>
                    </div>

                    {/* Keep Ingestion Active Option */}
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="pr-2">
                        <span className="text-xs font-bold text-white block">Continuous Daemon Sync</span>
                        <span className="text-[10px] text-slate-400 font-mono">Run automated cron updates</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoSyncCascade}
                        onChange={(e) => setAutoSyncCascade(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-6">
                  <button
                    onClick={() => executeIngestion(selectedIngestionSource)}
                    disabled={isIngesting}
                    className={`w-full text-xs font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isIngesting 
                        ? "bg-indigo-600/40 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 ${isIngesting ? "animate-spin" : ""}`} />
                    {isIngesting ? "Processing Ingestion..." : "Run Live Ingestion Now"}
                  </button>
                  <p className="text-[10px] text-slate-400 font-mono text-center mt-2">
                    Auto-Sync Interval: Every 6 hours {autoSyncCascade ? "● ACTIVE" : "● PAUSED"}
                  </p>
                </div>
              </div>

              {/* Log Console Output Terminal */}
              <div className="glass p-6 shadow-xl text-left bg-slate-950/40 border border-white/10 rounded-3xl lg:col-span-2 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    BFF Ingestion Daemon Terminal
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-400 uppercase">ONLINE</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 rounded-xl p-4 border border-white/5 font-mono text-xs text-slate-300 h-64 overflow-y-auto space-y-1.5 shadow-inner select-text">
                  {ingestionLogs.map((log, idx) => {
                    let color = "text-slate-300";
                    if (log.includes("Success")) color = "text-emerald-400";
                    else if (log.includes("Warning") || log.includes("Error") || log.includes("Exception")) color = "text-rose-400";
                    else if (log.includes("Initializing") || log.includes("Connecting")) color = "text-indigo-400";
                    return (
                      <div key={idx} className={`${color} leading-relaxed break-all`}>
                        {log}
                      </div>
                    );
                  })}
                  {isIngesting && (
                    <div className="text-indigo-400 animate-pulse flex items-center gap-1">
                      <span>&gt; Ingesting dataset streams and executing integrity cascade...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2.5">
                  <span>SYSTEM FEEDBACK STACK</span>
                  <button 
                    onClick={() => setIngestionLogs([`[${new Date().toLocaleTimeString()}] Console logs cleared by administrator.`])}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Clear Console
                  </button>
                </div>
              </div>

            </div>

            {/* Official Source registry */}
            <div className="glass p-6 sm:p-8 shadow-xl text-left bg-slate-950/25 border border-white/10 rounded-3xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Registry of Verified Official Ingestions
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sourceRegistryList.map((src) => {
                  const statusInfo = connectionStatuses[src.id] || { status: "unchecked" };
                  
                  return (
                    <div key={src.id} className="p-5 bg-slate-950/30 rounded-2xl border border-white/5 space-y-3 flex flex-col justify-between hover:border-indigo-500/20 transition-all">
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">{src.id}</span>
                            <h5 className="font-bold text-sm text-white">{src.name}</h5>
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full uppercase border border-emerald-500/20">
                            {src.class}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono">
                          <div>
                            <span className="text-slate-400">Owner:</span> <strong className="text-slate-200">{src.owner}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Update Cadence:</span> <strong className="text-slate-200">{src.cadence}</strong>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-slate-400">Reference:</span>{" "}
                            <a href={src.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-0.5">
                              {src.url.replace("https://", "")} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                        
                        <p className="text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-2.5">{src.notes}</p>
                      </div>

                      {/* Connection Diagnostic Button and status display */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-4 mt-1">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          {statusInfo.status === "unchecked" && (
                            <span className="text-slate-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                              Unchecked
                            </span>
                          )}
                          {statusInfo.status === "testing" && (
                            <span className="text-indigo-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                              Connecting...
                            </span>
                          )}
                          {statusInfo.status === "connected" && (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              Online ({statusInfo.latency}ms)
                            </span>
                          )}
                          {statusInfo.status === "failed" && (
                            <span className="text-rose-400 flex items-center gap-1" title={statusInfo.error}>
                              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                              Offline
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => testSourceConnection(src.id)}
                          disabled={statusInfo.status === "testing"}
                          className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-mono font-bold py-1 px-2.5 rounded-lg transition-colors border border-white/10 cursor-pointer"
                        >
                          Test Connection
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Indicator Calculation Explainer */}
            <div className="glass p-6 sm:p-8 shadow-xl text-left bg-slate-950/25 border border-white/10 rounded-3xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono mb-4 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-400" />
                Calculations & Indicators Formulas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
                <div className="space-y-2.5 p-5 bg-slate-950/30 rounded-2xl border border-white/5">
                  <h5 className="font-bold font-display text-sm text-white">Cash Coverage Weeks Formula</h5>
                  <p className="leading-relaxed">
                    Determined relative to basic operating expenditures to establish a buffer ratio.
                  </p>
                  <p className="font-mono bg-slate-950/60 p-3 rounded-xl border border-white/5 font-bold text-emerald-400">
                    Ratio = Available Cash & Equivalents / ((Operating Expenditures - Depreciation) / 52)
                  </p>
                </div>

                <div className="space-y-2.5 p-5 bg-slate-950/30 rounded-2xl border border-white/5">
                  <h5 className="font-bold font-display text-sm text-white">Creditor Ageing Pressure Formula</h5>
                  <p className="leading-relaxed">
                    Details the percentage of bulk creditor invoices (like water and electricity) remaining unpaid over 90 days.
                  </p>
                  <p className="font-mono bg-slate-950/60 p-3 rounded-xl border border-white/5 font-bold text-amber-400">
                    Ratio = (Invoices unpaid over 90 Days / Total Creditor Balances) * 100
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Floating Watchlist Quick Bar (Footer level) */}
      <AnimatePresence>
        {watchlist.length > 0 && (
          <motion.div 
            initial={{ y: 80, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 80, x: "-50%", opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-2xl w-[92%] glass backdrop-blur-xl border border-white/10 p-4 z-45 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-wrap items-center justify-between gap-4 rounded-3xl hover:border-indigo-500/20 hover:shadow-indigo-500/5 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30 font-bold">Active Watchlist</span>
              <p className="text-xs font-medium text-slate-200">
                You are currently watching: <span className="font-bold text-indigo-300 font-mono">{watchlist.join(", ")}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setActiveTab("overview");
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/20"
              >
                Configure
              </button>
              <button 
                onClick={() => toggleWatchlist(selectedMuniCode)}
                className="text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-1"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: MOCK AUTHENTICATION FORM */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full text-left relative"
          >
            <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              Sign In to CivicLens SA
            </h3>
            <p className="text-xs text-slate-500 mt-1">Register or access watchlists and alert warning triggers instantly.</p>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold font-mono uppercase text-slate-500 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. tshepiso@civiclens.co.za"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-mono uppercase text-slate-500 mb-1">Security Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer text-center"
                >
                  Verify Access
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* DRAWER: AI-ASSISTED SUMMARY DRAWER (GEMINI GROUNDED) */}
      <AnimatePresence>
        {showSummaryDrawer && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex justify-end">
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between text-left relative"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-bold font-display text-slate-950">
                      AI Diagnostic Evaluation
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowSummaryDrawer(false)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-950 cursor-pointer p-1"
                  >
                    Close
                  </button>
                </div>

                {/* Info block */}
                <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-lg flex items-start gap-2 text-xs text-emerald-800 mb-4">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div>
                    <span className="font-bold">Grounded & Traceable:</span> This brief is synthesized exclusively using the loaded Municipal IDP, capital budgets, and official Auditor-General outcome metrics. No unsupported claims or values are generated.
                  </div>
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                  {aiLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                      <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                      <p className="text-xs font-mono">Synthesizing municipal evidence with Gemini...</p>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                      
                      {/* Rich summary block */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <span className="bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase inline-block mb-3">
                          AI-Assisted summary
                        </span>
                        
                        {/* Rendering simulated/live gemini content with citation highlights */}
                        <div className="space-y-3 whitespace-pre-wrap font-sans text-slate-800">
                          {aiSummary}
                        </div>
                      </div>

                      {/* Cited Sources list */}
                      {aiGroundingDocs.length > 0 && (
                        <div className="space-y-2 border-t border-slate-100 pt-3">
                          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Supporting Source Citations</p>
                          <div className="space-y-1.5">
                            {aiGroundingDocs.map((doc, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200 text-[10px] font-mono">
                                <span className="text-slate-700 truncate max-w-[280px]">
                                  {doc.title} (Page {doc.pageNumber})
                                </span>
                                <span className="text-emerald-700 font-bold">{doc.citation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>

              {/* Drawer footer */}
              <div className="border-t border-slate-100 pt-4 mt-6 text-center">
                <p className="text-[10px] font-mono text-slate-400">
                  Model: gemini-3.5-flash • Verified: 2026-07-02
                </p>
                <button 
                  onClick={() => setShowSummaryDrawer(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg mt-3 transition-colors cursor-pointer"
                >
                  Understood & Close Brief
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
