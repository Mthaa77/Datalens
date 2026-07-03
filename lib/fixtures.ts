export interface Municipality {
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

export interface FinancialMetric {
  year: number;
  period: string; // "Q4" or "Annual"
  amountType: "Audited Actual" | "Reported Actual" | "Budget";
  cashCoverageWeeks: number; // e.g., 4.2 weeks
  creditorAgeingPressure: number; // % over 90 days
  debtorAgeingPressure: number; // % over 90 days
  repairsMaintenanceIntensity: number; // % of PPE value
  capitalBudgetSpent: number; // % of capital budget spent
  grantReliance: number; // % of total revenue
  uifwExpenditureRands: number; // Rands
}

export interface AuditOutcome {
  year: number;
  opinionCode: "CLEAN" | "UNQUALIFIED_FINDINGS" | "QUALIFIED" | "ADVERSE" | "DISCLAIMER";
  opinionLabel: string;
  reportUrl: string;
  unauthorizedExpenditure: number;
  irregularExpenditure: number;
  fruitlessWastefulExpenditure: number;
}

export interface TenderNotice {
  id: string;
  title: string;
  description: string;
  issuingEntity: string;
  issuingCode: string;
  category: "Infrastructure" | "Professional Services" | "ICT" | "Water & Sanitation" | "General";
  status: "Open" | "Closed" | "Awarded" | "Cancelled";
  publishedAt: string;
  closingAt: string;
  estimatedValue?: number;
  awardee?: string;
  sourceUrl: string;
}

export interface DocumentChunk {
  id: string;
  docType: "IDP" | "Budget" | "Annual Report" | "SDBIP";
  title: string;
  year: string;
  pageNumber: number;
  heading: string;
  text: string;
  citationLabel: string;
}

export interface ElectionResult {
  year: number;
  type: "Municipal" | "By-Election";
  turnoutPercent: number;
  registeredVoters: number;
  parties: {
    party: string;
    votes: number;
    percentage: number;
    color: string;
  }[];
}

export interface WardData {
  wardNumber: string;
  councillor: string;
  party: string;
  population: number;
  waterSupply: string; // e.g. "92% Piped water"
  sanitation: string; // e.g. "88% Flush toilets"
  electricity: string; // e.g. "95% Connected"
  turnout2021: number;
  leadingParty2021: string;
}

export const municipalitiesList: Municipality[] = [
  {
    code: "TSH",
    name: "City of Tshwane",
    type: "metropolitan",
    province: "Gauteng",
    boundaryVersion: "2026",
    population: 3275152,
    pipedWaterPercent: 88.5,
    flushToiletPercent: 84.2,
    electricityPercent: 91.0,
    officials: {
      mayor: "Cilliers Brink",
      municipalManager: "Johann Mettler",
      cfo: "Gareth Mnisi"
    }
  },
  {
    code: "JHB",
    name: "City of Johannesburg",
    type: "metropolitan",
    province: "Gauteng",
    boundaryVersion: "2026",
    population: 4803262,
    pipedWaterPercent: 93.1,
    flushToiletPercent: 89.4,
    electricityPercent: 92.5,
    officials: {
      mayor: "Dada Morero",
      municipalManager: "Floyd Brink",
      cfo: "Tebogo Moraka"
    }
  },
  {
    code: "CPT",
    name: "City of Cape Town",
    type: "metropolitan",
    province: "Western Cape",
    boundaryVersion: "2026",
    population: 4772846,
    pipedWaterPercent: 96.4,
    flushToiletPercent: 94.1,
    electricityPercent: 96.8,
    officials: {
      mayor: "Geordin Hill-Lewis",
      municipalManager: "Lungelo Mbandazayo",
      cfo: "Kevin Jacoby"
    }
  },
  {
    code: "EKU",
    name: "City of Ekurhuleni",
    type: "metropolitan",
    province: "Gauteng",
    boundaryVersion: "2026",
    population: 3379104,
    pipedWaterPercent: 91.2,
    flushToiletPercent: 86.8,
    electricityPercent: 90.3,
    officials: {
      mayor: "Nkosindiphile Xhakaza",
      municipalManager: "Imogen Mashazi",
      cfo: "Kagiso Lerutla"
    }
  },
  {
    code: "ETH",
    name: "eThekwini Metropolitan Municipality",
    type: "metropolitan",
    province: "KwaZulu-Natal",
    boundaryVersion: "2026",
    population: 3442361,
    pipedWaterPercent: 84.7,
    flushToiletPercent: 79.5,
    electricityPercent: 88.2,
    officials: {
      mayor: "Cyril Xaba",
      municipalManager: "Musa Mbhele",
      cfo: "Sandile Mnguni"
    }
  }
];

export const financialMetricsData: Record<string, FinancialMetric[]> = {
  TSH: [
    {
      year: 2025,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 2.1,
      creditorAgeingPressure: 45.3,
      debtorAgeingPressure: 67.2,
      repairsMaintenanceIntensity: 3.4,
      capitalBudgetSpent: 81.2,
      grantReliance: 18.5,
      uifwExpenditureRands: 2450000000
    },
    {
      year: 2024,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 1.8,
      creditorAgeingPressure: 48.9,
      debtorAgeingPressure: 65.0,
      repairsMaintenanceIntensity: 2.9,
      capitalBudgetSpent: 75.4,
      grantReliance: 19.1,
      uifwExpenditureRands: 2900000000
    },
    {
      year: 2023,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 0.8,
      creditorAgeingPressure: 55.4,
      debtorAgeingPressure: 61.1,
      repairsMaintenanceIntensity: 2.5,
      capitalBudgetSpent: 68.9,
      grantReliance: 20.3,
      uifwExpenditureRands: 3500000000
    }
  ],
  JHB: [
    {
      year: 2025,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 3.4,
      creditorAgeingPressure: 38.2,
      debtorAgeingPressure: 58.6,
      repairsMaintenanceIntensity: 3.8,
      capitalBudgetSpent: 84.5,
      grantReliance: 14.2,
      uifwExpenditureRands: 1890000000
    },
    {
      year: 2024,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 4.1,
      creditorAgeingPressure: 32.1,
      debtorAgeingPressure: 54.2,
      repairsMaintenanceIntensity: 4.1,
      capitalBudgetSpent: 88.0,
      grantReliance: 15.0,
      uifwExpenditureRands: 1540000000
    },
    {
      year: 2023,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 2.2,
      creditorAgeingPressure: 42.0,
      debtorAgeingPressure: 59.5,
      repairsMaintenanceIntensity: 3.2,
      capitalBudgetSpent: 72.1,
      grantReliance: 16.4,
      uifwExpenditureRands: 2300000000
    }
  ],
  CPT: [
    {
      year: 2025,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 12.4,
      creditorAgeingPressure: 4.5,
      debtorAgeingPressure: 15.2,
      repairsMaintenanceIntensity: 7.8,
      capitalBudgetSpent: 96.4,
      grantReliance: 10.8,
      uifwExpenditureRands: 12000000
    },
    {
      year: 2024,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 11.8,
      creditorAgeingPressure: 5.1,
      debtorAgeingPressure: 16.0,
      repairsMaintenanceIntensity: 7.5,
      capitalBudgetSpent: 94.2,
      grantReliance: 11.2,
      uifwExpenditureRands: 15000000
    },
    {
      year: 2023,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 13.1,
      creditorAgeingPressure: 3.9,
      debtorAgeingPressure: 14.8,
      repairsMaintenanceIntensity: 8.1,
      capitalBudgetSpent: 95.8,
      grantReliance: 11.5,
      uifwExpenditureRands: 8000000
    }
  ],
  EKU: [
    {
      year: 2025,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 4.2,
      creditorAgeingPressure: 28.5,
      debtorAgeingPressure: 45.8,
      repairsMaintenanceIntensity: 4.5,
      capitalBudgetSpent: 89.1,
      grantReliance: 22.1,
      uifwExpenditureRands: 890000000
    },
    {
      year: 2024,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 3.9,
      creditorAgeingPressure: 31.2,
      debtorAgeingPressure: 49.0,
      repairsMaintenanceIntensity: 4.2,
      capitalBudgetSpent: 86.4,
      grantReliance: 21.5,
      uifwExpenditureRands: 1120000000
    },
    {
      year: 2023,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 5.1,
      creditorAgeingPressure: 22.0,
      debtorAgeingPressure: 41.2,
      repairsMaintenanceIntensity: 4.9,
      capitalBudgetSpent: 91.2,
      grantReliance: 22.8,
      uifwExpenditureRands: 640000000
    }
  ],
  ETH: [
    {
      year: 2025,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 3.1,
      creditorAgeingPressure: 34.2,
      debtorAgeingPressure: 55.4,
      repairsMaintenanceIntensity: 4.8,
      capitalBudgetSpent: 82.3,
      grantReliance: 17.5,
      uifwExpenditureRands: 2100000000
    },
    {
      year: 2024,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 2.8,
      creditorAgeingPressure: 38.1,
      debtorAgeingPressure: 57.0,
      repairsMaintenanceIntensity: 4.2,
      capitalBudgetSpent: 78.5,
      grantReliance: 18.0,
      uifwExpenditureRands: 2450000000
    },
    {
      year: 2023,
      period: "Annual",
      amountType: "Audited Actual",
      cashCoverageWeeks: 3.5,
      creditorAgeingPressure: 29.8,
      debtorAgeingPressure: 51.2,
      repairsMaintenanceIntensity: 5.1,
      capitalBudgetSpent: 84.1,
      grantReliance: 18.9,
      uifwExpenditureRands: 1780000000
    }
  ]
};

export const auditOutcomesData: Record<string, AuditOutcome[]> = {
  TSH: [
    {
      year: 2025,
      opinionCode: "QUALIFIED",
      opinionLabel: "Qualified with findings",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2024-25/TSH_Audit_Report.pdf",
      unauthorizedExpenditure: 850000000,
      irregularExpenditure: 1450000000,
      fruitlessWastefulExpenditure: 150000000
    },
    {
      year: 2024,
      opinionCode: "QUALIFIED",
      opinionLabel: "Qualified with findings",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2023-24/TSH_Audit_Report.pdf",
      unauthorizedExpenditure: 900000000,
      irregularExpenditure: 1820000000,
      fruitlessWastefulExpenditure: 180000000
    },
    {
      year: 2023,
      opinionCode: "ADVERSE",
      opinionLabel: "Adverse opinion",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2022-23/TSH_Audit_Report.pdf",
      unauthorizedExpenditure: 1100000000,
      irregularExpenditure: 2200000000,
      fruitlessWastefulExpenditure: 200000000
    }
  ],
  JHB: [
    {
      year: 2025,
      opinionCode: "UNQUALIFIED_FINDINGS",
      opinionLabel: "Unqualified with findings",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2024-25/JHB_Audit_Report.pdf",
      unauthorizedExpenditure: 450000000,
      irregularExpenditure: 1240000000,
      fruitlessWastefulExpenditure: 200000000
    },
    {
      year: 2024,
      opinionCode: "UNQUALIFIED_FINDINGS",
      opinionLabel: "Unqualified with findings",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2023-24/JHB_Audit_Report.pdf",
      unauthorizedExpenditure: 320000000,
      irregularExpenditure: 1040000000,
      fruitlessWastefulExpenditure: 180000000
    },
    {
      year: 2023,
      opinionCode: "QUALIFIED",
      opinionLabel: "Qualified with findings",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2022-23/JHB_Audit_Report.pdf",
      unauthorizedExpenditure: 600000000,
      irregularExpenditure: 1500000000,
      fruitlessWastefulExpenditure: 200000000
    }
  ],
  CPT: [
    {
      year: 2025,
      opinionCode: "CLEAN",
      opinionLabel: "Clean Audit (Unqualified with no findings)",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2024-25/CPT_Audit_Report.pdf",
      unauthorizedExpenditure: 0,
      irregularExpenditure: 12000000,
      fruitlessWastefulExpenditure: 0
    },
    {
      year: 2024,
      opinionCode: "CLEAN",
      opinionLabel: "Clean Audit (Unqualified with no findings)",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2023-24/CPT_Audit_Report.pdf",
      unauthorizedExpenditure: 0,
      irregularExpenditure: 15000000,
      fruitlessWastefulExpenditure: 0
    },
    {
      year: 2023,
      opinionCode: "CLEAN",
      opinionLabel: "Clean Audit (Unqualified with no findings)",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2022-23/CPT_Audit_Report.pdf",
      unauthorizedExpenditure: 0,
      irregularExpenditure: 8000000,
      fruitlessWastefulExpenditure: 0
    }
  ],
  EKU: [
    {
      year: 2025,
      opinionCode: "UNQUALIFIED_FINDINGS",
      opinionLabel: "Unqualified with findings",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2024-25/EKU_Audit_Report.pdf",
      unauthorizedExpenditure: 120000000,
      irregularExpenditure: 650000000,
      fruitlessWastefulExpenditure: 120000000
    },
    {
      year: 2024,
      opinionCode: "UNQUALIFIED_FINDINGS",
      opinionLabel: "Unqualified with findings",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2023-24/EKU_Audit_Report.pdf",
      unauthorizedExpenditure: 150000000,
      irregularExpenditure: 850000000,
      fruitlessWastefulExpenditure: 120000000
    },
    {
      year: 2023,
      opinionCode: "CLEAN",
      opinionLabel: "Clean Audit (Unqualified with no findings)",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2022-23/EKU_Audit_Report.pdf",
      unauthorizedExpenditure: 0,
      irregularExpenditure: 520000000,
      fruitlessWastefulExpenditure: 120000000
    }
  ],
  ETH: [
    {
      year: 2025,
      opinionCode: "QUALIFIED",
      opinionLabel: "Qualified with findings",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2024-25/ETH_Audit_Report.pdf",
      unauthorizedExpenditure: 620000000,
      irregularExpenditure: 1320000000,
      fruitlessWastefulExpenditure: 160000000
    },
    {
      year: 2024,
      opinionCode: "QUALIFIED",
      opinionLabel: "Qualified with findings",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2023-24/ETH_Audit_Report.pdf",
      unauthorizedExpenditure: 750000000,
      irregularExpenditure: 1540000000,
      fruitlessWastefulExpenditure: 160000000
    },
    {
      year: 2023,
      opinionCode: "UNQUALIFIED_FINDINGS",
      opinionLabel: "Unqualified with findings",
      reportUrl: "https://www.agsa.co.za/Portals/0/MFMA2022-23/ETH_Audit_Report.pdf",
      unauthorizedExpenditure: 540000000,
      irregularExpenditure: 1120000000,
      fruitlessWastefulExpenditure: 120000000
    }
  ]
};

export const tendersData: TenderNotice[] = [
  {
    id: "TSH-INF-0021-2026",
    title: "Upgrade of Water Treatment Plant and Reservoirs at Bronkhorstspruit",
    description: "Tenders are hereby invited from experienced and qualified civil engineering contractors for the construction, mechanical upgrade, and electrical commission of the Bronkhorstspruit raw water treatment works.",
    issuingEntity: "City of Tshwane",
    issuingCode: "TSH",
    category: "Water & Sanitation",
    status: "Open",
    publishedAt: "2026-06-15T08:00:00Z",
    closingAt: "2026-07-25T12:00:00Z",
    estimatedValue: 45000000,
    sourceUrl: "https://www.etenders.gov.za/tender-details/TSH-INF-0021-2026"
  },
  {
    id: "JHB-ICT-1192-2026",
    title: "Provision of Enterprise Resource Planning (ERP) Cloud Integration Services",
    description: "Request for Proposals for the deployment, migration, integration, and user licensing of the unified municipal financial ERP software across all municipal entities and offices of Johannesburg.",
    issuingEntity: "City of Johannesburg",
    issuingCode: "JHB",
    category: "ICT",
    status: "Open",
    publishedAt: "2026-06-20T09:30:00Z",
    closingAt: "2026-07-30T11:00:00Z",
    estimatedValue: 120000000,
    sourceUrl: "https://www.etenders.gov.za/tender-details/JHB-ICT-1192-2026"
  },
  {
    id: "CPT-INF-0881-2026",
    title: "Civil Construction of Bus Rapid Transit (BRT) Dedicated Lanes Phase 2",
    description: "Formulation of dedicated transit lanes, pedestrian crossings, MyCiTi stations construction, road markings, and micro-surfacing works for the South-East Corridor route expansion.",
    issuingEntity: "City of Cape Town",
    issuingCode: "CPT",
    category: "Infrastructure",
    status: "Awarded",
    publishedAt: "2026-04-10T10:00:00Z",
    closingAt: "2026-05-15T12:00:00Z",
    estimatedValue: 280000000,
    awardee: "Stefanutti Stocks Joint Venture (Pty) Ltd",
    sourceUrl: "https://www.etenders.gov.za/tender-details/CPT-INF-0881-2026"
  },
  {
    id: "EKU-ENV-0044-2026",
    title: "Waste Collection and Landfill Gas Extraction Facility Maintenance",
    description: "Appointment of a service provider for the standard operation, active waste handling, environmental testing, and gas flaring maintenance at Simmer and Jack landfill sites.",
    issuingEntity: "City of Ekurhuleni",
    issuingCode: "EKU",
    category: "General",
    status: "Open",
    publishedAt: "2026-06-28T14:00:00Z",
    closingAt: "2026-07-28T12:00:00Z",
    estimatedValue: 18500000,
    sourceUrl: "https://www.etenders.gov.za/tender-details/EKU-ENV-0044-2026"
  },
  {
    id: "ETH-SAN-0052-2026",
    title: "Rehabilitation and De-sludging of Informal Settlement Sanitation Facilities",
    description: "Provision of vacuum tanker operations, chemical treatment, pipe replacement, and maintenance of community ablution blocks across key informal areas in eThekwini Metro.",
    issuingEntity: "eThekwini Metropolitan Municipality",
    issuingCode: "ETH",
    category: "Water & Sanitation",
    status: "Cancelled",
    publishedAt: "2026-05-02T08:00:00Z",
    closingAt: "2026-06-05T12:00:00Z",
    sourceUrl: "https://www.etenders.gov.za/tender-details/ETH-SAN-0052-2026"
  },
  {
    id: "CPT-SOL-0992-2026",
    title: "Supply, Installation and Commissioning of Rooftop Solar PV Systems",
    description: "Installation of commercial grid-interactive solar photovoltaic arrays on administrative and utility facility roofs of the City of Cape Town.",
    issuingEntity: "City of Cape Town",
    issuingCode: "CPT",
    category: "Infrastructure",
    status: "Open",
    publishedAt: "2026-07-01T08:00:00Z",
    closingAt: "2026-08-10T12:00:00Z",
    estimatedValue: 32000000,
    sourceUrl: "https://www.etenders.gov.za/tender-details/CPT-SOL-0992-2026"
  }
];

export const documentChunksData: DocumentChunk[] = [
  {
    id: "chunk_tsh_idp_1",
    docType: "IDP",
    title: "City of Tshwane Integrated Development Plan 2025/26",
    year: "2025/26",
    pageNumber: 42,
    heading: "Strategic Focus Area 1: Financial Stabilization and Creditor Settlement",
    text: "The primary strategic priority of the City is restoring financial soundness. Current obligations to bulk utilities Eskom and Rand Water are being addressed through negotiated payment arrangements. The City commits to settling all current Section 71 obligations within the legislated 30-day payment timeframe, aiming to lower the creditor pressure rating below 20% by the end of the Medium-Term Revenue and Expenditure Framework (MTREF) cycle.",
    citationLabel: "Tshwane IDP 2025/26, Page 42"
  },
  {
    id: "chunk_tsh_budget_1",
    docType: "Budget",
    title: "City of Tshwane Capital and Operational Budget Report",
    year: "2025/26",
    pageNumber: 15,
    heading: "Section 4: Capital Acquisitions Allocation",
    text: "Capital expenditure for the 2025/26 fiscal year is budgeted at R2.4 billion, reflecting a focus on critical infrastructure rehabilitation. Sanitation and water networks take R850 million, electrical distribution grids receive R720 million, and MyCiTi bus lane equivalents receive R310 million. Underperformance in the prior year's capital spending (at 81.2%) has prompted the establishment of an SCM fast-track project office.",
    citationLabel: "Tshwane Capital Budget 2025/26, Page 15"
  },
  {
    id: "chunk_cpt_annual_1",
    docType: "Annual Report",
    title: "City of Cape Town Annual Performance Report 2024/25",
    year: "2024/25",
    pageNumber: 88,
    heading: "Financial Discipline and Compliance Metrics",
    text: "The City maintained its Clean Audit opinion status for another year, with zero unauthorized or fruitless and wasteful expenditure. Irregular expenditure was minimized to R12 million (equivalent to 0.02% of total operational spend), all of which was referred to the Municipal Public Accounts Committee (MPAC) for prompt review. Cash coverage remains robust at 12.4 weeks, cushioning the city against revenue cyclicality.",
    citationLabel: "Cape Town Annual Report 2024/25, Page 88"
  },
  {
    id: "chunk_jhb_idp_1",
    docType: "IDP",
    title: "City of Johannesburg Growth & Development Strategy (IDP)",
    year: "2025/26",
    pageNumber: 104,
    heading: "Chapter 6: Informal Settlement Service Provisioning",
    text: "Our tactical targets for the ward electrification initiative aim to elevate informal settlement grid connectivity from 72.1% to 85% by 2028. Wards in Region D (Soweto) and Region G (Ennerdale) are identified as high-priority zones. Concurrently, communal flush-toilet modules are being introduced to transition settlements away from chemical toilets.",
    citationLabel: "Johannesburg IDP 2025/26, Page 104"
  }
];

export const electionsData: Record<string, ElectionResult> = {
  TSH: {
    year: 2021,
    type: "Municipal",
    turnoutPercent: 48.2,
    registeredVoters: 1620000,
    parties: [
      { party: "Democratic Alliance (DA)", votes: 312000, percentage: 32.0, color: "bg-blue-600" },
      { party: "African National Congress (ANC)", votes: 334000, percentage: 34.3, color: "bg-green-600" },
      { party: "Economic Freedom Fighters (EFF)", votes: 104000, percentage: 10.7, color: "bg-red-600" },
      { party: "ActionSA", votes: 84000, percentage: 8.6, color: "bg-emerald-500" },
      { party: "Freedom Front Plus (FF+)", votes: 76000, percentage: 7.8, color: "bg-orange-500" },
      { party: "Others", votes: 64000, percentage: 6.6, color: "bg-gray-400" }
    ]
  },
  JHB: {
    year: 2021,
    type: "Municipal",
    turnoutPercent: 46.5,
    registeredVoters: 2240000,
    parties: [
      { party: "African National Congress (ANC)", votes: 412000, percentage: 33.6, color: "bg-green-600" },
      { party: "Democratic Alliance (DA)", votes: 325000, percentage: 26.5, color: "bg-blue-600" },
      { party: "ActionSA", votes: 196000, percentage: 16.0, color: "bg-emerald-500" },
      { party: "Economic Freedom Fighters (EFF)", votes: 130000, percentage: 10.6, color: "bg-red-600" },
      { party: "Patriotic Alliance (PA)", votes: 39000, percentage: 3.2, color: "bg-amber-600" },
      { party: "Others", votes: 124000, percentage: 10.1, color: "bg-gray-400" }
    ]
  },
  CPT: {
    year: 2021,
    type: "Municipal",
    turnoutPercent: 47.8,
    registeredVoters: 2080000,
    parties: [
      { party: "Democratic Alliance (DA)", votes: 712000, percentage: 58.3, color: "bg-blue-600" },
      { party: "African National Congress (ANC)", votes: 226000, percentage: 18.5, color: "bg-green-600" },
      { party: "Economic Freedom Fighters (EFF)", votes: 50000, percentage: 4.1, color: "bg-red-600" },
      { party: "Good Party", votes: 46000, percentage: 3.8, color: "bg-orange-400" },
      { party: "Cape Coloured Congress (CCC)", votes: 34000, percentage: 2.8, color: "bg-violet-600" },
      { party: "Others", votes: 153000, percentage: 12.5, color: "bg-gray-400" }
    ]
  },
  EKU: {
    year: 2021,
    type: "Municipal",
    turnoutPercent: 44.9,
    registeredVoters: 1640000,
    parties: [
      { party: "African National Congress (ANC)", votes: 312000, percentage: 38.1, color: "bg-green-600" },
      { party: "Democratic Alliance (DA)", votes: 235000, percentage: 28.7, color: "bg-blue-600" },
      { party: "Economic Freedom Fighters (EFF)", votes: 110000, percentage: 13.5, color: "bg-red-600" },
      { party: "ActionSA", votes: 54000, percentage: 6.6, color: "bg-emerald-500" },
      { party: "Others", votes: 107000, percentage: 13.1, color: "bg-gray-400" }
    ]
  },
  ETH: {
    year: 2021,
    type: "Municipal",
    turnoutPercent: 43.1,
    registeredVoters: 1910000,
    parties: [
      { party: "African National Congress (ANC)", votes: 395000, percentage: 42.1, color: "bg-green-600" },
      { party: "Democratic Alliance (DA)", votes: 240000, percentage: 25.6, color: "bg-blue-600" },
      { party: "Economic Freedom Fighters (EFF)", votes: 101000, percentage: 10.8, color: "bg-red-600" },
      { party: "Inkatha Freedom Party (IFP)", votes: 67000, percentage: 7.1, color: "bg-red-800" },
      { party: "Others", votes: 134000, percentage: 14.4, color: "bg-gray-400" }
    ]
  }
};

export const wardLevelData: Record<string, WardData[]> = {
  TSH: [
    { wardNumber: "Ward 1 (Hammanskraal)", councillor: "Martha Ndlovu", party: "ANC", population: 24500, waterSupply: "74% Piped water", sanitation: "55% Flush toilets", electricity: "81% Connected", turnout2021: 44.2, leadingParty2021: "ANC" },
    { wardNumber: "Ward 59 (Sunnyside)", councillor: "Johan Kotze", party: "DA", population: 31200, waterSupply: "99% Piped water", sanitation: "98% Flush toilets", electricity: "98% Connected", turnout2021: 41.5, leadingParty2021: "DA" },
    { wardNumber: "Ward 101 (Mamelodi East)", councillor: "Sipho Zwane", party: "EFF", population: 28900, waterSupply: "81% Piped water", sanitation: "68% Flush toilets", electricity: "85% Connected", turnout2021: 46.8, leadingParty2021: "ANC" },
    { wardNumber: "Ward 42 (Centurion)", councillor: "Carla de Witt", party: "DA", population: 22000, waterSupply: "100% Piped water", sanitation: "99% Flush toilets", electricity: "99% Connected", turnout2021: 58.4, leadingParty2021: "DA" }
  ],
  JHB: [
    { wardNumber: "Ward 30 (Soweto)", councillor: "Thabo Molefe", party: "ANC", population: 29000, waterSupply: "91% Piped water", sanitation: "84% Flush toilets", electricity: "88% Connected", turnout2021: 48.1, leadingParty2021: "ANC" },
    { wardNumber: "Ward 117 (Parkhurst/Rosebank)", councillor: "Tim Truluck", party: "DA", population: 18500, waterSupply: "100% Piped water", sanitation: "99% Flush toilets", electricity: "100% Connected", turnout2021: 61.2, leadingParty2021: "DA" },
    { wardNumber: "Ward 60 (Hillbrow)", councillor: "Nkululeko Ndlovu", party: "ActionSA", population: 35000, waterSupply: "97% Piped water", sanitation: "95% Flush toilets", electricity: "93% Connected", turnout2021: 34.5, leadingParty2021: "DA" }
  ],
  CPT: [
    { wardNumber: "Ward 16 (Khayelitsha)", councillor: "Nomvuyo Dyantyi", party: "ANC", population: 42000, waterSupply: "82% Piped water", sanitation: "75% Flush toilets", electricity: "89% Connected", turnout2021: 43.1, leadingParty2021: "ANC" },
    { wardNumber: "Ward 58 (Claremont/Rondebosch)", councillor: "Ian Iversen", party: "DA", population: 24000, waterSupply: "100% Piped water", sanitation: "100% Flush toilets", electricity: "100% Connected", turnout2021: 68.5, leadingParty2021: "DA" },
    { wardNumber: "Ward 74 (Hout Bay)", councillor: "Roberto Quintas", party: "DA", population: 29500, waterSupply: "93% Piped water", sanitation: "89% Flush toilets", electricity: "92% Connected", turnout2021: 52.4, leadingParty2021: "DA" }
  ]
};

export const sourceRegistryList = [
  {
    id: "municipal_money",
    name: "Municipal Money API",
    owner: "National Treasury / OpenUp",
    url: "https://municipaldata.treasury.gov.za/",
    class: "A — Verified machine-readable",
    method: "Automated API connector",
    cadence: "Quarterly updates",
    notes: "Primary source for financial year observations,Section 71 submissions, and balance sheet indicators."
  },
  {
    id: "agsa_mfma",
    name: "Auditor-General MFMA Reports",
    owner: "Auditor-General South Africa (AGSA)",
    url: "https://www.agsa.co.za/",
    class: "B — Verified public document/download",
    method: "Structured manual PDF ingest & audit opinions map",
    cadence: "Annual release",
    notes: "Underpins governance outcomes, unauthorized, irregular, and fruitless/wasteful expenditure auditing."
  },
  {
    id: "etenders_portal",
    name: "eTenders Portal",
    owner: "National Treasury / OCPO",
    url: "https://www.etenders.gov.za/",
    class: "B — Verified public document/download",
    method: "Official export / manual CSV import fallback",
    cadence: "Daily checks",
    notes: "Houses procurement opportunities, tender category codes, closing dates, and final award records."
  },
  {
    id: "stats_sa_census",
    name: "Census 2022 Data",
    owner: "Statistics South Africa",
    url: "https://census.statssa.gov.za/",
    class: "B — Verified public document/download",
    method: "Curated official downloads & geographic mapping",
    cadence: "Periodic (multi-year)",
    notes: "Provides baseline populations, ward-level water access, sanitation connectivity, and electrification indices."
  },
  {
    id: "iec_results",
    name: "IEC Results Portal",
    owner: "Electoral Commission of South Africa (IEC)",
    url: "https://results.elections.org.za/",
    class: "B — Verified public document/download",
    method: "Official report imports (Excel/CSV)",
    cadence: "Event-driven",
    notes: "Details turnout percentages, valid votes cast, party share, and ward representation patterns."
  }
];
