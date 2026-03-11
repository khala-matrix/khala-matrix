package model

import "time"

type MarketStat struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Value string `json:"value"`
	Delta string `json:"delta"`
}

type Topic struct {
	ID              string   `json:"id"`
	Title           string   `json:"title"`
	Domain          string   `json:"domain"`
	Summary         string   `json:"summary"`
	HeatScore       int      `json:"heatScore"`
	WeeklyGrowthPct float64  `json:"weeklyGrowthPercent"`
	Maturity        string   `json:"maturity"`
	NotableSignals  []string `json:"notableSignals"`
	UpdatedAt       string   `json:"updatedAt"`
}

type BriefingItem struct {
	ID       string `json:"id"`
	Date     string `json:"date"`
	Headline string `json:"headline"`
	Impact   string `json:"impact"`
}

type SourceFeed struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Type          string `json:"type"`
	URL           string `json:"url"`
	LastCheckedAt string `json:"lastCheckedAt"`
}

type PageConfig struct {
	Headline    string
	Subheadline string
	Watchlist   []string
	UpdatedAt   time.Time
}

type HotTopicsPageData struct {
	GeneratedAt string         `json:"generatedAt"`
	Headline    string         `json:"headline"`
	Subheadline string         `json:"subheadline"`
	Stats       []MarketStat   `json:"stats"`
	Topics      []Topic        `json:"topics"`
	Briefing    []BriefingItem `json:"briefing"`
	Watchlist   []string       `json:"watchlist"`
	Sources     []SourceFeed   `json:"sources"`
}
