package store

import (
	"context"
	"time"

	"github.com/khala-matrix/backend/internal/model"
)

func (s *Store) GetPageConfig(ctx context.Context) (*model.PageConfig, error) {
	row := s.pool.QueryRow(ctx,
		`SELECT headline, subheadline, watchlist, updated_at
		 FROM page_configs WHERE id = 'default'`)

	var pc model.PageConfig
	if err := row.Scan(&pc.Headline, &pc.Subheadline, &pc.Watchlist, &pc.UpdatedAt); err != nil {
		return nil, err
	}
	return &pc, nil
}

func (s *Store) ListTopics(ctx context.Context) ([]model.Topic, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, title, domain, summary, heat_score,
		        weekly_growth_percent, maturity, notable_signals, updated_at
		 FROM topics ORDER BY heat_score DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var topics []model.Topic
	for rows.Next() {
		var t model.Topic
		var updatedAt time.Time
		if err := rows.Scan(
			&t.ID, &t.Title, &t.Domain, &t.Summary,
			&t.HeatScore, &t.WeeklyGrowthPct, &t.Maturity,
			&t.NotableSignals, &updatedAt,
		); err != nil {
			return nil, err
		}
		t.UpdatedAt = updatedAt.Format(time.RFC3339)
		topics = append(topics, t)
	}
	return topics, rows.Err()
}

func (s *Store) ListMarketStats(ctx context.Context) ([]model.MarketStat, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, label, value, delta FROM market_stats ORDER BY sort_order`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []model.MarketStat
	for rows.Next() {
		var st model.MarketStat
		if err := rows.Scan(&st.ID, &st.Label, &st.Value, &st.Delta); err != nil {
			return nil, err
		}
		stats = append(stats, st)
	}
	return stats, rows.Err()
}

func (s *Store) ListBriefingItems(ctx context.Context) ([]model.BriefingItem, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, date, headline, impact FROM briefing_items ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []model.BriefingItem
	for rows.Next() {
		var b model.BriefingItem
		if err := rows.Scan(&b.ID, &b.Date, &b.Headline, &b.Impact); err != nil {
			return nil, err
		}
		items = append(items, b)
	}
	return items, rows.Err()
}

func (s *Store) ListSourceFeeds(ctx context.Context) ([]model.SourceFeed, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, name, type, url, last_checked_at FROM source_feeds ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var feeds []model.SourceFeed
	for rows.Next() {
		var f model.SourceFeed
		var lastChecked time.Time
		if err := rows.Scan(&f.ID, &f.Name, &f.Type, &f.URL, &lastChecked); err != nil {
			return nil, err
		}
		f.LastCheckedAt = lastChecked.Format(time.RFC3339)
		feeds = append(feeds, f)
	}
	return feeds, rows.Err()
}

func (s *Store) GetHotTopicsPageData(ctx context.Context) (*model.HotTopicsPageData, error) {
	pc, err := s.GetPageConfig(ctx)
	if err != nil {
		return nil, err
	}
	topics, err := s.ListTopics(ctx)
	if err != nil {
		return nil, err
	}
	stats, err := s.ListMarketStats(ctx)
	if err != nil {
		return nil, err
	}
	briefing, err := s.ListBriefingItems(ctx)
	if err != nil {
		return nil, err
	}
	sources, err := s.ListSourceFeeds(ctx)
	if err != nil {
		return nil, err
	}

	return &model.HotTopicsPageData{
		GeneratedAt: time.Now().UTC().Format(time.RFC3339),
		Headline:    pc.Headline,
		Subheadline: pc.Subheadline,
		Stats:       stats,
		Topics:      topics,
		Briefing:    briefing,
		Watchlist:   pc.Watchlist,
		Sources:     sources,
	}, nil
}
