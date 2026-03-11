export type TopicMaturity = "emerging" | "scaling" | "mainstream";

export type MarketStat = {
  id: string;
  label: string;
  value: string;
  delta: string;
};

export type Topic = {
  id: string;
  title: string;
  domain: string;
  summary: string;
  heatScore: number;
  weeklyGrowthPercent: number;
  maturity: TopicMaturity;
  notableSignals: string[];
  updatedAt: string;
};

export type BriefingItem = {
  id: string;
  date: string;
  headline: string;
  impact: string;
};

export type SourceFeed = {
  id: string;
  name: string;
  type: "paper" | "product" | "policy" | "market";
  url: string;
  lastCheckedAt: string;
};

export type HotTopicsPageData = {
  generatedAt: string;
  headline: string;
  subheadline: string;
  stats: MarketStat[];
  topics: Topic[];
  briefing: BriefingItem[];
  watchlist: string[];
  sources: SourceFeed[];
};

export type LoadedHotTopicsPageData = {
  mode: "mock" | "backend";
  data: HotTopicsPageData;
};
