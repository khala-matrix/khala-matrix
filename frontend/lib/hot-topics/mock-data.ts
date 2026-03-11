import { HotTopicsPageData } from "./types";

export const MOCK_HOT_TOPICS_PAGE_DATA: HotTopicsPageData = {
  generatedAt: "2026-03-11T07:35:00.000Z",
  headline: "AI Domain Hot Topics",
  subheadline:
    "A daily operating view of where AI attention, capital, and product velocity are moving.",
  stats: [
    {
      id: "active-domains",
      label: "Active domains tracked",
      value: "18",
      delta: "+3 this month",
    },
    {
      id: "weekly-signal-volume",
      label: "Weekly signal events",
      value: "1,247",
      delta: "+14.8% WoW",
    },
    {
      id: "enterprise-pilot-runs",
      label: "Enterprise pilot launches",
      value: "96",
      delta: "+11 pilots this week",
    },
    {
      id: "policy-shifts",
      label: "Policy updates monitored",
      value: "42",
      delta: "7 high-impact",
    },
  ],
  topics: [
    {
      id: "multimodal-models",
      title: "Multimodal foundation models",
      domain: "Model Platforms",
      summary:
        "Teams are shipping single-model pipelines for text, image, and video operations in production customer workflows.",
      heatScore: 93,
      weeklyGrowthPercent: 12.2,
      maturity: "mainstream",
      notableSignals: [
        "Cross-modal API bundling in major cloud SKUs",
        "Large benchmark gains on multi-turn visual reasoning",
        "Increased open-weight model releases with permissive licenses",
      ],
      updatedAt: "2026-03-10",
    },
    {
      id: "agent-orchestration",
      title: "Multi-agent orchestration",
      domain: "Agent Systems",
      summary:
        "Orchestrated specialist agents are replacing single-agent assistants in internal operations and support stacks.",
      heatScore: 89,
      weeklyGrowthPercent: 18.7,
      maturity: "scaling",
      notableSignals: [
        "Workflow reliability frameworks now include coordination traces",
        "Major tooling vendors added planner-worker-runtime abstractions",
        "Higher demand for policy-aware routing and approval gates",
      ],
      updatedAt: "2026-03-09",
    },
    {
      id: "on-device-ai",
      title: "On-device inference stacks",
      domain: "AI Infrastructure",
      summary:
        "Edge and mobile inference acceleration are driving low-latency private AI features across consumer products.",
      heatScore: 84,
      weeklyGrowthPercent: 10.6,
      maturity: "scaling",
      notableSignals: [
        "Model distillation pipelines integrated into CI",
        "NPU-optimized runtimes shipping in mainstream SDKs",
        "Offline-first copilots now part of premium plans",
      ],
      updatedAt: "2026-03-08",
    },
    {
      id: "governance-automation",
      title: "AI governance automation",
      domain: "Policy & Compliance",
      summary:
        "Policy-as-code and automated model review are becoming requirements for regulated deployments.",
      heatScore: 79,
      weeklyGrowthPercent: 8.1,
      maturity: "scaling",
      notableSignals: [
        "Procurement checklists now require model card lineage",
        "Audit evidence exports added to enterprise AI platforms",
        "Runtime guardrail monitoring tied to incident response",
      ],
      updatedAt: "2026-03-10",
    },
    {
      id: "synthetic-data-engines",
      title: "Synthetic data engines",
      domain: "Data Platforms",
      summary:
        "Synthetic datasets are being adopted to unblock low-data domains and privacy-sensitive training loops.",
      heatScore: 73,
      weeklyGrowthPercent: 6.5,
      maturity: "emerging",
      notableSignals: [
        "Healthcare pilots using synthetic augmentation for rare cases",
        "Vendors launching scenario simulators for model stress tests",
        "RFP language now requests synthetic quality metrics",
      ],
      updatedAt: "2026-03-07",
    },
  ],
  briefing: [
    {
      id: "brief-2026-03-11",
      date: "2026-03-11",
      headline: "Enterprises consolidate AI copilots into domain-specific suites",
      impact:
        "Procurement shifts from broad assistants toward workflow-native copilots with measurable unit economics.",
    },
    {
      id: "brief-2026-03-10",
      date: "2026-03-10",
      headline: "Global cloud providers expand managed agent runtime offerings",
      impact:
        "Standardized runtime contracts lower migration cost and accelerate ecosystem lock-in battles.",
    },
    {
      id: "brief-2026-03-09",
      date: "2026-03-09",
      headline: "Regulators publish draft reporting templates for high-risk AI",
      impact:
        "Compliance teams prepare structured evidence pipelines before mandatory filing windows open.",
    },
  ],
  watchlist: [
    "Model context protocol standardization progress",
    "Inference cost movement for long-context workloads",
    "Enterprise adoption of model routing gateways",
    "Policy changes affecting generative AI disclosure",
  ],
  sources: [
    {
      id: "source-arxiv",
      name: "arXiv AI",
      type: "paper",
      url: "https://arxiv.org/list/cs.AI/recent",
      lastCheckedAt: "2026-03-11T06:15:00.000Z",
    },
    {
      id: "source-cloud-updates",
      name: "Cloud AI Release Notes",
      type: "product",
      url: "https://cloud.google.com/release-notes",
      lastCheckedAt: "2026-03-11T05:00:00.000Z",
    },
    {
      id: "source-eu-policy",
      name: "EU AI Act Updates",
      type: "policy",
      url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
      lastCheckedAt: "2026-03-10T22:30:00.000Z",
    },
    {
      id: "source-market",
      name: "CB Insights AI Market",
      type: "market",
      url: "https://www.cbinsights.com/research/artificial-intelligence/",
      lastCheckedAt: "2026-03-10T20:00:00.000Z",
    },
  ],
};
